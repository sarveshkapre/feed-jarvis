import { describe, expect, it } from "vitest";
import { parseOpmlUrls } from "../src/lib/opml.js";

describe("opml parser", () => {
  it("extracts and dedupes nested outline feed URLs", () => {
    const opml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head><title>Feeds</title></head>
  <body>
    <outline text="Group A">
      <outline text="A1" type="rss" xmlUrl="https://example.com/a.xml" />
      <outline text="A2" type="rss" xmlUrl="https://example.com/b.xml" />
      <outline text="A1 dupe" type="rss" xmlUrl="https://example.com/a.xml" />
    </outline>
    <outline text="Flat" type="rss" xmlUrl="http://news.example.com/feed" />
  </body>
</opml>`;

    expect(parseOpmlUrls(opml)).toEqual([
      "https://example.com/a.xml",
      "https://example.com/b.xml",
      "http://news.example.com/feed",
    ]);
  });

  it("ignores invalid and non-http URLs", () => {
    const opml = `<?xml version="1.0"?>
<opml version="2.0"><body>
  <outline text="Bad" xmlUrl="not-a-url" />
  <outline text="FTP" xmlUrl="ftp://example.com/feed" />
  <outline text="HTML" htmlUrl="https://example.com/page" />
</body></opml>`;

    expect(parseOpmlUrls(opml)).toEqual(["https://example.com/page"]);
  });

  it("returns empty when XML is invalid", () => {
    expect(parseOpmlUrls("<opml><body><outline")).toEqual([]);
  });

  it("honors maxUrls limit", () => {
    const opml = `<?xml version="1.0"?>
<opml version="2.0"><body>
  <outline xmlUrl="https://a.example.com/feed.xml" />
  <outline xmlUrl="https://b.example.com/feed.xml" />
  <outline xmlUrl="https://c.example.com/feed.xml" />
</body></opml>`;

    expect(parseOpmlUrls(opml, 2)).toEqual([
      "https://a.example.com/feed.xml",
      "https://b.example.com/feed.xml",
    ]);
  });
});
