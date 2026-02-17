import type { AddressInfo } from "node:net";
import {
  assertFetchHappyPathPayload,
  assertFetchPartialSuccessPayload,
} from "../src/lib/fetchContract.js";
import { createStudioServer } from "../src/server.js";

async function run(): Promise<void> {
  const xml = `<?xml version="1.0"?>
<rss version="2.0"><channel>
  <item><title>Smoke test item</title><link>http://localhost/item</link></item>
</channel></rss>`;

  const fetchFn: typeof fetch = async (input) => {
    const href = String(input);
    if (href.includes("smoke-fail.xml")) {
      return new Response("upstream unavailable", {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "content-type": "text/plain" },
      });
    }
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
    const fetched = assertFetchHappyPathPayload(await fetchRes.json());

    const partialFetchRes = await fetch(`${baseUrl}/api/fetch`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        urls: ["http://localhost/feed.xml", "http://localhost/smoke-fail.xml"],
        maxItems: 5,
        dedupe: true,
      }),
    });
    if (!partialFetchRes.ok) {
      throw new Error(
        `/api/fetch partial-success check failed with status ${partialFetchRes.status}`,
      );
    }
    const partialFetched = assertFetchPartialSuccessPayload(
      await partialFetchRes.json(),
    );
    if (
      partialFetched.items.length !== 1 ||
      partialFetched.failures.length !== 1
    ) {
      throw new Error(
        "Expected partial-success /api/fetch to return 1 item and 1 failure.",
      );
    }

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
    console.log(
      `- fetch (partial success): ${partialFetchRes.status} (${partialFetched.items.length} item, ${partialFetched.failures.length} failure)`,
    );
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
