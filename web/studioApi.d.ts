export type ApiPayload =
  | { kind: "json"; value: unknown }
  | { kind: "text"; value: string };

export type RequestApiJsonOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  errorFallback?: string;
  unexpectedPayloadError?: string;
};

export function readApiPayload(res: Response): Promise<ApiPayload>;
export function getApiError(
  res: Response,
  payload: ApiPayload,
  fallback: string,
): string;

export function requestApiJson(
  fetchFn: typeof fetch,
  path: string,
  options?: RequestApiJsonOptions,
): Promise<unknown>;

export function requestPersonas(fetchFn: typeof fetch): Promise<unknown>;
export function requestFeedFetch(
  fetchFn: typeof fetch,
  body: Record<string, unknown>,
): Promise<unknown>;
export function requestGeneratePosts(
  fetchFn: typeof fetch,
  body: Record<string, unknown>,
): Promise<unknown>;
export function requestAgentFeed(
  fetchFn: typeof fetch,
  body: Record<string, unknown>,
): Promise<unknown>;
