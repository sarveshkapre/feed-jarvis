const CHANNELS = new Set(["x", "linkedin", "newsletter"]);
const SESSION_SOURCES = new Set(["feed", "json"]);
const SESSION_TEMPLATES = new Set(["straight", "takeaway", "cta"]);
const SESSION_MODES = new Set(["template", "llm"]);
const SESSION_AGENT_LAYOUTS = new Set(["rotating", "consensus"]);
const SESSION_STRING_FIELDS = [
  "feedUrls",
  "feedSetName",
  "maxItems",
  "fetchConcurrency",
  "jsonItems",
  "filterInclude",
  "filterExclude",
  "filterMinTitleLength",
  "filterPresetName",
  "personaName",
  "customPersonaName",
  "customPersonaPrefix",
  "personaSearch",
  "maxChars",
  "agentPersonaLimit",
  "agentPersonaNames",
  "agentPersonaMaxChars",
  "agentPersonaSearch",
  "rulePresetName",
  "rulePrepend",
  "ruleAppend",
  "ruleHashtags",
  "utmSource",
  "utmMedium",
  "utmCampaign",
  "llmModel",
];

function coercePositiveInt(value) {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num) || num <= 0) return null;
  return Math.floor(num);
}

function parseEnum(raw, allowed) {
  if (typeof raw !== "string") return undefined;
  return allowed.has(raw) ? raw : undefined;
}

export function parseStudioSessionSnapshot(raw) {
  if (typeof raw !== "string" || !raw.trim()) return null;
  let parsed = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }

  const snapshot = {};

  const source = parseEnum(Reflect.get(parsed, "source"), SESSION_SOURCES);
  if (source) snapshot.source = source;

  const channel = parseEnum(Reflect.get(parsed, "channel"), CHANNELS);
  if (channel) snapshot.channel = channel;

  const template = parseEnum(
    Reflect.get(parsed, "template"),
    SESSION_TEMPLATES,
  );
  if (template) snapshot.template = template;

  const generationMode = parseEnum(
    Reflect.get(parsed, "generationMode"),
    SESSION_MODES,
  );
  if (generationMode) snapshot.generationMode = generationMode;

  const agentLayout = parseEnum(
    Reflect.get(parsed, "agentLayout"),
    SESSION_AGENT_LAYOUTS,
  );
  if (agentLayout) snapshot.agentLayout = agentLayout;

  for (const key of SESSION_STRING_FIELDS) {
    const value = Reflect.get(parsed, key);
    if (typeof value === "string") {
      snapshot[key] = value;
    }
  }

  const dedupe = Reflect.get(parsed, "dedupe");
  if (typeof dedupe === "boolean") snapshot.dedupe = dedupe;
  const useCustomPersona = Reflect.get(parsed, "useCustomPersona");
  if (typeof useCustomPersona === "boolean") {
    snapshot.useCustomPersona = useCustomPersona;
  }
  const utmEnabled = Reflect.get(parsed, "utmEnabled");
  if (typeof utmEnabled === "boolean") snapshot.utmEnabled = utmEnabled;

  return snapshot;
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
  const failed =
    summary && typeof summary === "object"
      ? coerceNonNegativeInt(Reflect.get(summary, "failed"))
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
  const retryAttempts =
    summary && typeof summary === "object"
      ? coerceNonNegativeInt(Reflect.get(summary, "retryAttempts"))
      : null;
  const retrySuccesses =
    summary && typeof summary === "object"
      ? coerceNonNegativeInt(Reflect.get(summary, "retrySuccesses"))
      : null;
  const durationMs =
    summary && typeof summary === "object"
      ? coerceNonNegativeInt(Reflect.get(summary, "durationMs"))
      : null;
  const slowestFeedMs =
    summary && typeof summary === "object"
      ? coerceNonNegativeInt(Reflect.get(summary, "slowestFeedMs"))
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
  if (failed !== null && failed > 0) {
    parts.push(`${failed} failed`);
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
  if ((retryAttempts ?? 0) > 0 || (retrySuccesses ?? 0) > 0) {
    const attempts = retryAttempts ?? 0;
    const recovered = retrySuccesses ?? 0;
    parts.push(`retries ${attempts} (recovered ${recovered})`);
  }
  if (durationMs !== null && durationMs > 0) {
    parts.push(`duration ${durationMs}ms`);
  }
  if (slowestFeedMs !== null && slowestFeedMs > 0) {
    parts.push(`slowest ${slowestFeedMs}ms`);
  }

  const detail = parts.length > 0 ? ` (${parts.join(", ")})` : "";
  return `Loaded ${items} item(s) from ${feeds} feed(s).${detail}`;
}
