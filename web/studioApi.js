function hasJsonLikeContentType(contentType) {
  return (
    typeof contentType === "string" && contentType.includes("application/json")
  );
}

export async function readApiPayload(res) {
  const contentType = res.headers.get("content-type") ?? "";
  const text = await res.text().catch(() => "");
  const trimmed = text.trim();
  const probablyJson =
    hasJsonLikeContentType(contentType) ||
    trimmed.startsWith("{") ||
    trimmed.startsWith("[");

  if (probablyJson) {
    try {
      return { kind: "json", value: JSON.parse(text) };
    } catch {
      // Fall back to text for non-JSON payloads.
    }
  }

  return { kind: "text", value: text };
}

export function getApiError(res, payload, fallback) {
  if (payload?.kind === "json") {
    const value = payload.value;
    if (value && typeof value === "object") {
      const error = Reflect.get(value, "error");
      const requestId = Reflect.get(value, "requestId");
      const requestIdText =
        typeof requestId === "string" && requestId.trim()
          ? ` (request id: ${requestId.trim()})`
          : "";
      if (typeof error === "string" && error.trim()) {
        return `${error.trim()}${requestIdText}`;
      }
    }
  }

  if (payload?.kind === "text") {
    const text = typeof payload.value === "string" ? payload.value.trim() : "";
    if (text) {
      const snippet = text.length > 240 ? `${text.slice(0, 240)}…` : text;
      return `${fallback}: ${snippet}`;
    }
  }

  const statusText = `${res.status} ${res.statusText}`.trim();
  return statusText ? `${fallback} (${statusText})` : fallback;
}

function toRequestInit(options) {
  if (!options || typeof options !== "object") return undefined;

  const method = typeof options.method === "string" ? options.method : "GET";
  const headers = { ...(options.headers ?? {}) };
  const init = {
    method,
    headers,
  };

  if (options.body !== undefined) {
    headers["content-type"] = headers["content-type"] ?? "application/json";
    init.body =
      typeof options.body === "string"
        ? options.body
        : JSON.stringify(options.body);
  }

  return init;
}

export async function requestApiJson(
  fetchFn,
  path,
  {
    errorFallback = "Request failed",
    unexpectedPayloadError = "Unexpected JSON response.",
    ...requestOptions
  } = {},
) {
  const res = await fetchFn(path, toRequestInit(requestOptions));
  const payload = await readApiPayload(res);
  if (!res.ok) {
    throw new Error(getApiError(res, payload, errorFallback));
  }
  if (payload.kind !== "json") {
    throw new Error(unexpectedPayloadError);
  }
  return payload.value;
}

export async function requestPersonas(fetchFn) {
  return requestApiJson(fetchFn, "/api/personas", {
    method: "GET",
    errorFallback: "Failed to load personas",
    unexpectedPayloadError: "Unexpected response while loading personas.",
  });
}

export async function requestFeedFetch(fetchFn, body) {
  return requestApiJson(fetchFn, "/api/fetch", {
    method: "POST",
    body,
    errorFallback: "Failed to fetch feed",
    unexpectedPayloadError: "Unexpected response while fetching feed.",
  });
}

export async function requestGeneratePosts(fetchFn, body) {
  return requestApiJson(fetchFn, "/api/generate", {
    method: "POST",
    body,
    errorFallback: "Generation failed",
    unexpectedPayloadError: "Unexpected response while generating drafts.",
  });
}

export async function requestAgentFeed(fetchFn, body) {
  return requestApiJson(fetchFn, "/api/agent-feed", {
    method: "POST",
    body,
    errorFallback: "Agent feed failed",
    unexpectedPayloadError: "Unexpected response while building agent feed.",
  });
}
