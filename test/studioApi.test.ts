import { describe, expect, test, vi } from "vitest";
import {
  getApiError,
  readApiPayload,
  requestAgentFeed,
  requestApiJson,
  requestFeedFetch,
  requestGeneratePosts,
  requestPersonas,
} from "../web/studioApi.js";

function jsonResponse(value: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(value), {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}

describe("studioApi", () => {
  test("reads json payload when response is json", async () => {
    const payload = await readApiPayload(jsonResponse({ ok: true }));
    expect(payload).toEqual({ kind: "json", value: { ok: true } });
  });

  test("falls back to text payload when body is invalid json", async () => {
    const payload = await readApiPayload(
      new Response("{bad", {
        headers: { "content-type": "application/json" },
      }),
    );
    expect(payload).toEqual({ kind: "text", value: "{bad" });
  });

  test("adds request id details in api errors", () => {
    const message = getApiError(
      new Response("", { status: 400, statusText: "Bad Request" }),
      { kind: "json", value: { error: "Bad input", requestId: "req_123" } },
      "Fallback",
    );
    expect(message).toBe("Bad input (request id: req_123)");
  });

  test("falls back to snippet + status text in api errors", () => {
    const fromText = getApiError(
      new Response("", { status: 400, statusText: "Bad Request" }),
      { kind: "text", value: "x".repeat(300) },
      "Failed to fetch feed",
    );
    expect(fromText).toBe(`Failed to fetch feed: ${"x".repeat(240)}…`);

    const fromStatus = getApiError(
      new Response("", { status: 503, statusText: "Service Unavailable" }),
      { kind: "json", value: {} },
      "Generation failed",
    );
    expect(fromStatus).toBe("Generation failed (503 Service Unavailable)");
  });

  test("requests json and serializes request body", async () => {
    const fetchFn = vi.fn(async (_path: string, init?: RequestInit) => {
      return jsonResponse({ ok: true, body: init?.body ?? null });
    });

    const payload = await requestApiJson(fetchFn as typeof fetch, "/api/test", {
      method: "POST",
      body: { hello: "world" },
      errorFallback: "Request failed",
      unexpectedPayloadError: "Unexpected JSON response.",
    });

    expect(fetchFn).toHaveBeenCalledWith(
      "/api/test",
      expect.objectContaining({
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ hello: "world" }),
      }),
    );
    expect(payload).toEqual({
      ok: true,
      body: JSON.stringify({ hello: "world" }),
    });
  });

  test("throws request-id-aware errors for non-ok responses", async () => {
    const fetchFn = vi.fn(async () =>
      jsonResponse(
        { error: "Nope", requestId: "req_456" },
        { status: 400, statusText: "Bad Request" },
      ),
    );
    await expect(
      requestApiJson(fetchFn as typeof fetch, "/api/test", {
        errorFallback: "Request failed",
      }),
    ).rejects.toThrow("Nope (request id: req_456)");
  });

  test("attaches structured failure details to api errors when present", async () => {
    const failures = [
      {
        url: "https://example.com/rss",
        message: "Timed out",
        durationMs: 33,
      },
    ];
    const fetchFn = vi.fn(async () =>
      jsonResponse(
        { error: "Failed to fetch 1 feed.", requestId: "req_789", failures },
        { status: 400, statusText: "Bad Request" },
      ),
    );

    try {
      await requestApiJson(fetchFn as typeof fetch, "/api/fetch");
      throw new Error("Expected requestApiJson to throw.");
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(String((err as Error).message)).toContain("req_789");
      const details =
        err && typeof err === "object"
          ? Reflect.get(err, "details")
          : undefined;
      expect(details).toEqual(failures);
    }
  });

  test("endpoint wrappers target expected paths and methods", async () => {
    const fetchFn = vi.fn(async (_path: string, _init?: RequestInit) =>
      jsonResponse({ ok: true }),
    );

    await requestPersonas(fetchFn as typeof fetch);
    await requestFeedFetch(fetchFn as typeof fetch, {
      urls: ["https://x.test"],
    });
    await requestGeneratePosts(fetchFn as typeof fetch, {
      items: [],
      maxChars: 280,
    });
    await requestAgentFeed(fetchFn as typeof fetch, {
      items: [],
      personaLimit: 3,
    });

    expect(fetchFn.mock.calls[0]?.[0]).toBe("/api/personas");
    expect((fetchFn.mock.calls[0]?.[1] as RequestInit)?.method).toBe("GET");
    expect(fetchFn.mock.calls[1]?.[0]).toBe("/api/fetch");
    expect((fetchFn.mock.calls[1]?.[1] as RequestInit)?.method).toBe("POST");
    expect(fetchFn.mock.calls[2]?.[0]).toBe("/api/generate");
    expect((fetchFn.mock.calls[2]?.[1] as RequestInit)?.method).toBe("POST");
    expect(fetchFn.mock.calls[3]?.[0]).toBe("/api/agent-feed");
    expect((fetchFn.mock.calls[3]?.[1] as RequestInit)?.method).toBe("POST");
  });
});
