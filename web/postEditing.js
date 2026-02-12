function resolveMaxChars(raw) {
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return 280;
  return Math.max(1, Math.floor(value));
}

export function getPostLengthStatus(text, maxChars) {
  const safeText = typeof text === "string" ? text : String(text ?? "");
  const max = resolveMaxChars(maxChars);
  const length = safeText.length;
  const overBy = Math.max(0, length - max);
  return {
    length,
    maxChars: max,
    overBy,
    isOver: overBy > 0,
  };
}

export function trimPostToMaxChars(text, maxChars) {
  const safeText = typeof text === "string" ? text : String(text ?? "");
  const max = resolveMaxChars(maxChars);

  if (safeText.length <= max) return safeText;

  const normalized = safeText.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;

  const withBoundary = normalized.slice(0, max + 1);
  const lastSpace = withBoundary.lastIndexOf(" ");
  const cutoff = lastSpace >= Math.floor(max * 0.6) ? lastSpace : max;
  return normalized.slice(0, cutoff).trimEnd();
}
