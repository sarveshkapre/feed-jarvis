import { describe, expect, test } from "vitest";
import {
  formatFetchFailureLine,
  normalizeFetchFailures,
  summarizeFetchFailures,
} from "../web/fetchDiagnostics.js";

describe("fetchDiagnostics", () => {
  test("normalizes structured failure entries", () => {
    expect(
      normalizeFetchFailures([
        {
          url: " https://a.example/rss ",
          message: "Timed out",
          durationMs: 41,
        },
        { url: "https://b.example/rss", error: "Blocked host" },
      ]),
    ).toEqual([
      { url: "https://a.example/rss", message: "Timed out", durationMs: 41 },
      { url: "https://b.example/rss", message: "Blocked host", durationMs: 0 },
    ]);
  });

  test("drops invalid failure entries", () => {
    expect(
      normalizeFetchFailures([
        null,
        {},
        { url: "", message: "x" },
        { url: "https://a.example/rss", message: "" },
      ]),
    ).toEqual([]);
  });

  test("summarizes failure count for status text", () => {
    expect(summarizeFetchFailures([])).toBe("");
    expect(
      summarizeFetchFailures([
        { url: "https://a.example/rss", message: "x", durationMs: 0 },
      ]),
    ).toBe("1 feed failed. Expand for details.");
    expect(
      summarizeFetchFailures([
        { url: "https://a.example/rss", message: "x", durationMs: 0 },
        { url: "https://b.example/rss", message: "y", durationMs: 0 },
      ]),
    ).toBe("2 feeds failed. Expand for details.");
  });

  test("formats one failure line with optional duration", () => {
    expect(
      formatFetchFailureLine({
        url: "https://a.example/rss",
        message: "Timeout",
        durationMs: 35,
      }),
    ).toBe("https://a.example/rss: Timeout (35ms)");
    expect(
      formatFetchFailureLine({
        url: "https://b.example/rss",
        message: "Forbidden",
        durationMs: 0,
      }),
    ).toBe("https://b.example/rss: Forbidden");
  });
});
