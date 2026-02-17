import type { FetchFailure } from "./fetchDiagnostics.js";

export type FetchFailureDetails = {
  failures: FetchFailure[];
  lines: string[];
  hasFailures: boolean;
  summary: string;
};

export declare function buildFetchFailureDetails(
  failures: unknown,
): FetchFailureDetails;
export declare function toFetchFailuresJson(failures: unknown): string;
