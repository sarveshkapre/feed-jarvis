import { XMLParser } from "fast-xml-parser";

type UnknownRecord = Record<string, unknown>;

export function parseOpmlUrls(opml: string, maxUrls = 200): string[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });

  let parsed: unknown;
  try {
    parsed = parser.parse(opml);
  } catch {
    return [];
  }

  const root = getObject(parsed);
  const opmlNode = root ? getObject(root.opml) : undefined;
  const body = opmlNode ? getObject(opmlNode.body) : undefined;
  if (!body) return [];

  const outlines = collectOutlines(body.outline);
  const seen = new Set<string>();
  const out: string[] = [];

  for (const outline of outlines) {
    const rawUrl =
      getText(outline["@_xmlUrl"]) ??
      getText(outline.xmlUrl) ??
      getText(outline["@_url"]) ??
      getText(outline.url) ??
      getText(outline["@_htmlUrl"]) ??
      getText(outline.htmlUrl) ??
      "";

    const normalized = normalizeFeedUrl(rawUrl);
    if (!normalized) continue;
    if (seen.has(normalized)) continue;

    seen.add(normalized);
    out.push(normalized);
    if (out.length >= Math.max(0, maxUrls)) break;
  }

  return out;
}

function collectOutlines(value: unknown): UnknownRecord[] {
  const roots = toArray(value)
    .map(getObject)
    .filter(Boolean) as UnknownRecord[];

  const out: UnknownRecord[] = [];
  for (const root of roots) {
    walkOutlines(root, out);
  }

  return out;
}

function walkOutlines(node: UnknownRecord, out: UnknownRecord[]) {
  out.push(node);
  const children = toArray(node.outline)
    .map(getObject)
    .filter(Boolean) as UnknownRecord[];
  for (const child of children) {
    walkOutlines(child, out);
  }
}

function normalizeFeedUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "";
    }
    return parsed.toString();
  } catch {
    return "";
  }
}

function getObject(value: unknown): UnknownRecord | undefined {
  if (!value || typeof value !== "object") return undefined;
  return value as UnknownRecord;
}

function getText(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);

  const obj = getObject(value);
  if (!obj) return undefined;
  const text = obj["#text"];
  return typeof text === "string" ? text : undefined;
}

function toArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return [];
  return [value];
}
