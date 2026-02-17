function parseTokens(raw) {
  if (typeof raw !== "string") return [];
  const seen = new Set();
  const out = [];
  for (const part of raw.split(/,|\n/)) {
    const token = part.trim();
    if (!token) continue;
    const key = token.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(token);
  }
  return out;
}

export function parseFilterTokens(filters) {
  const include = parseTokens(filters?.include);
  const exclude = parseTokens(filters?.exclude);

  return {
    include,
    exclude,
  };
}

export function removeFilterToken(raw, target) {
  const needle = typeof target === "string" ? target.trim().toLowerCase() : "";
  if (!needle) return typeof raw === "string" ? raw.trim() : "";

  return parseTokens(raw)
    .filter((token) => token.toLowerCase() !== needle)
    .join(", ");
}
