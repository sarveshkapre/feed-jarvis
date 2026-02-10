const MAX_FEED_SETS = 50;
const MAX_URLS_PER_SET = 100;
const MAX_NAME_CHARS = 80;
const MAX_URL_CHARS = 2048;

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
