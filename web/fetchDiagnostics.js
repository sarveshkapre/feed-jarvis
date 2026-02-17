function coerceNonNegativeInt(value) {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num) || num < 0) return null;
  return Math.floor(num);
}

export function normalizeFetchFailures(raw) {
  if (!Array.isArray(raw)) return [];
  const failures = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const urlRaw = Reflect.get(entry, "url");
    const messageRaw =
      typeof Reflect.get(entry, "message") === "string"
        ? Reflect.get(entry, "message")
        : Reflect.get(entry, "error");
    const url = typeof urlRaw === "string" ? urlRaw.trim() : "";
    const message = typeof messageRaw === "string" ? messageRaw.trim() : "";
    if (!url || !message) continue;
    const durationMs = coerceNonNegativeInt(Reflect.get(entry, "durationMs"));
    failures.push({
      url,
      message,
      durationMs: durationMs ?? 0,
    });
  }
  return failures;
}

export function summarizeFetchFailures(failures) {
  const count = Array.isArray(failures) ? failures.length : 0;
  if (count <= 0) return "";
  if (count === 1) return "1 feed failed. Expand for details.";
  return `${count} feeds failed. Expand for details.`;
}

export function formatFetchFailureLine(failure) {
  if (!failure || typeof failure !== "object") return "";
  const url = typeof failure.url === "string" ? failure.url.trim() : "";
  const message =
    typeof failure.message === "string" ? failure.message.trim() : "";
  if (!url || !message) return "";
  const durationMs = coerceNonNegativeInt(failure.durationMs);
  if (durationMs && durationMs > 0) {
    return `${url}: ${message} (${durationMs}ms)`;
  }
  return `${url}: ${message}`;
}
