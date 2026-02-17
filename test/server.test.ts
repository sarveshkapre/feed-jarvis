import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import type { AddressInfo } from "node:net";
import os from "node:os";
import path from "node:path";
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
      expect(personasPayload.personas.length).toBeGreaterThan(20);
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

  it("rejects non-http item urls via /api/generate", async () => {
    await withServer({}, async (baseUrl) => {
      const res = await fetch(`${baseUrl}/api/generate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: [{ title: "Release notes", url: "javascript:alert(1)" }],
          personaName: "Analyst",
          channel: "x",
          template: "straight",
          maxChars: 200,
        }),
      });

      expect(res.status).toBe(400);
      const payload = await res.json();
      expect(String(payload.error)).toMatch(/http|https/i);
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

  it("supports llm generation mode via /api/generate", async () => {
    const openaiFetch: typeof fetch = async (_url, init) => {
      const body =
        init && typeof init === "object" && typeof init.body === "string"
          ? JSON.parse(init.body)
          : {};
      expect(body.model).toBe("gpt-4.1-mini");
      expect(typeof body.input).toBe("string");

      return new Response(
        JSON.stringify({
          output: [
            {
              type: "message",
              content: [
                {
                  type: "output_text",
                  text: "Rate outlook turning dovish (confidence: 81/100)",
                },
              ],
            },
          ],
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      );
    };

    await withServer(
      { openaiApiKey: "test-key", openaiFetchFn: openaiFetch },
      async (baseUrl) => {
        const res = await fetch(`${baseUrl}/api/generate`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            mode: "llm",
            items: [
              { title: "Rates are changing", url: "https://example.com/r1" },
            ],
            personaName: "Analyst",
            channel: "x",
            template: "straight",
            maxChars: 240,
          }),
        });

        expect(res.status).toBe(200);
        const payload = await res.json();
        expect(payload.mode).toBe("llm");
        expect(payload.posts).toHaveLength(1);
        expect(String(payload.posts[0])).toMatch(/confidence/i);
        expect(String(payload.posts[0])).toMatch(/https:\/\/example\.com\/r1/);
      },
    );
  });

  it("returns a clear error when llm mode is requested without API key", async () => {
    await withServer({}, async (baseUrl) => {
      const res = await fetch(`${baseUrl}/api/generate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode: "llm",
          items: [
            { title: "Rates are changing", url: "https://example.com/r1" },
          ],
          personaName: "Analyst",
          channel: "x",
          template: "straight",
          maxChars: 240,
        }),
      });

      expect(res.status).toBe(400);
      const payload = await res.json();
      expect(String(payload.error)).toMatch(/OPENAI_API_KEY/i);
    });
  });

  it("builds a multi-persona agent feed in template mode", async () => {
    await withServer({}, async (baseUrl) => {
      const res = await fetch(`${baseUrl}/api/agent-feed`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: [
            { title: "Rates cool off", url: "https://example.com/rates" },
            { title: "AI infra spend rises", url: "https://example.com/infra" },
          ],
          personaLimit: 4,
          channel: "x",
          template: "takeaway",
          maxChars: 220,
        }),
      });

      expect(res.status).toBe(200);
      const payload = await res.json();
      expect(payload.mode).toBe("template");
      expect(Array.isArray(payload.feed)).toBe(true);
      expect(payload.feed).toHaveLength(4);
      expect(payload.feed[0]).toMatchObject({
        personaName: expect.any(String),
        post: expect.stringContaining("https://example.com/"),
      });
    });
  });

  it("applies per-persona maxChars overrides in agent feed mode", async () => {
    await withServer({}, async (baseUrl) => {
      const res = await fetch(`${baseUrl}/api/agent-feed`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              title:
                "A very long market structure title for tighter persona limits",
              url: "https://example.com/rates",
            },
          ],
          personaNames: ["Analyst", "Macro Hawk"],
          personaMaxChars: {
            "Macro Hawk": 80,
          },
          channel: "x",
          template: "takeaway",
          maxChars: 220,
        }),
      });

      expect(res.status).toBe(200);
      const payload = await res.json();
      expect(payload.mode).toBe("template");
      expect(payload.feed).toHaveLength(2);
      expect(payload.feed[0]).toMatchObject({
        personaName: "Analyst",
        maxChars: 220,
      });
      expect(payload.feed[1]).toMatchObject({
        personaName: "Macro Hawk",
        maxChars: 80,
      });
      expect(String(payload.feed[0].post).length).toBeLessThanOrEqual(220);
      expect(String(payload.feed[1].post).length).toBeLessThanOrEqual(80);
    });
  });

  it("builds a multi-persona agent feed in llm mode", async () => {
    const openaiFetch: typeof fetch = async () => {
      return new Response(
        JSON.stringify({
          output: [
            {
              type: "message",
              content: [
                {
                  type: "output_text",
                  text: "Signal update (confidence: 84/100)",
                },
              ],
            },
          ],
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      );
    };

    await withServer(
      { openaiApiKey: "test-key", openaiFetchFn: openaiFetch },
      async (baseUrl) => {
        const res = await fetch(`${baseUrl}/api/agent-feed`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            mode: "llm",
            items: [
              { title: "Rates cool off", url: "https://example.com/rates" },
            ],
            personaNames: ["Analyst", "Macro Hawk"],
            llmModel: "gpt-4.1-mini",
            channel: "x",
            template: "straight",
            maxChars: 220,
          }),
        });

        expect(res.status).toBe(200);
        const payload = await res.json();
        expect(payload.mode).toBe("llm");
        expect(payload.feed).toHaveLength(2);
        expect(String(payload.feed[0].post)).toMatch(/confidence/i);
      },
    );
  });

  it("supports consensus layout for agent feed", async () => {
    await withServer({}, async (baseUrl) => {
      const res = await fetch(`${baseUrl}/api/agent-feed`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          layout: "consensus",
          items: [
            { title: "Top event", url: "https://example.com/top" },
            { title: "Second event", url: "https://example.com/second" },
          ],
          personaLimit: 3,
          channel: "x",
          template: "straight",
          maxChars: 220,
        }),
      });

      expect(res.status).toBe(200);
      const payload = await res.json();
      expect(payload.layout).toBe("consensus");
      expect(payload.feed).toHaveLength(3);
      const titles = payload.feed.map(
        (entry: { itemTitle: string }) => entry.itemTitle,
      );
      expect(new Set(titles)).toEqual(new Set(["Top event"]));
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

  it("reports retry and latency diagnostics in fetch summary", async () => {
    const nonce = `diagnostics-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const retryUrl = `http://localhost/${nonce}-retry.xml`;
    const okUrl = `http://localhost/${nonce}-ok.xml`;
    const attemptsByUrl = new Map<string, number>();

    const fetchFn: typeof fetch = async (href) => {
      const key = String(href);
      const attempt = (attemptsByUrl.get(key) ?? 0) + 1;
      attemptsByUrl.set(key, attempt);

      if (key.includes("-retry.xml") && attempt === 1) {
        return new Response("temporary upstream failure", {
          status: 500,
          statusText: "Internal Server Error",
          headers: { "content-type": "text/plain" },
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 12));
      const name = key.split("/").at(-1) ?? "item.xml";
      const xml = `<?xml version="1.0"?>
<rss version="2.0"><channel>
  <item><title>${name}</title><link>http://localhost/${name}</link></item>
</channel></rss>`;
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
          urls: [retryUrl, okUrl],
          maxItems: 10,
          dedupe: false,
        }),
      });

      expect(res.status).toBe(200);
      const payload = await res.json();
      expect(payload.items).toHaveLength(2);
      expect(payload.summary).toMatchObject({
        sources: 2,
        retryAttempts: 1,
        retrySuccesses: 1,
      });
      expect(payload.summary.durationMs).toBeGreaterThan(0);
      expect(payload.summary.slowestFeedMs).toBeGreaterThan(0);
    });
  });

  it("respects fetchConcurrency for /api/fetch", async () => {
    const nonce = `concurrency-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const urls = Array.from(
      { length: 6 },
      (_unused, index) => `http://localhost/${nonce}-${index.toString(10)}.xml`,
    );

    let inFlight = 0;
    let maxInFlight = 0;
    const fetchFn: typeof fetch = async (href) => {
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      try {
        await new Promise((resolve) => setTimeout(resolve, 20));
        const suffix = String(href).split("/").at(-1) ?? "item.xml";
        const xml = `<?xml version="1.0"?>
<rss version="2.0"><channel>
  <item><title>${suffix}</title><link>http://localhost/${suffix}</link></item>
</channel></rss>`;
        return new Response(xml, {
          status: 200,
          headers: { "content-type": "application/rss+xml" },
        });
      } finally {
        inFlight -= 1;
      }
    };

    await withServer({ allowPrivateHosts: true, fetchFn }, async (baseUrl) => {
      const res = await fetch(`${baseUrl}/api/fetch`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          urls,
          maxItems: 10,
          dedupe: false,
          fetchConcurrency: 2,
        }),
      });

      expect(res.status).toBe(200);
      const payload = await res.json();
      expect(payload.summary).toMatchObject({
        sources: 6,
        concurrency: 2,
      });
      expect(payload.items).toHaveLength(6);
      expect(maxInFlight).toBeLessThanOrEqual(2);
    });
  });

  it("returns JSON 404 for unknown api routes", async () => {
    await withServer({}, async (baseUrl) => {
      const res = await fetch(`${baseUrl}/api/not-found`);
      expect(res.status).toBe(404);
      const payload = await res.json();
      expect(payload.error).toBe("Not found");
      expect(typeof payload.requestId).toBe("string");
      expect(payload.requestId.length).toBeGreaterThan(0);
      expect(res.headers.get("x-request-id")).toBe(payload.requestId);
    });
  });

  it("includes request id in API validation errors", async () => {
    await withServer({}, async (baseUrl) => {
      const res = await fetch(`${baseUrl}/api/generate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          personaName: "Analyst",
          template: "straight",
        }),
      });

      expect(res.status).toBe(400);
      const payload = await res.json();
      expect(typeof payload.error).toBe("string");
      expect(payload.error.length).toBeGreaterThan(0);
      expect(typeof payload.requestId).toBe("string");
      expect(payload.requestId.length).toBeGreaterThan(0);
      expect(res.headers.get("x-request-id")).toBe(payload.requestId);
    });
  });

  it("loads personas from markdown directory when configured", async () => {
    const tmpDir = mkdtempSync(path.join(os.tmpdir(), "feed-jarvis-server-"));
    const personasDir = path.join(tmpDir, "personas");

    try {
      mkdirSync(personasDir, { recursive: true });
      writeFileSync(
        path.join(personasDir, "finance.md"),
        "name: Finance Wire\nprefix: Finance Wire:\n",
        "utf8",
      );

      await withServer({ personasPath: personasDir }, async (baseUrl) => {
        const res = await fetch(`${baseUrl}/api/personas`);
        expect(res.status).toBe(200);
        const payload = await res.json();
        expect(Array.isArray(payload.personas)).toBe(true);
        expect(payload.personas).toHaveLength(1);
        expect(payload.personas[0]).toMatchObject({
          name: "Finance Wire",
          prefix: "Finance Wire:",
        });
      });
    } finally {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
