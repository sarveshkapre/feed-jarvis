import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import type { Download, Page } from "playwright";
import { chromium } from "playwright";
import { createStudioServer } from "../src/server.js";

async function startServer() {
  const feedXml = `<?xml version="1.0"?>
<rss version="2.0"><channel>
  <item><title>Alpha release notes</title><link>https://example.com/alpha</link></item>
  <item><title>Beta launch recap</title><link>https://example.com/beta</link></item>
</channel></rss>`;

  const fetchFn: typeof fetch = async () => {
    return new Response(feedXml, {
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
    throw new Error("Unable to resolve server address for E2E test.");
  }

  return {
    server,
    baseUrl: `http://127.0.0.1:${address.port}`,
  };
}

async function stopServer(server: ReturnType<typeof createStudioServer>) {
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

async function waitForStatusText(
  page: Page,
  selector: string,
  expectedText: string,
) {
  await page.waitForFunction(
    ({ statusSelector, text }) => {
      const element = document.querySelector(statusSelector);
      if (!element) return false;
      return (element.textContent ?? "").includes(text);
    },
    { statusSelector: selector, text: expectedText },
  );
}

async function readDownload(download: Download): Promise<string> {
  const filePath = await download.path();
  if (!filePath) {
    throw new Error("Download path was not available.");
  }
  return readFile(filePath, "utf8");
}

async function triggerDownload(page: Page, selector: string): Promise<string> {
  const button = page.locator(selector);
  await button.waitFor({ state: "visible" });
  const disabled = await button.isDisabled();
  assert.equal(disabled, false, `Expected ${selector} to be enabled.`);

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    button.click(),
  ]);
  return readDownload(download);
}

function assertCsvHeader(csvPayload: string) {
  const [header] = csvPayload.trim().split("\n");
  assert(header, "CSV payload should include a header row.");
  const requiredColumns = [
    "channel",
    "mode",
    "llm_model",
    "template",
    "persona_name",
    "persona_prefix",
    "title",
    "url",
    "post",
  ];
  for (const column of requiredColumns) {
    assert(
      header.split(",").includes(column),
      `CSV header missing column: ${column}`,
    );
  }
}

function assertAgentFeedPayload(agentFeedPayload: string) {
  const parsed = JSON.parse(agentFeedPayload);
  assert(
    parsed && typeof parsed === "object",
    "Agent feed payload should be JSON object.",
  );

  const meta = Reflect.get(parsed, "meta");
  const feed = Reflect.get(parsed, "feed");

  assert(
    meta && typeof meta === "object",
    "Agent feed payload should include meta object.",
  );
  assert(Array.isArray(feed), "Agent feed payload should include feed array.");
  assert.equal(
    feed.length,
    3,
    "Expected three agent feed rows for personaLimit=3.",
  );
  assert.equal(Reflect.get(meta, "layout"), "consensus");
  assert.equal(Reflect.get(meta, "mode"), "template");
  assert.equal(Reflect.get(meta, "personaLimit"), 3);

  for (const row of feed) {
    assert(
      row && typeof row === "object",
      "Each agent feed row should be an object.",
    );
    assert.equal(typeof Reflect.get(row, "personaName"), "string");
    assert.equal(typeof Reflect.get(row, "personaPrefix"), "string");
    assert.equal(Reflect.get(row, "itemTitle"), "Alpha release notes");
    assert.equal(Reflect.get(row, "itemUrl"), "https://example.com/alpha");
    assert.equal(typeof Reflect.get(row, "post"), "string");
  }
}

async function run() {
  const { server, baseUrl } = await startServer();
  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const context = await browser.newContext({ acceptDownloads: true });
    await context.grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: baseUrl,
    });
    const page = await context.newPage();

    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await page.locator("#feedUrls").fill("https://example.com/feed.xml");
    await page.locator("#fetchBtn").click();
    await waitForStatusText(
      page,
      "#itemsStatus",
      "Loaded 2 item(s) from 1 feed(s).",
    );

    const itemCount = await page.locator("#itemsList li").count();
    assert(itemCount >= 2, "Expected at least two preview items.");

    await page.locator("#generateBtn").click();
    await waitForStatusText(
      page,
      "#postsStatus",
      "Generated 2 drafts via template engine.",
    );

    const postCount = await page.locator("#postsList .post-card").count();
    assert.equal(postCount, 2, "Expected two generated post cards.");

    const txtPayload = await triggerDownload(page, "#downloadTxtBtn");
    assert.match(txtPayload, /https:\/\/example\.com\/alpha/);
    assert.match(txtPayload, /https:\/\/example\.com\/beta/);

    const jsonlPayload = await triggerDownload(page, "#downloadJsonBtn");
    const jsonlLines = jsonlPayload
      .trim()
      .split("\n")
      .filter((line) => line.trim().length > 0);
    assert.equal(jsonlLines.length, 2, "Expected two JSONL draft rows.");
    const jsonRows = jsonlLines.map((line) => JSON.parse(line));
    assert.equal(jsonRows[0].channel, "x");
    assert.equal(jsonRows[0].mode, "template");
    assert.equal(typeof jsonRows[0].title, "string");
    assert.equal(typeof jsonRows[0].url, "string");
    assert.equal(typeof jsonRows[0].post, "string");

    const csvPayload = await triggerDownload(page, "#downloadCsvBtn");
    assertCsvHeader(csvPayload);
    assert.match(csvPayload, /https:\/\/example\.com\/alpha/);
    assert.match(csvPayload, /https:\/\/example\.com\/beta/);

    await page.locator("#agentPersonaLimit").fill("3");
    await page.locator("#agentLayoutSelect").selectOption("consensus");
    await page.locator("#buildAgentFeedBtn").click();
    await waitForStatusText(
      page,
      "#agentFeedStatus",
      "Built 3 feed post(s) (consensus).",
    );

    const agentFeedCount = await page
      .locator("#agentFeedList .post-card")
      .count();
    assert.equal(agentFeedCount, 3, "Expected three Step 4 agent feed cards.");
    const firstAgentSource = await page
      .locator("#agentFeedList .post-card .post-source-title")
      .first()
      .textContent();
    assert.match(
      firstAgentSource ?? "",
      /Alpha release notes/,
      "Expected consensus layout to target the top item.",
    );

    await page.locator("#copyAgentFeedBtn").click();
    await waitForStatusText(page, "#agentFeedStatus", "Copied to clipboard.");

    const agentFeedPayload = await triggerDownload(
      page,
      "#downloadAgentFeedBtn",
    );
    assertAgentFeedPayload(agentFeedPayload);

    await context.close();

    console.log("E2E smoke passed:");
    console.log("- critical flow: fetch -> generate -> export");
    console.log("- exports: txt, jsonl, csv");
    console.log("- agent feed: build -> copy -> download");
  } finally {
    await browser.close();
    await stopServer(server);
  }
}

run().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exit(1);
});
