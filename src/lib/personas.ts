import { readFile } from "node:fs/promises";

export type Persona = {
  name: string;
  prefix: string;
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

    personas.push({ name, prefix });
  }

  return personas;
}

export async function loadPersonasFile(path: string): Promise<Persona[]> {
  const raw = await readFile(path, "utf8");
  return parsePersonasJson(raw);
}
