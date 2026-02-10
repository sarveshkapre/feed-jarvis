import { describe, expect, test } from "vitest";
import {
  parseFeedSets,
  removeFeedSet,
  serializeFeedSets,
  upsertFeedSet,
} from "../web/feedSets.js";

describe("feedSets", () => {
  test("parses invalid payloads safely", () => {
    expect(parseFeedSets(null)).toEqual([]);
    expect(parseFeedSets("not-json")).toEqual([]);
    expect(parseFeedSets(JSON.stringify({ nope: true }))).toEqual([]);
  });

  test("normalizes, dedupes, and sorts feed sets", () => {
    const raw = JSON.stringify([
      {
        name: "  Team feeds  ",
        urls: ["https://a.com/rss", "https://A.com/rss"],
      },
      { name: "Zed", urls: ["https://z.com/rss"] },
      { name: "alpha", urls: ["https://x.com/rss"] },
      { name: "TEAM FEEDS", urls: ["https://b.com/rss"] },
      { name: "", urls: ["https://ignored.com/rss"] },
      { name: "Empty", urls: [] },
    ]);

    const parsed = parseFeedSets(raw);
    expect(parsed.map((s) => s.name)).toEqual(["alpha", "Team feeds", "Zed"]);
    expect(parsed.find((s) => s.name === "Team feeds")?.urls).toEqual([
      "https://a.com/rss",
    ]);
  });

  test("upserts and removes by name (case-insensitive)", () => {
    let sets = parseFeedSets(
      JSON.stringify([{ name: "News", urls: ["https://a.com/rss"] }]),
    );

    sets = upsertFeedSet(sets, { name: "news", urls: ["https://b.com/rss"] });
    expect(sets).toHaveLength(1);
    expect(sets[0]?.name).toBe("news");
    expect(sets[0]?.urls).toEqual(["https://b.com/rss"]);

    sets = removeFeedSet(sets, "NEWS");
    expect(sets).toEqual([]);
  });

  test("serialize and parse round-trip", () => {
    const sets = upsertFeedSet([], {
      name: "My feeds",
      urls: ["https://example.com/rss.xml"],
    });

    const raw = serializeFeedSets(sets);
    expect(parseFeedSets(raw)).toHaveLength(1);
    expect(parseFeedSets(raw)[0]?.name).toBe("My feeds");
  });
});
