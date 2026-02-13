const CHANNELS = new Set(["x", "linkedin", "newsletter"]);

function coercePositiveInt(value) {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num) || num <= 0) return null;
  return Math.floor(num);
}

export function parseChannelMaxChars(raw) {
  if (typeof raw !== "string" || !raw.trim()) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const out = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (!CHANNELS.has(key)) continue;
      const next = coercePositiveInt(value);
      if (next === null) continue;
      out[key] = next;
    }
    return out;
  } catch {
    return {};
  }
}

export function serializeChannelMaxChars(map) {
  if (!map || typeof map !== "object") return "{}";
  const out = {};
  for (const [key, value] of Object.entries(map)) {
    if (!CHANNELS.has(key)) continue;
    const next = coercePositiveInt(value);
    if (next === null) continue;
    out[key] = next;
  }
  return JSON.stringify(out);
}

export function getMaxCharsForChannel(channel, savedByChannel, defaults) {
  if (!CHANNELS.has(channel)) return 280;
  const saved =
    savedByChannel && typeof savedByChannel === "object"
      ? Reflect.get(savedByChannel, channel)
      : null;
  const savedInt = coercePositiveInt(saved);
  if (savedInt !== null) return savedInt;
  const fallback =
    defaults && typeof defaults === "object"
      ? Reflect.get(defaults, channel)
      : null;
  const fallbackInt = coercePositiveInt(fallback);
  return fallbackInt ?? 280;
}

export function setMaxCharsForChannel(savedByChannel, channel, value) {
  if (!CHANNELS.has(channel)) return savedByChannel ?? {};
  const next = coercePositiveInt(value);
  if (next === null) return savedByChannel ?? {};
  const current =
    savedByChannel && typeof savedByChannel === "object"
      ? coercePositiveInt(Reflect.get(savedByChannel, channel))
      : null;
  if (current === next) return savedByChannel ?? {};
  return { ...(savedByChannel ?? {}), [channel]: next };
}

function coerceNonNegativeInt(value) {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num) || num < 0) return null;
  return Math.floor(num);
}

export function formatFetchSummary(summary, itemsCount, fallbackSources) {
  const items = coerceNonNegativeInt(itemsCount) ?? 0;
  const sources =
    summary && typeof summary === "object"
      ? coerceNonNegativeInt(Reflect.get(summary, "sources"))
      : null;
  const cache =
    summary && typeof summary === "object"
      ? coerceNonNegativeInt(Reflect.get(summary, "cache"))
      : null;
  const network =
    summary && typeof summary === "object"
      ? coerceNonNegativeInt(Reflect.get(summary, "network"))
      : null;
  const dedupe =
    summary && typeof summary === "object"
      ? Reflect.get(summary, "dedupe") === true
      : false;
  const deduped =
    summary && typeof summary === "object"
      ? coerceNonNegativeInt(Reflect.get(summary, "deduped"))
      : null;
  const limited =
    summary && typeof summary === "object"
      ? coerceNonNegativeInt(Reflect.get(summary, "limited"))
      : null;
  const concurrency =
    summary && typeof summary === "object"
      ? coerceNonNegativeInt(Reflect.get(summary, "concurrency"))
      : null;

  const feeds =
    sources ??
    (typeof fallbackSources === "number" && Number.isFinite(fallbackSources)
      ? Math.max(0, Math.floor(fallbackSources))
      : null) ??
    0;

  const parts = [];
  if (cache !== null && network !== null) {
    parts.push(`${cache} cache`, `${network} network`);
  }
  if (dedupe && deduped !== null && deduped > 0) {
    parts.push(`${deduped} deduped`);
  }
  if (limited !== null && limited > 0) {
    parts.push(`${limited} trimmed`);
  }
  if (concurrency !== null && concurrency > 0) {
    parts.push(`concurrency ${concurrency}`);
  }

  const detail = parts.length > 0 ? ` (${parts.join(", ")})` : "";
  return `Loaded ${items} item(s) from ${feeds} feed(s).${detail}`;
}
