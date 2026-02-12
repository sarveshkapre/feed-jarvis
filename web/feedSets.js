const MAX_FEED_SETS = 50;
const MAX_URLS_PER_SET = 100;
const MAX_NAME_CHARS = 80;
const MAX_URL_CHARS = 2048;
const DEFAULT_IMPORTED_SET_NAME = "Imported feeds";
const MAX_OPML_OUTLINES = 5000;

export const FEED_SETS_STORAGE_KEY = "feed-jarvis-studio:feed-sets:v1";

function normalizeName(raw) {
  const name = typeof raw === "string" ? raw.trim() : "";
  if (!name) return "";
  return name.length > MAX_NAME_CHARS ? name.slice(0, MAX_NAME_CHARS) : name;
}

function normalizeUrls(raw) {
  const urls = Array.isArray(raw) ? raw : [];
  const cleaned = urls
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter((value) => value.length > 0 && value.length <= MAX_URL_CHARS)
    .slice(0, MAX_URLS_PER_SET);

  const seen = new Set();
  const out = [];
  for (const url of cleaned) {
    const key = url.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(url);
  }
  return out;
}

export function parseFeedSets(raw) {
  if (!raw || typeof raw !== "string") return [];

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  const out = [];
  for (const entry of parsed.slice(0, MAX_FEED_SETS)) {
    if (!entry || typeof entry !== "object") continue;
    const name = normalizeName(Reflect.get(entry, "name"));
    if (!name) continue;

    const urls = normalizeUrls(Reflect.get(entry, "urls"));
    if (urls.length === 0) continue;

    const updatedAtRaw = Reflect.get(entry, "updatedAt");
    const updatedAt =
      typeof updatedAtRaw === "string" && updatedAtRaw.trim()
        ? updatedAtRaw.trim()
        : undefined;

    out.push({ name, urls, updatedAt });
  }

  return sortFeedSets(dedupeFeedSets(out));
}

export function serializeFeedSets(sets) {
  const normalized = Array.isArray(sets) ? sets : [];
  return JSON.stringify(
    normalized.slice(0, MAX_FEED_SETS).map((entry) => ({
      name: normalizeName(entry?.name),
      urls: normalizeUrls(entry?.urls),
      updatedAt:
        typeof entry?.updatedAt === "string" && entry.updatedAt.trim()
          ? entry.updatedAt.trim()
          : undefined,
    })),
  );
}

export function upsertFeedSet(sets, next) {
  const existing = Array.isArray(sets) ? sets : [];
  const name = normalizeName(next?.name);
  const urls = normalizeUrls(next?.urls);
  if (!name || urls.length === 0) return sortFeedSets(existing);

  const updatedAt =
    typeof next?.updatedAt === "string" && next.updatedAt.trim()
      ? next.updatedAt.trim()
      : new Date().toISOString();

  const key = name.toLowerCase();
  const out = [];
  let replaced = false;
  for (const entry of existing) {
    if (!entry || typeof entry !== "object") continue;
    const entryName = normalizeName(entry.name);
    if (!entryName) continue;
    if (entryName.toLowerCase() === key) {
      if (!replaced) {
        out.push({ name, urls, updatedAt });
        replaced = true;
      }
      continue;
    }
    const entryUrls = normalizeUrls(entry.urls);
    if (entryUrls.length === 0) continue;
    out.push({
      name: entryName,
      urls: entryUrls,
      updatedAt:
        typeof entry.updatedAt === "string" && entry.updatedAt.trim()
          ? entry.updatedAt.trim()
          : undefined,
    });
  }

  if (!replaced) out.push({ name, urls, updatedAt });
  return sortFeedSets(dedupeFeedSets(out));
}

export function removeFeedSet(sets, name) {
  const existing = Array.isArray(sets) ? sets : [];
  const needle = normalizeName(name);
  if (!needle) return sortFeedSets(existing);
  const key = needle.toLowerCase();
  const out = existing.filter((entry) => {
    const entryName = normalizeName(entry?.name);
    return entryName && entryName.toLowerCase() !== key;
  });
  return sortFeedSets(dedupeFeedSets(out));
}

export function parseFeedSetsOpml(raw) {
  if (!raw || typeof raw !== "string") return [];

  const roots = parseOpmlOutlines(raw);
  if (roots.length === 0) return [];

  const importedSets = [];
  const flatUrls = [];
  let unnamedGroupCount = 0;

  for (const root of roots) {
    if (!root) continue;

    if (Array.isArray(root.children) && root.children.length > 0) {
      const urls = [];
      collectOutlineUrls(root, urls);
      if (urls.length === 0) continue;

      const fallbackName = `Imported set ${++unnamedGroupCount}`;
      const name = normalizeName(root.name || fallbackName);
      if (!name) continue;

      importedSets.push({ name, urls: normalizeUrls(urls) });
      continue;
    }

    if (root.url) {
      flatUrls.push(root.url);
    }
  }

  const normalizedFlatUrls = normalizeUrls(flatUrls);
  if (normalizedFlatUrls.length > 0) {
    importedSets.push({
      name: DEFAULT_IMPORTED_SET_NAME,
      urls: normalizedFlatUrls,
    });
  }

  return sortFeedSets(dedupeFeedSets(importedSets)).slice(0, MAX_FEED_SETS);
}

export function serializeFeedSetsAsOpml(sets) {
  const normalized = sortFeedSets(
    dedupeFeedSets(Array.isArray(sets) ? sets : []),
  )
    .slice(0, MAX_FEED_SETS)
    .map((entry) => ({
      name: normalizeName(entry?.name),
      urls: normalizeUrls(entry?.urls),
    }))
    .filter((entry) => entry.name && entry.urls.length > 0);

  const createdAt = new Date().toUTCString();
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<opml version="2.0">',
    "  <head>",
    "    <title>Feed Jarvis Studio Feed Sets</title>",
    `    <dateCreated>${escapeXmlText(createdAt)}</dateCreated>`,
    "  </head>",
    "  <body>",
  ];

  for (const set of normalized) {
    const nameAttr = escapeXmlAttr(set.name);
    lines.push(`    <outline text="${nameAttr}" title="${nameAttr}">`);

    for (const url of set.urls) {
      const label = escapeXmlAttr(formatOpmlFeedLabel(url));
      const urlAttr = escapeXmlAttr(url);
      lines.push(
        `      <outline type="rss" text="${label}" title="${label}" xmlUrl="${urlAttr}" />`,
      );
    }

    lines.push("    </outline>");
  }

  lines.push("  </body>");
  lines.push("</opml>");
  return `${lines.join("\n")}\n`;
}

function dedupeFeedSets(sets) {
  const seen = new Set();
  const out = [];
  for (const entry of sets) {
    const name = normalizeName(entry?.name);
    const urls = normalizeUrls(entry?.urls);
    if (!name || urls.length === 0) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      name,
      urls,
      updatedAt:
        typeof entry?.updatedAt === "string" && entry.updatedAt.trim()
          ? entry.updatedAt.trim()
          : undefined,
    });
  }
  return out;
}

function sortFeedSets(sets) {
  return [...sets].sort((a, b) =>
    String(a?.name ?? "").localeCompare(String(b?.name ?? "")),
  );
}

function parseOpmlOutlines(raw) {
  const outlines = [];
  const stack = [];
  const regex = /<outline\b([^>]*?)(\/?)>|<\/outline>/gi;

  let outlineCount = 0;
  while (true) {
    const match = regex.exec(raw);
    if (!match) break;

    if (match[0].startsWith("</")) {
      if (stack.length > 0) stack.pop();
      continue;
    }

    outlineCount += 1;
    if (outlineCount > MAX_OPML_OUTLINES) break;

    const attrs = parseOutlineAttrs(match[1] ?? "");
    const node = {
      name: resolveOutlineName(attrs),
      url: resolveOutlineUrl(attrs),
      children: [],
    };

    if (stack.length === 0) {
      outlines.push(node);
    } else {
      stack[stack.length - 1].children.push(node);
    }

    const selfClosing = match[2] === "/";
    if (!selfClosing) {
      stack.push(node);
    }
  }

  return outlines;
}

function parseOutlineAttrs(rawAttrs) {
  const attrs = {};
  const regex = /([A-Za-z_:@][-A-Za-z0-9_:.@]*)\s*=\s*("([^"]*)"|'([^']*)')/g;

  while (true) {
    const match = regex.exec(rawAttrs);
    if (!match) break;

    const key = String(match[1] || "").toLowerCase();
    const rawValue = match[3] ?? match[4] ?? "";
    attrs[key] = decodeXmlText(rawValue);
  }

  return attrs;
}

function resolveOutlineName(attrs) {
  const name =
    (typeof attrs.text === "string" ? attrs.text : "") ||
    (typeof attrs.title === "string" ? attrs.title : "");
  return normalizeName(name);
}

function resolveOutlineUrl(attrs) {
  const raw =
    (typeof attrs.xmlurl === "string" ? attrs.xmlurl : "") ||
    (typeof attrs.url === "string" ? attrs.url : "") ||
    (typeof attrs.htmlurl === "string" ? attrs.htmlurl : "");

  return normalizeHttpUrl(raw);
}

function normalizeHttpUrl(raw) {
  if (typeof raw !== "string") return "";
  const value = raw.trim();
  if (!value || value.length > MAX_URL_CHARS) return "";

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "";
    }
    return parsed.toString();
  } catch {
    return "";
  }
}

function collectOutlineUrls(node, out) {
  if (!node || typeof node !== "object") return;
  if (typeof node.url === "string" && node.url) {
    out.push(node.url);
  }
  if (!Array.isArray(node.children)) return;
  for (const child of node.children) {
    collectOutlineUrls(child, out);
  }
}

function formatOpmlFeedLabel(url) {
  try {
    const parsed = new URL(url);
    const path =
      parsed.pathname && parsed.pathname !== "/" ? parsed.pathname : "";
    const label = `${parsed.hostname}${path}`;
    return label.slice(0, 120);
  } catch {
    return String(url).slice(0, 120);
  }
}

function escapeXmlAttr(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("'", "&apos;");
}

function escapeXmlText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function decodeXmlText(value) {
  return String(value).replace(
    /&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi,
    (token, entity) => {
      const key = String(entity).toLowerCase();
      if (key === "amp") return "&";
      if (key === "lt") return "<";
      if (key === "gt") return ">";
      if (key === "quot") return '"';
      if (key === "apos") return "'";
      if (key.startsWith("#x")) {
        const code = Number.parseInt(key.slice(2), 16);
        if (!Number.isFinite(code)) return token;
        try {
          return String.fromCodePoint(code);
        } catch {
          return token;
        }
      }
      if (key.startsWith("#")) {
        const code = Number.parseInt(key.slice(1), 10);
        if (!Number.isFinite(code)) return token;
        try {
          return String.fromCodePoint(code);
        } catch {
          return token;
        }
      }
      return token;
    },
  );
}
