import {
  formatFetchFailureLine,
  normalizeFetchFailures,
  summarizeFetchFailures,
} from "./fetchDiagnostics.js";

const DEFAULT_FETCH_FAILURE_SUMMARY = "Feed fetch details";

export function buildFetchFailureDetails(failures) {
  const normalized = normalizeFetchFailures(failures);
  const lines = normalized
    .map((failure) => formatFetchFailureLine(failure))
    .filter((line) => typeof line === "string" && line.trim().length > 0);

  return {
    failures: normalized,
    lines,
    hasFailures: lines.length > 0,
    summary:
      summarizeFetchFailures(normalized) || DEFAULT_FETCH_FAILURE_SUMMARY,
  };
}

export function toFetchFailuresJson(failures) {
  const normalized = normalizeFetchFailures(failures);
  if (normalized.length === 0) return "";
  return `${JSON.stringify(normalized, null, 2)}\n`;
}
