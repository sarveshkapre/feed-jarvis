import { normalizeItemFilters } from "./filters.js";

const MAX_FILTER_PRESETS = 50;
const MAX_NAME_CHARS = 80;
const MAX_FILTER_TEXT_CHARS = 240;

export const FILTER_PRESETS_STORAGE_KEY =
  "feed-jarvis-studio:filter-presets:v1";

function normalizeName(raw) {
  const name = typeof raw === "string" ? raw.trim() : "";
  if (!name) return "";
  return name.length > MAX_NAME_CHARS ? name.slice(0, MAX_NAME_CHARS) : name;
}

function normalizeFilterText(raw) {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return "";
  return value.length > MAX_FILTER_TEXT_CHARS
    ? value.slice(0, MAX_FILTER_TEXT_CHARS)
    : value;
}

function normalizePresetFilters(raw) {
  const input = raw && typeof raw === "object" ? raw : {};
  const normalized = normalizeItemFilters({
    include: normalizeFilterText(Reflect.get(input, "include")),
    exclude: normalizeFilterText(Reflect.get(input, "exclude")),
    minTitleLength: Reflect.get(input, "minTitleLength"),
  });

  if (
    !normalized.include &&
    !normalized.exclude &&
    normalized.minTitleLength === 0
  ) {
    return undefined;
  }

  return normalized;
}

export function parseFilterPresets(raw) {
  if (!raw || typeof raw !== "string") return [];

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  const out = [];
  for (const entry of parsed.slice(0, MAX_FILTER_PRESETS)) {
    if (!entry || typeof entry !== "object") continue;
    const name = normalizeName(Reflect.get(entry, "name"));
    const filters = normalizePresetFilters(Reflect.get(entry, "filters"));
    if (!name || !filters) continue;

    const updatedAtRaw = Reflect.get(entry, "updatedAt");
    const updatedAt =
      typeof updatedAtRaw === "string" && updatedAtRaw.trim()
        ? updatedAtRaw.trim()
        : undefined;

    out.push({ name, filters, updatedAt });
  }

  return sortFilterPresets(dedupeFilterPresets(out));
}

export function serializeFilterPresets(presets) {
  const normalized = Array.isArray(presets) ? presets : [];
  return JSON.stringify(
    normalized.slice(0, MAX_FILTER_PRESETS).map((entry) => ({
      name: normalizeName(entry?.name),
      filters: normalizePresetFilters(entry?.filters) ?? {},
      updatedAt:
        typeof entry?.updatedAt === "string" && entry.updatedAt.trim()
          ? entry.updatedAt.trim()
          : undefined,
    })),
  );
}

export function upsertFilterPreset(presets, next) {
  const existing = Array.isArray(presets) ? presets : [];
  const name = normalizeName(next?.name);
  const filters = normalizePresetFilters(next?.filters);
  if (!name || !filters) return sortFilterPresets(existing);

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
    const entryFilters = normalizePresetFilters(entry.filters);
    if (!entryName || !entryFilters) continue;

    if (entryName.toLowerCase() === key) {
      if (!replaced) {
        out.push({ name, filters, updatedAt });
        replaced = true;
      }
      continue;
    }

    out.push({
      name: entryName,
      filters: entryFilters,
      updatedAt:
        typeof entry.updatedAt === "string" && entry.updatedAt.trim()
          ? entry.updatedAt.trim()
          : undefined,
    });
  }

  if (!replaced) out.push({ name, filters, updatedAt });
  return sortFilterPresets(dedupeFilterPresets(out));
}

export function removeFilterPreset(presets, name) {
  const existing = Array.isArray(presets) ? presets : [];
  const needle = normalizeName(name);
  if (!needle) return sortFilterPresets(existing);

  const key = needle.toLowerCase();
  const out = existing.filter((entry) => {
    const entryName = normalizeName(entry?.name);
    return entryName && entryName.toLowerCase() !== key;
  });

  return sortFilterPresets(dedupeFilterPresets(out));
}

export function mergeFilterPresets(existingPresets, incomingPresets) {
  const existing = Array.isArray(existingPresets) ? existingPresets : [];
  const incoming = Array.isArray(incomingPresets) ? incomingPresets : [];
  let merged = sortFilterPresets(dedupeFilterPresets(existing));

  for (const preset of incoming) {
    merged = upsertFilterPreset(merged, preset);
  }

  return sortFilterPresets(dedupeFilterPresets(merged));
}

function dedupeFilterPresets(presets) {
  const seen = new Set();
  const out = [];
  for (const entry of presets) {
    const name = normalizeName(entry?.name);
    const filters = normalizePresetFilters(entry?.filters);
    if (!name || !filters) continue;

    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    out.push({
      name,
      filters,
      updatedAt:
        typeof entry?.updatedAt === "string" && entry.updatedAt.trim()
          ? entry.updatedAt.trim()
          : undefined,
    });
  }
  return out;
}

function sortFilterPresets(presets) {
  return [...presets].sort((a, b) =>
    String(a?.name ?? "").localeCompare(String(b?.name ?? "")),
  );
}
