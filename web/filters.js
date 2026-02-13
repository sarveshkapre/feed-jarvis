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

function parseFilterToken(raw) {
  const value = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (!value) return null;

  if (value.startsWith("site:") || value.startsWith("domain:")) {
    const hostRaw = value.split(":").slice(1).join(":").trim();
    const host = normalizeHostname(hostRaw);
    if (!host) return null;
    return { kind: "site", value: host };
  }

  return { kind: "keyword", value };
}

function normalizeHostname(raw) {
  const candidate = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (!candidate) return "";

  const withoutPath = candidate.split("/")[0]?.trim() ?? "";
  const withoutPort = withoutPath.split(":")[0]?.trim() ?? "";
  const hostname = withoutPort.replace(/^\.+|\.+$/g, "");
  return hostname || "";
}

function getUrlContext(rawUrl) {
  if (typeof rawUrl !== "string") {
    return { urlLower: "", hostnameLower: "" };
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) return { urlLower: "", hostnameLower: "" };

  let hostnameLower = "";
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      hostnameLower = normalizeHostname(parsed.hostname);
    }
  } catch {
    hostnameLower = "";
  }

  return {
    urlLower: trimmed.toLowerCase(),
    hostnameLower,
  };
}

function matchesFilterToken(token, titleLower, urlLower, hostnameLower) {
  if (!token || typeof token !== "object") return false;
  if (token.kind === "site") {
    if (!hostnameLower) return false;
    return (
      hostnameLower === token.value || hostnameLower.endsWith(`.${token.value}`)
    );
  }

  if (!token.value) return false;
  return titleLower.includes(token.value) || urlLower.includes(token.value);
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
  const include = parseKeywordList(filters.include)
    .map(parseFilterToken)
    .filter((entry) => Boolean(entry));
  const exclude = parseKeywordList(filters.exclude)
    .map(parseFilterToken)
    .filter((entry) => Boolean(entry));
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
    const { urlLower, hostnameLower } = getUrlContext(item?.url);

    if (
      exclude.length &&
      exclude.some((token) =>
        matchesFilterToken(token, titleLower, urlLower, hostnameLower),
      )
    ) {
      return false;
    }
    if (
      include.length &&
      !include.some((token) =>
        matchesFilterToken(token, titleLower, urlLower, hostnameLower),
      )
    )
      return false;
    return true;
  });
}
