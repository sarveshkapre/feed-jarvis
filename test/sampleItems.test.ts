import { describe, expect, test } from "vitest";
import { buildSampleItems, buildSampleItemsJson } from "../web/sampleItems.js";

describe("sampleItems", () => {
  test("returns a non-empty sample set", () => {
    const items = buildSampleItems();
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(typeof item.title).toBe("string");
      expect(item.title.length).toBeGreaterThan(0);
      expect(typeof item.url).toBe("string");
      expect(item.url.startsWith("https://")).toBe(true);
    }
  });

  test("serializes sample items as valid JSON array payload", () => {
    const raw = buildSampleItemsJson();
    const parsed = JSON.parse(raw);
    expect(parsed).toEqual(buildSampleItems());
  });
});
