import { describe, expect, test } from "vitest";
import {
  formatInvalidItemsSummary,
  normalizeFeedUrl,
  normalizeUrls,
  parseItemsJsonPayload,
  safeHttpUrl,
  toItemsJson,
} from "../web/step1Ingestion.js";

describe("step1Ingestion", () => {
  test("normalizes feed URLs from comma/newline separated input", () => {
    expect(
      normalizeUrls(
        " https://a.example/feed.xml,\nhttps://b.example/rss\n\n,https://c.example ",
      ),
    ).toEqual([
      "https://a.example/feed.xml",
      "https://b.example/rss",
      "https://c.example/",
    ]);
  });

  test("normalizes feed urls by stripping common tracking params", () => {
    expect(
      normalizeFeedUrl(
        "https://EXAMPLE.com/feed.xml/?utm_source=x&utm_medium=social&fbclid=abc&id=7",
      ),
    ).toBe("https://example.com/feed.xml?id=7");
    expect(normalizeFeedUrl("https://example.com/rss?mc_cid=1&topic=ai")).toBe(
      "https://example.com/rss?topic=ai",
    );
  });

  test("accepts only http/https URLs", () => {
    expect(safeHttpUrl("https://example.com/item")?.toString()).toBe(
      "https://example.com/item",
    );
    expect(safeHttpUrl("http://example.com/item")?.toString()).toBe(
      "http://example.com/item",
    );
    expect(safeHttpUrl("ftp://example.com")).toBeNull();
    expect(safeHttpUrl("not a url")).toBeNull();
  });

  test("parses valid JSON items and records invalid entries", () => {
    const parsed = parseItemsJsonPayload([
      { title: "Hello", url: "https://example.com/1" },
      { title: "  ", url: "https://example.com/2" },
      { title: "World", url: "ftp://example.com/3" },
      "bad",
      { title: "Good", url: "http://example.com/4" },
    ]);

    expect(parsed.items).toEqual([
      { title: "Hello", url: "https://example.com/1" },
      { title: "Good", url: "http://example.com/4" },
    ]);
    expect(parsed.invalid).toEqual([
      { index: 1, reason: "missing title or url" },
      { index: 2, reason: "url must use http:// or https://" },
      { index: 3, reason: "expected an object with title + url" },
    ]);
  });

  test("throws when payload is not an array", () => {
    expect(() => parseItemsJsonPayload({})).toThrow("Expected a JSON array.");
  });

  test("formats invalid-item summary with cap and remaining count", () => {
    expect(
      formatInvalidItemsSummary([
        { index: 0, reason: "missing title or url" },
        { index: 3, reason: "expected an object with title + url" },
        { index: 5, reason: "url must use http:// or https://" },
        { index: 7, reason: "missing title or url" },
      ]),
    ).toBe(
      "#1: missing title or url; #4: expected an object with title + url; #6: url must use http:// or https://; +1 more.",
    );
  });

  test("serializes items JSON with trailing newline", () => {
    expect(toItemsJson([{ title: "t", url: "https://example.com" }])).toBe(
      '[\n  {\n    "title": "t",\n    "url": "https://example.com"\n  }\n]\n',
    );
  });
});
