export type FetchFailure = {
  url: string;
  message: string;
  durationMs: number;
};

export function normalizeFetchFailures(raw: unknown): FetchFailure[];
export function summarizeFetchFailures(failures: unknown): string;
export function formatFetchFailureLine(failure: unknown): string;
