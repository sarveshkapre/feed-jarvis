const MAX_RULE_PRESETS = 50;
const MAX_NAME_CHARS = 80;
const MAX_RULE_TEXT_CHARS = 240;
const MAX_UTM_CHARS = 120;

export const RULE_PRESETS_STORAGE_KEY = "feed-jarvis-studio:rule-presets:v1";

function normalizeName(raw) {
  const name = typeof raw === "string" ? raw.trim() : "";
  if (!name) return "";
  return name.length > MAX_NAME_CHARS ? name.slice(0, MAX_NAME_CHARS) : name;
}

function normalizeRuleText(raw) {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return "";
  return value.length > MAX_RULE_TEXT_CHARS
    ? value.slice(0, MAX_RULE_TEXT_CHARS)
    : value;
}

function normalizeUtmValue(raw) {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return "";
  return value.length > MAX_UTM_CHARS ? value.slice(0, MAX_UTM_CHARS) : value;
}

function normalizeRules(raw) {
  const input = raw && typeof raw === "object" ? raw : {};
  const prepend = normalizeRuleText(Reflect.get(input, "prepend"));
  const append = normalizeRuleText(Reflect.get(input, "append"));
  const hashtags = normalizeRuleText(Reflect.get(input, "hashtags"));

  const utmRaw = Reflect.get(input, "utm");
  const utmInput = utmRaw && typeof utmRaw === "object" ? utmRaw : {};
  const source = normalizeUtmValue(Reflect.get(utmInput, "source"));
  const medium = normalizeUtmValue(Reflect.get(utmInput, "medium"));
  const campaign = normalizeUtmValue(Reflect.get(utmInput, "campaign"));

  const utm =
    source || medium || campaign
      ? {
          source: source || undefined,
          medium: medium || undefined,
          campaign: campaign || undefined,
        }
      : undefined;

  if (!prepend && !append && !hashtags && !utm) return undefined;

  return {
    prepend: prepend || undefined,
    append: append || undefined,
    hashtags: hashtags || undefined,
    utm,
  };
}

export function parseRulePresets(raw) {
  if (!raw || typeof raw !== "string") return [];

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  const out = [];
  for (const entry of parsed.slice(0, MAX_RULE_PRESETS)) {
    if (!entry || typeof entry !== "object") continue;

    const name = normalizeName(Reflect.get(entry, "name"));
    if (!name) continue;

    const rules = normalizeRules(Reflect.get(entry, "rules"));
    if (!rules) continue;

    const updatedAtRaw = Reflect.get(entry, "updatedAt");
    const updatedAt =
      typeof updatedAtRaw === "string" && updatedAtRaw.trim()
        ? updatedAtRaw.trim()
        : undefined;

    out.push({ name, rules, updatedAt });
  }

  return sortRulePresets(dedupeRulePresets(out));
}

export function serializeRulePresets(presets) {
  const normalized = Array.isArray(presets) ? presets : [];
  return JSON.stringify(
    normalized.slice(0, MAX_RULE_PRESETS).map((entry) => {
      const rules = normalizeRules(entry?.rules);
      return {
        name: normalizeName(entry?.name),
        rules: rules ?? {},
        updatedAt:
          typeof entry?.updatedAt === "string" && entry.updatedAt.trim()
            ? entry.updatedAt.trim()
            : undefined,
      };
    }),
  );
}

export function upsertRulePreset(presets, next) {
  const existing = Array.isArray(presets) ? presets : [];
  const name = normalizeName(next?.name);
  const rules = normalizeRules(next?.rules);
  if (!name || !rules) return sortRulePresets(existing);

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
    const entryRules = normalizeRules(entry.rules);
    if (!entryName || !entryRules) continue;

    if (entryName.toLowerCase() === key) {
      if (!replaced) {
        out.push({ name, rules, updatedAt });
        replaced = true;
      }
      continue;
    }

    out.push({
      name: entryName,
      rules: entryRules,
      updatedAt:
        typeof entry.updatedAt === "string" && entry.updatedAt.trim()
          ? entry.updatedAt.trim()
          : undefined,
    });
  }

  if (!replaced) out.push({ name, rules, updatedAt });
  return sortRulePresets(dedupeRulePresets(out));
}

export function removeRulePreset(presets, name) {
  const existing = Array.isArray(presets) ? presets : [];
  const needle = normalizeName(name);
  if (!needle) return sortRulePresets(existing);

  const key = needle.toLowerCase();
  const out = existing.filter((entry) => {
    const entryName = normalizeName(entry?.name);
    return entryName && entryName.toLowerCase() !== key;
  });

  return sortRulePresets(dedupeRulePresets(out));
}

function dedupeRulePresets(presets) {
  const seen = new Set();
  const out = [];

  for (const entry of presets) {
    const name = normalizeName(entry?.name);
    const rules = normalizeRules(entry?.rules);
    if (!name || !rules) continue;

    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    out.push({
      name,
      rules,
      updatedAt:
        typeof entry?.updatedAt === "string" && entry.updatedAt.trim()
          ? entry.updatedAt.trim()
          : undefined,
    });
  }

  return out;
}

function sortRulePresets(presets) {
  return [...presets].sort((a, b) =>
    String(a?.name ?? "").localeCompare(String(b?.name ?? "")),
  );
}
