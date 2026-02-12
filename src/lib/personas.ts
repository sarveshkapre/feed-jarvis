import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

export type Persona = {
  name: string;
  prefix: string;
  role?: string;
  style?: string;
  voice?: string;
  topics?: string[];
  prompt?: string;
};

export const DEFAULT_PERSONAS: Persona[] = [
  { name: "Analyst", prefix: "Analysis:" },
  { name: "Builder", prefix: "Build note:" },
];

export function getPersona(
  name: string,
  personas: Persona[] = DEFAULT_PERSONAS,
): Persona {
  const needle = name.toLowerCase();
  const found = personas.find((p) => p.name.toLowerCase() === needle);
  return found ?? { name, prefix: `${name}:` };
}

export function mergePersonas(
  base: Persona[],
  overrides: Persona[],
): Persona[] {
  const merged = base.map((p) => ({ ...p }));

  for (const override of overrides) {
    const overrideName = override.name.toLowerCase();
    const index = merged.findIndex(
      (p) => p.name.toLowerCase() === overrideName,
    );
    if (index === -1) {
      merged.push({ ...override });
    } else {
      merged[index] = { ...override };
    }
  }

  return merged;
}

export function parsePersonasJson(raw: string): Persona[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Invalid JSON: ${String(err)}`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Expected a JSON array of personas.");
  }

  const personas: Persona[] = [];
  for (let i = 0; i < parsed.length; i++) {
    const value = parsed[i];
    if (!value || typeof value !== "object") {
      throw new Error(`Invalid persona at index ${i}: expected an object.`);
    }

    const name = Reflect.get(value, "name");
    const prefix = Reflect.get(value, "prefix");
    if (typeof name !== "string" || typeof prefix !== "string") {
      throw new Error(
        `Invalid persona at index ${i}: expected string 'name' and 'prefix'.`,
      );
    }
    if (name.trim().length === 0 || prefix.trim().length === 0) {
      throw new Error(
        `Invalid persona at index ${i}: 'name' and 'prefix' must be non-empty.`,
      );
    }

    personas.push({ name: name.trim(), prefix: prefix.trim() });
  }

  return personas;
}

export async function loadPersonasFile(path: string): Promise<Persona[]> {
  const raw = await readFile(path, "utf8");
  if (isMarkdownFile(path)) {
    return [parsePersonaMarkdown(raw, path)];
  }
  return parsePersonasJson(raw);
}

export async function loadPersonasPath(pathValue: string): Promise<Persona[]> {
  const details = await stat(pathValue);
  if (!details.isDirectory()) {
    return loadPersonasFile(pathValue);
  }

  const entries = await readdir(pathValue, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && isMarkdownFile(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  if (files.length === 0) {
    throw new Error(
      `No markdown persona files found in directory '${pathValue}'.`,
    );
  }

  const out: Persona[] = [];
  const seen = new Set<string>();
  for (const name of files) {
    const fullPath = path.join(pathValue, name);
    const raw = await readFile(fullPath, "utf8");
    const persona = parsePersonaMarkdown(raw, fullPath);
    const key = persona.name.toLowerCase();
    if (seen.has(key)) {
      throw new Error(
        `Duplicate persona name '${persona.name}' found in '${pathValue}'.`,
      );
    }
    seen.add(key);
    out.push(persona);
  }

  return out;
}

export function parsePersonaMarkdown(
  raw: string,
  source = "persona.md",
): Persona {
  const meta = extractMarkdownMeta(raw);

  const headingName = extractHeadingName(raw);
  const name = pickFirst(meta.get("name"), meta.get("id"), headingName);
  if (!name) {
    throw new Error(
      `Invalid persona markdown '${source}': missing required field 'name'.`,
    );
  }

  const prefix = pickFirst(meta.get("prefix"), `${name}:`);
  const role = meta.get("role");
  const style = meta.get("style");
  const voice = meta.get("voice");
  const prompt = meta.get("prompt");
  const topics = parseList(meta.get("topics"));

  return {
    name,
    prefix,
    role: role || undefined,
    style: style || undefined,
    voice: voice || undefined,
    topics: topics.length > 0 ? topics : undefined,
    prompt: prompt || undefined,
  };
}

function isMarkdownFile(filename: string): boolean {
  const lower = filename.toLowerCase();
  return lower.endsWith(".md") || lower.endsWith(".markdown");
}

function parseList(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function pickFirst(...values: Array<string | undefined>): string {
  for (const value of values) {
    if (!value) continue;
    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }
  return "";
}

function extractHeadingName(raw: string): string | undefined {
  const lines = raw.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (!trimmed.startsWith("#")) return undefined;
    return trimmed.replace(/^#+\s*/, "").trim();
  }
  return undefined;
}

function extractMarkdownMeta(raw: string): Map<string, string> {
  const lines = raw.split(/\r?\n/);
  const meta = new Map<string, string>();
  let index = 0;

  while (index < lines.length && !lines[index]?.trim()) {
    index++;
  }

  if (lines[index]?.trim() === "---") {
    index++;
    while (index < lines.length && lines[index]?.trim() !== "---") {
      setMetaLine(meta, lines[index] ?? "");
      index++;
    }
    return meta;
  }

  for (const line of lines) {
    if (line.trim().length === 0) break;
    if (line.trim().startsWith("#")) continue;
    setMetaLine(meta, line);
  }

  return meta;
}

function setMetaLine(meta: Map<string, string>, line: string): void {
  const match = line.match(/^([a-zA-Z][a-zA-Z0-9_-]*)\s*:\s*(.+)$/);
  if (!match) return;
  const keyRaw = match[1];
  const valueRaw = match[2];
  if (!keyRaw || !valueRaw) return;
  const key = keyRaw.trim().toLowerCase();
  const value = valueRaw.trim();
  if (!value) return;
  meta.set(key, value);
}
