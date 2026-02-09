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
  it("blocks localhost feeds when private hosts are disabled", async () => {
    await expect(
      fetchFeed("http://localhost/feed.xml", {
        allowHosts: ["localhost"],
        allowPrivateHosts: false,
        cache: false,
        cacheTtlMs: 0,
        maxBytes: 1_000_000,
        maxItems: 10,
        timeoutMs: 1000,
        now: () => 0,
      }),
    ).rejects.toThrow(/Refusing private host/i);
  });

  it("blocks hostnames that resolve to private addresses when private hosts are disabled", async () => {
    const dnsLookupFn = async () => [
      { address: "127.0.0.1", family: 4 as const },
    ];

    await expect(
      fetchFeed("https://good.example/feed.xml", {
        allowHosts: ["good.example"],
        allowPrivateHosts: false,
        dnsLookupFn,
        cache: false,
        cacheTtlMs: 0,
        maxBytes: 1_000_000,
        maxItems: 10,
        timeoutMs: 1000,
        now: () => 0,
      }),
    ).rejects.toThrow(/resolves to a private ipv4/i);
  });

  it("allows hostnames that resolve to public addresses when private hosts are disabled", async () => {
    const xml = `<?xml version="1.0"?>
<rss version="2.0"><channel>
  <item><title>A</title><link>https://good.example/a</link></item>
</channel></rss>`;

    const dnsLookupFn = async () => [
      { address: "93.184.216.34", family: 4 as const },
    ];
    const fetchFn = makeFetch([new Response(xml, { status: 200 })]);

    const result = await fetchFeed("https://good.example/feed.xml", {
      allowHosts: ["good.example"],
      allowPrivateHosts: false,
      dnsLookupFn,
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

  it("allows localhost feeds when explicitly enabled", async () => {
    const xml = `<?xml version="1.0"?>
<rss version="2.0"><channel>
  <item><title>A</title><link>http://localhost/a</link></item>
</channel></rss>`;

    const fetchFn = makeFetch([new Response(xml, { status: 200 })]);

    const result = await fetchFeed("http://localhost/feed.xml", {
      allowHosts: ["localhost"],
      allowPrivateHosts: true,
      cache: false,
      cacheTtlMs: 0,
      maxBytes: 1_000_000,
      maxItems: 10,
      timeoutMs: 1000,
      fetchFn,
      now: () => 0,
    });

    expect(result.source).toBe("network");
    expect(result.items).toEqual([{ title: "A", url: "http://localhost/a" }]);
  });

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

  it("uses conditional requests when cache metadata exists", async () => {
    const xml = `<?xml version="1.0"?>
<rss version="2.0"><channel>
  <item><title>A</title><link>https://good.example/a</link></item>
</channel></rss>`;

    const responses: Array<Response | (() => Response)> = [
      () =>
        new Response(xml, {
          status: 200,
          headers: {
            etag: "W/123",
            "last-modified": "Wed, 01 Jan 2025 00:00:00 GMT",
          },
        }),
      new Response(null, { status: 304 }),
    ];

    let seenIfNoneMatch = "";
    let seenIfModifiedSince = "";

    const fetchFn: typeof fetch = async (_input, init) => {
      const headers = init?.headers as Record<string, string> | undefined;
      if (headers) {
        seenIfNoneMatch = headers["if-none-match"] ?? "";
        seenIfModifiedSince = headers["if-modified-since"] ?? "";
      }
      const value = responses.shift();
      if (!value) throw new Error("No more mocked responses");
      return typeof value === "function" ? value() : value;
    };

    const now = () => 1_000_000;
    const first = await fetchFeed("https://good.example/feed.xml", {
      allowHosts: ["good.example"],
      cache: true,
      cacheTtlMs: 0,
      maxBytes: 1_000_000,
      maxItems: 10,
      timeoutMs: 1000,
      fetchFn,
      now,
    });

    const second = await fetchFeed("https://good.example/feed.xml", {
      allowHosts: ["good.example"],
      cache: true,
      cacheTtlMs: 0,
      maxBytes: 1_000_000,
      maxItems: 10,
      timeoutMs: 1000,
      fetchFn,
      now,
    });

    expect(seenIfNoneMatch).toBe("W/123");
    expect(seenIfModifiedSince).toBe("Wed, 01 Jan 2025 00:00:00 GMT");
    expect(first.source).toBe("network");
    expect(second.source).toBe("cache");
  });

  it("falls back to stale cache when enabled", async () => {
    const xml = `<?xml version="1.0"?>
<rss version="2.0"><channel>
  <item><title>A</title><link>https://good.example/a</link></item>
</channel></rss>`;

    const fetchFn: typeof fetch = async () =>
      new Response(xml, { status: 200, headers: { etag: "W/123" } });

    const now = () => 1_000_000;
    await fetchFeed("https://good.example/feed.xml", {
      allowHosts: ["good.example"],
      cache: true,
      cacheTtlMs: 1,
      maxBytes: 1_000_000,
      maxItems: 10,
      timeoutMs: 1000,
      fetchFn,
      now,
      staleIfError: true,
    });

    const failingFetch: typeof fetch = async () =>
      new Response(null, { status: 500, statusText: "boom" });

    const result = await fetchFeed("https://good.example/feed.xml", {
      allowHosts: ["good.example"],
      cache: true,
      cacheTtlMs: 1,
      maxBytes: 1_000_000,
      maxItems: 10,
      timeoutMs: 1000,
      fetchFn: failingFetch,
      now: () => now() + 10_000,
      staleIfError: true,
    });

    expect(result.source).toBe("cache");
    expect(result.items).toEqual([
      { title: "A", url: "https://good.example/a" },
    ]);
  });
});
