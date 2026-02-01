import { describe, expect, it } from "vitest";
import { parseFeedXml } from "../src/lib/rss.js";

describe("parseFeedXml", () => {
  it("parses RSS 2.0 items", () => {
    const xml = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <title>Example</title>
    <item>
      <title>First</title>
      <link>https://example.com/1</link>
    </item>
    <item>
      <title>Second</title>
      <link>https://example.com/2</link>
    </item>
  </channel>
</rss>`;

    expect(parseFeedXml(xml, 10)).toEqual([
      { title: "First", url: "https://example.com/1" },
      { title: "Second", url: "https://example.com/2" },
    ]);
  });

  it("parses Atom entries and prefers alternate links", () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Example</title>
  <entry>
    <title>Entry</title>
    <link rel="self" href="https://example.com/feed.xml" />
    <link rel="alternate" type="text/html" href="https://example.com/post" />
  </entry>
</feed>`;

    expect(parseFeedXml(xml, 10)).toEqual([
      { title: "Entry", url: "https://example.com/post" },
    ]);
  });
});
