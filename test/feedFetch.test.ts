import { describe, expect, it } from "vitest";
import { fetchFeed } from "../src/lib/feedFetch.js";

function makeFetch(
  responses: Array<Response | (() => Response)>,
): typeof fetch {
  let i = 0;
  return async () => {
    const value = responses[i];
    i++;
    if (!value) throw new Error("No more mocked responses");
    const res = typeof value === "function" ? value() : value;
    return res;
  };
}

describe("fetchFeed", () => {
  it("enforces allowlist across redirects", async () => {
    const fetchFn = makeFetch([
      new Response(null, {
        status: 302,
        headers: { location: "https://evil.example/feed.xml" },
      }),
    ]);

    await expect(
      fetchFeed("https://good.example/feed.xml", {
        allowHosts: ["good.example"],
        cache: false,
        cacheTtlMs: 0,
        maxBytes: 1_000_000,
        maxItems: 10,
        timeoutMs: 1000,
        fetchFn,
        now: () => 0,
      }),
    ).rejects.toThrow(/Host not allowlisted/i);
  });

  it("follows allowlisted redirects and returns items", async () => {
    const xml = `<?xml version="1.0"?>
<rss version="2.0"><channel>
  <item><title>A</title><link>https://good.example/a</link></item>
</channel></rss>`;

    const fetchFn = makeFetch([
      new Response(null, {
        status: 301,
        headers: { location: "https://good.example/new.xml" },
      }),
      new Response(xml, { status: 200 }),
    ]);

    const result = await fetchFeed("https://good.example/old.xml", {
      allowHosts: ["good.example"],
      cache: false,
      cacheTtlMs: 0,
      maxBytes: 1_000_000,
      maxItems: 10,
      timeoutMs: 1000,
      fetchFn,
      now: () => 0,
    });

    expect(result.source).toBe("network");
    expect(result.items).toEqual([
      { title: "A", url: "https://good.example/a" },
    ]);
  });
});
