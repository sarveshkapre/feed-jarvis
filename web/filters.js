function parseKeywordList(raw) {
  if (typeof raw !== "string") return [];
  return raw
    .split(/,|\n/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function clampNonNegativeInteger(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.floor(num));
}

export function normalizeItemFilters(raw = {}) {
  return {
    include: typeof raw.include === "string" ? raw.include : "",
    exclude: typeof raw.exclude === "string" ? raw.exclude : "",
    minTitleLength: clampNonNegativeInteger(raw.minTitleLength),
  };
}

export function applyItemFilters(items, rawFilters = {}) {
  const filters = normalizeItemFilters(rawFilters);
  const include = parseKeywordList(filters.include).map((entry) =>
    entry.toLowerCase(),
  );
  const exclude = parseKeywordList(filters.exclude).map((entry) =>
    entry.toLowerCase(),
  );
  const minTitleLength = filters.minTitleLength;

  if (
    (!include.length && !exclude.length && minTitleLength === 0) ||
    !Array.isArray(items)
  ) {
    return Array.isArray(items) ? items : [];
  }

  return items.filter((item) => {
    const title = typeof item?.title === "string" ? item.title.trim() : "";
    if (!title) return false;
    if (minTitleLength > 0 && title.length < minTitleLength) return false;

    const titleLower = title.toLowerCase();
    if (exclude.length && exclude.some((needle) => titleLower.includes(needle)))
      return false;
    if (
      include.length &&
      !include.some((needle) => titleLower.includes(needle))
    )
      return false;
    return true;
  });
}
