import { describe, expect, test } from "vitest";
import {
  parseFeedSets,
  parseFeedSetsOpml,
  removeFeedSet,
  serializeFeedSets,
  serializeFeedSetsAsOpml,
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

  test("serializes feed sets as OPML and parses back", () => {
    const sets = parseFeedSets(
      JSON.stringify([
        {
          name: "Team feeds",
          urls: [
            "https://example.com/rss.xml",
            "https://news.example.com/feed",
          ],
        },
        {
          name: "Launches",
          urls: ["https://product.example.org/releases.xml"],
        },
      ]),
    );

    const opml = serializeFeedSetsAsOpml(sets);
    const parsed = parseFeedSetsOpml(opml);

    expect(parsed).toHaveLength(2);
    expect(parsed.map((entry) => entry.name)).toEqual([
      "Launches",
      "Team feeds",
    ]);
    expect(parsed.find((entry) => entry.name === "Team feeds")?.urls).toEqual([
      "https://example.com/rss.xml",
      "https://news.example.com/feed",
    ]);
  });

  test("parses flat OPML feeds into Imported feeds set", () => {
    const opml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <body>
    <outline text="Site A" xmlUrl="https://a.example.com/rss.xml" />
    <outline text="Site B" xmlUrl="https://b.example.com/feed" />
    <outline text="Ignored" xmlUrl="ftp://example.com/rss.xml" />
  </body>
</opml>`;

    const parsed = parseFeedSetsOpml(opml);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.name).toBe("Imported feeds");
    expect(parsed[0]?.urls).toEqual([
      "https://a.example.com/rss.xml",
      "https://b.example.com/feed",
    ]);
  });

  test("parses grouped OPML outlines into named feed sets", () => {
    const opml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <body>
    <outline text="Tech &amp; AI">
      <outline text="Example" xmlUrl="https://example.com/rss.xml" />
      <outline text="Nested">
        <outline text="Same" xmlUrl="https://example.com/rss.xml" />
        <outline text="News" xmlUrl="https://news.example.com/feed" />
      </outline>
    </outline>
  </body>
</opml>`;

    const parsed = parseFeedSetsOpml(opml);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.name).toBe("Tech & AI");
    expect(parsed[0]?.urls).toEqual([
      "https://example.com/rss.xml",
      "https://news.example.com/feed",
    ]);
  });
});
