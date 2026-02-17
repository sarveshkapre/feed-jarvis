import { describe, expect, test } from "vitest";
import {
  buildFetchFailureDetails,
  toFetchFailuresJson,
} from "../web/fetchFailureDetails.js";

describe("fetchFailureDetails", () => {
  test("builds summary + lines for valid failures", () => {
    const details = buildFetchFailureDetails([
      {
        url: "https://example.com/rss.xml",
        message: "Timeout",
        durationMs: 1200,
      },
      { url: "https://example.com/atom.xml", error: "HTTP 500" },
      { invalid: true },
    ]);

    expect(details.hasFailures).toBe(true);
    expect(details.failures).toEqual([
      {
        url: "https://example.com/rss.xml",
        message: "Timeout",
        durationMs: 1200,
      },
      {
        url: "https://example.com/atom.xml",
        message: "HTTP 500",
        durationMs: 0,
      },
    ]);
    expect(details.lines).toEqual([
      "https://example.com/rss.xml: Timeout (1200ms)",
      "https://example.com/atom.xml: HTTP 500",
    ]);
    expect(details.summary).toBe("2 feeds failed. Expand for details.");
  });

  test("returns empty details for missing/invalid failures", () => {
    const details = buildFetchFailureDetails(null);
    expect(details).toEqual({
      failures: [],
      lines: [],
      hasFailures: false,
      summary: "Feed fetch details",
    });
  });

  test("serializes normalized failure payload for copy handoff", () => {
    expect(
      toFetchFailuresJson([
        {
          url: "https://example.com/rss.xml",
          error: "timeout",
          durationMs: 50,
        },
      ]),
    ).toBe(
      `${JSON.stringify(
        [
          {
            url: "https://example.com/rss.xml",
            message: "timeout",
            durationMs: 50,
          },
        ],
        null,
        2,
      )}\n`,
    );
    expect(toFetchFailuresJson([])).toBe("");
  });
});
