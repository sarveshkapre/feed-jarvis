import { describe, expect, test } from "vitest";
import {
  assertFetchHappyPathPayload,
  assertFetchPartialSuccessPayload,
} from "../src/lib/fetchContract.js";

describe("fetchContract", () => {
  test("accepts happy-path fetch payloads", () => {
    const payload = {
      items: [{ title: "a", url: "https://example.com/a" }],
      summary: { failed: 0 },
      failures: [],
    };

    expect(assertFetchHappyPathPayload(payload)).toMatchObject({
      summaryFailed: 0,
    });
  });

  test("rejects happy-path payloads with failures", () => {
    const payload = {
      items: [{ title: "a", url: "https://example.com/a" }],
      summary: { failed: 1 },
      failures: [
        {
          url: "https://bad.example.com/rss",
          message: "Fetch failed: 503 Service Unavailable",
          durationMs: 4,
        },
      ],
    };

    expect(() => assertFetchHappyPathPayload(payload)).toThrow(
      /failures\[\] to be empty/i,
    );
  });

  test("accepts partial-success payloads and enforces summary.failed parity", () => {
    const payload = {
      items: [{ title: "a", url: "https://example.com/a" }],
      summary: { failed: 1 },
      failures: [
        {
          url: "https://bad.example.com/rss",
          message: "Fetch failed: 503 Service Unavailable",
          durationMs: 7,
        },
      ],
    };

    expect(assertFetchPartialSuccessPayload(payload)).toMatchObject({
      summaryFailed: 1,
    });
  });

  test("rejects partial-success payloads when summary.failed mismatches failures length", () => {
    const payload = {
      items: [{ title: "a", url: "https://example.com/a" }],
      summary: { failed: 2 },
      failures: [
        {
          url: "https://bad.example.com/rss",
          message: "Fetch failed: 503 Service Unavailable",
          durationMs: 7,
        },
      ],
    };

    expect(() => assertFetchPartialSuccessPayload(payload)).toThrow(
      /summary\.failed/i,
    );
  });
});
