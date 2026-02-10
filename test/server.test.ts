import type { AddressInfo } from "node:net";
import { describe, expect, it } from "vitest";
import { createStudioServer, type StudioServerOptions } from "../src/server.js";

async function withServer(
  options: StudioServerOptions,
  run: (baseUrl: string) => Promise<void>,
): Promise<void> {
  const server = createStudioServer(options);
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      resolve();
    });
  });

  const address = server.address() as AddressInfo | null;
  if (!address || typeof address === "string") {
    throw new Error("Unable to resolve test server address.");
  }

  const baseUrl = `http://127.0.0.1:${address.port}`;
  try {
    await run(baseUrl);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }
}

describe("studio server", () => {
  it("serves personas and static index", async () => {
    await withServer({}, async (baseUrl) => {
      const personasRes = await fetch(`${baseUrl}/api/personas`);
      expect(personasRes.status).toBe(200);
      const personasPayload = await personasRes.json();
      expect(Array.isArray(personasPayload.personas)).toBe(true);
      expect(
        personasPayload.personas.some((persona: { name: string }) => {
          return persona.name === "Analyst";
        }),
      ).toBe(true);

      const indexRes = await fetch(`${baseUrl}/`);
      expect(indexRes.status).toBe(200);
      const html = await indexRes.text();
      expect(html.includes("Feed Jarvis Studio")).toBe(true);
      expect(html.includes("Import personas")).toBe(true);
    });
  });

  it("generates drafts via /api/generate", async () => {
    await withServer({}, async (baseUrl) => {
      const res = await fetch(`${baseUrl}/api/generate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: [{ title: "Release notes", url: "https://example.com/r1" }],
          personaName: "Analyst",
          channel: "x",
          template: "straight",
          maxChars: 200,
        }),
      });

      expect(res.status).toBe(200);
      const payload = await res.json();
      expect(Array.isArray(payload.posts)).toBe(true);
      expect(payload.posts).toHaveLength(1);
      expect(payload.posts[0].includes("Analysis:")).toBe(true);
    });
  });

  it("supports custom personas via /api/generate", async () => {
    await withServer({}, async (baseUrl) => {
      const res = await fetch(`${baseUrl}/api/generate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: [{ title: "Release notes", url: "https://example.com/r1" }],
          personaCustom: { name: "Ops", prefix: "Ops note:" },
          channel: "x",
          template: "straight",
          maxChars: 200,
        }),
      });

      expect(res.status).toBe(200);
      const payload = await res.json();
      expect(payload.posts).toHaveLength(1);
      expect(payload.posts[0].includes("Ops note:")).toBe(true);
    });
  });

  it("applies generation rules via /api/generate", async () => {
    await withServer({}, async (baseUrl) => {
      const res = await fetch(`${baseUrl}/api/generate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: [{ title: "Release notes", url: "https://example.com/r1" }],
          personaName: "Analyst",
          channel: "x",
          template: "straight",
          maxChars: 240,
          rules: {
            prepend: "New:",
            append: "Worth a look.",
            hashtags: "ai,#Product",
            utm: { source: "feed-jarvis", medium: "social" },
          },
        }),
      });

      expect(res.status).toBe(200);
      const payload = await res.json();
      expect(payload.posts).toHaveLength(1);
      expect(String(payload.posts[0])).toMatch(/New:/);
      expect(String(payload.posts[0])).toMatch(/#ai/i);
      expect(String(payload.posts[0])).toMatch(/utm_source=feed-jarvis/);
      expect(Array.isArray(payload.items)).toBe(true);
      expect(String(payload.items[0].url)).toMatch(/utm_source=feed-jarvis/);
    });
  });

  it("blocks localhost feed fetch by default", async () => {
    await withServer({}, async (baseUrl) => {
      const res = await fetch(`${baseUrl}/api/fetch`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          urls: ["http://localhost/feed.xml"],
          maxItems: 5,
          dedupe: true,
        }),
      });

      expect(res.status).toBe(400);
      const payload = await res.json();
      expect(String(payload.error)).toMatch(
        /Refusing (private|local-network)/i,
      );
    });
  });

  it("allows localhost feed fetch when explicitly enabled", async () => {
    const testFeedUrl =
      "http://localhost/feed-server-test-localhost-enabled.xml";
    const xml = `<?xml version="1.0"?>
<rss version="2.0"><channel>
  <item><title>Local test</title><link>http://localhost/local-test</link></item>
</channel></rss>`;

    const fetchFn: typeof fetch = async () => {
      return new Response(xml, {
        status: 200,
        headers: { "content-type": "application/rss+xml" },
      });
    };

    await withServer({ allowPrivateHosts: true, fetchFn }, async (baseUrl) => {
      const res = await fetch(`${baseUrl}/api/fetch`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          urls: [testFeedUrl],
          maxItems: 5,
          dedupe: true,
        }),
      });

      expect(res.status).toBe(200);
      const payload = await res.json();
      expect(payload.items).toEqual([
        { title: "Local test", url: "http://localhost/local-test" },
      ]);
    });
  });

  it("returns fetch summary details", async () => {
    const nonce = `summary-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const feedA = `http://localhost/${nonce}-a.xml`;
    const feedB = `http://localhost/${nonce}-b.xml`;
    const feedDup1 = `http://localhost/${nonce}-dup1.xml`;
    const feedDup2 = `http://localhost/${nonce}-dup2.xml`;

    const xmlFor = (href: string) => {
      if (href.includes("dup")) {
        return `<?xml version="1.0"?>
<rss version="2.0"><channel>
  <item><title>Same</title><link>http://localhost/same</link></item>
</channel></rss>`;
      }
      if (href.includes("-a.xml")) {
        return `<?xml version="1.0"?>
<rss version="2.0"><channel>
  <item><title>A</title><link>http://localhost/a</link></item>
</channel></rss>`;
      }
      return `<?xml version="1.0"?>
<rss version="2.0"><channel>
  <item><title>B</title><link>http://localhost/b</link></item>
</channel></rss>`;
    };

    const fetchFn: typeof fetch = async (href) => {
      return new Response(xmlFor(String(href)), {
        status: 200,
        headers: { "content-type": "application/rss+xml" },
      });
    };

    await withServer({ allowPrivateHosts: true, fetchFn }, async (baseUrl) => {
      const limitedRes = await fetch(`${baseUrl}/api/fetch`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          urls: [feedA, feedB],
          maxItems: 1,
          dedupe: true,
        }),
      });

      expect(limitedRes.status).toBe(200);
      const limitedPayload = await limitedRes.json();
      expect(Array.isArray(limitedPayload.items)).toBe(true);
      expect(limitedPayload.items).toHaveLength(1);
      expect(limitedPayload.summary).toMatchObject({
        sources: 2,
        dedupe: true,
        deduped: 0,
        limited: 1,
      });

      const dedupeRes = await fetch(`${baseUrl}/api/fetch`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          urls: [feedDup1, feedDup2],
          maxItems: 5,
          dedupe: true,
        }),
      });

      expect(dedupeRes.status).toBe(200);
      const dedupePayload = await dedupeRes.json();
      expect(dedupePayload.items).toHaveLength(1);
      expect(dedupePayload.summary).toMatchObject({
        sources: 2,
        dedupe: true,
        deduped: 1,
        limited: 0,
      });
    });
  });

  it("returns JSON 404 for unknown api routes", async () => {
    await withServer({}, async (baseUrl) => {
      const res = await fetch(`${baseUrl}/api/not-found`);
      expect(res.status).toBe(404);
      const payload = await res.json();
      expect(payload).toEqual({ error: "Not found" });
    });
  });
});
