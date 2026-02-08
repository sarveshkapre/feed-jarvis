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

  it("returns JSON 404 for unknown api routes", async () => {
    await withServer({}, async (baseUrl) => {
      const res = await fetch(`${baseUrl}/api/not-found`);
      expect(res.status).toBe(404);
      const payload = await res.json();
      expect(payload).toEqual({ error: "Not found" });
    });
  });
});
