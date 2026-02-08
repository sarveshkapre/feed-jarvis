import type { AddressInfo } from "node:net";
import { createStudioServer } from "../src/server.js";

async function run(): Promise<void> {
  const xml = `<?xml version="1.0"?>
<rss version="2.0"><channel>
  <item><title>Smoke test item</title><link>http://localhost/item</link></item>
</channel></rss>`;

  const fetchFn: typeof fetch = async () => {
    return new Response(xml, {
      status: 200,
      headers: { "content-type": "application/rss+xml" },
    });
  };

  const server = createStudioServer({
    allowPrivateHosts: true,
    fetchFn,
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      resolve();
    });
  });

  const address = server.address() as AddressInfo | null;
  if (!address || typeof address === "string") {
    throw new Error("Unable to resolve server address for smoke test.");
  }

  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const personasRes = await fetch(`${baseUrl}/api/personas`);
    if (!personasRes.ok) {
      throw new Error(`/api/personas failed with status ${personasRes.status}`);
    }

    const fetchRes = await fetch(`${baseUrl}/api/fetch`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        urls: ["http://localhost/feed.xml"],
        maxItems: 5,
        dedupe: true,
      }),
    });
    if (!fetchRes.ok) {
      throw new Error(`/api/fetch failed with status ${fetchRes.status}`);
    }
    const fetched = await fetchRes.json();

    const generateRes = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        items: fetched.items,
        personaName: "Analyst",
        channel: "x",
        template: "straight",
        maxChars: 200,
      }),
    });
    if (!generateRes.ok) {
      throw new Error(`/api/generate failed with status ${generateRes.status}`);
    }

    const indexRes = await fetch(`${baseUrl}/`);
    if (!indexRes.ok) {
      throw new Error(`/ failed with status ${indexRes.status}`);
    }

    console.log("Smoke check passed:");
    console.log(`- personas: ${personasRes.status}`);
    console.log(`- fetch: ${fetchRes.status} (${fetched.items.length} item)`);
    console.log(`- generate: ${generateRes.status}`);
    console.log(`- index: ${indexRes.status}`);
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

run().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exit(1);
});
