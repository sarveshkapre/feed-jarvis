import { describe, expect, test } from "vitest";
import { applyItemFilters } from "../web/filters.js";

describe("applyItemFilters", () => {
  const items = [
    { title: "Product launch: v2", url: "https://example.com/launch" },
    { title: "Hiring: frontend engineer", url: "https://example.com/jobs" },
    { title: "Podcast recap with the CEO", url: "https://example.com/podcast" },
    { title: "Release notes: 2026.02", url: "https://example.com/release" },
  ];

  test("returns original items when no filters are set", () => {
    const out = applyItemFilters(items, {});
    expect(out).toHaveLength(items.length);
    expect(out[0]?.title).toBe(items[0]?.title);
  });

  test("filters by minimum title length", () => {
    const out = applyItemFilters(items, { minTitleLength: 18 });
    expect(out.map((item) => item.title)).toEqual([
      "Product launch: v2",
      "Hiring: frontend engineer",
      "Podcast recap with the CEO",
      "Release notes: 2026.02",
    ]);

    const stricter = applyItemFilters(items, { minTitleLength: 23 });
    expect(stricter.map((item) => item.title)).toEqual([
      "Hiring: frontend engineer",
      "Podcast recap with the CEO",
    ]);
  });

  test("include keywords matches any keyword (case-insensitive)", () => {
    const out = applyItemFilters(items, { include: "launch, RELEASE" });
    expect(out.map((item) => item.title)).toEqual([
      "Product launch: v2",
      "Release notes: 2026.02",
    ]);
  });

  test("exclude keywords removes items that match any keyword", () => {
    const out = applyItemFilters(items, { exclude: "hiring, podcast" });
    expect(out.map((item) => item.title)).toEqual([
      "Product launch: v2",
      "Release notes: 2026.02",
    ]);
  });

  test("exclude wins when both include and exclude match", () => {
    const out = applyItemFilters(items, { include: "podcast", exclude: "ceo" });
    expect(out).toEqual([]);
  });
});
