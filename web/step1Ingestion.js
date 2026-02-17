export function normalizeUrls(raw) {
  return String(raw ?? "")
    .split(/\n|,/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

export function toItemsJson(items) {
  return `${JSON.stringify(items, null, 2)}\n`;
}

export function safeHttpUrl(raw) {
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function parseItemsJsonPayload(parsed) {
  if (!Array.isArray(parsed)) {
    throw new Error("Expected a JSON array.");
  }

  const items = [];
  const invalid = [];
  for (let i = 0; i < parsed.length; i++) {
    const raw = parsed[i];
    if (!raw || typeof raw !== "object") {
      invalid.push({ index: i, reason: "expected an object with title + url" });
      continue;
    }

    const title = typeof raw.title === "string" ? raw.title.trim() : "";
    const urlRaw = typeof raw.url === "string" ? raw.url.trim() : "";
    if (!title || !urlRaw) {
      invalid.push({ index: i, reason: "missing title or url" });
      continue;
    }

    const url = safeHttpUrl(urlRaw);
    if (!url) {
      invalid.push({ index: i, reason: "url must use http:// or https://" });
      continue;
    }

    items.push({ title, url: url.toString() });
  }

  return { items, invalid };
}

export function formatInvalidItemsSummary(invalid) {
  if (!Array.isArray(invalid) || invalid.length === 0) return "";
  const preview = invalid
    .slice(0, 3)
    .map((entry) => `#${entry.index + 1}: ${entry.reason}`)
    .join("; ");
  const remaining = invalid.length - 3;
  return remaining > 0 ? `${preview}; +${remaining} more.` : `${preview}.`;
}
