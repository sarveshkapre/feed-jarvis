import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("cli", () => {
  it("supports stdin input via --input -", () => {
    const cli = "./node_modules/.bin/tsx";
    const args = [
      "src/cli.ts",
      "generate",
      "--input",
      "-",
      "--persona",
      "Analyst",
      "--max-chars",
      "120",
    ];
    const input = JSON.stringify([
      { title: "Release notes", url: "https://example.com/r1" },
    ]);

    const res = spawnSync(cli, args, {
      input,
      encoding: "utf8",
    });

    expect(res.status).toBe(0);
    expect(String(res.stdout)).toMatch(/Analysis:/);
    expect(String(res.stdout).length).toBeGreaterThan(0);
  });

  it("prints generate stats to stderr with --stats", () => {
    const cli = "./node_modules/.bin/tsx";
    const args = [
      "src/cli.ts",
      "generate",
      "--input",
      "-",
      "--persona",
      "Analyst",
      "--max-chars",
      "120",
      "--stats",
    ];
    const input = JSON.stringify([
      { title: "Release notes", url: "https://example.com/r1" },
      { title: "Launch post", url: "https://example.com/r2" },
    ]);

    const res = spawnSync(cli, args, {
      input,
      encoding: "utf8",
    });

    expect(res.status).toBe(0);
    expect(String(res.stderr)).toMatch(/Feed Jarvis generate stats:/);
    expect(String(res.stderr)).toMatch(/- posts: 2/);
  });

  it("supports fetch --opml input", async () => {
    const xml = `<?xml version="1.0"?>\n<rss version="2.0"><channel><item><title>OPML item</title><link>http://127.0.0.1/item</link></item></channel></rss>`;

    const server = createServer((_req, res) => {
      res.writeHead(200, { "content-type": "application/rss+xml" });
      res.end(xml);
    });
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => resolve());
    });

    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Failed to resolve test server address.");
    }

    const tmpDir = mkdtempSync(path.join(os.tmpdir(), "feed-jarvis-opml-"));
    const opmlPath = path.join(tmpDir, "feeds.opml");
    const feedUrl = `http://127.0.0.1:${address.port}/feed.xml`;
    const opml = `<?xml version="1.0"?>\n<opml version="2.0"><body><outline text="Feed" xmlUrl="${feedUrl}" /></body></opml>`;
    writeFileSync(opmlPath, opml, "utf8");

    try {
      const cli = "./node_modules/.bin/tsx";
      const args = [
        "src/cli.ts",
        "fetch",
        "--opml",
        opmlPath,
        "--allow-host",
        "127.0.0.1",
        "--no-cache",
      ];

      const res = await runCli(cli, args);

      expect(res.status).toBe(0);
      const parsed = JSON.parse(res.stdout);
      expect(parsed).toEqual([
        {
          title: "OPML item",
          url: "http://127.0.0.1/item",
        },
      ]);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("supports fetch --urls-file input", async () => {
    const xml = `<?xml version="1.0"?>\n<rss version="2.0"><channel><item><title>File item</title><link>http://127.0.0.1/item</link></item></channel></rss>`;

    const server = createServer((_req, res) => {
      res.writeHead(200, { "content-type": "application/rss+xml" });
      res.end(xml);
    });
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => resolve());
    });

    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Failed to resolve test server address.");
    }

    const tmpDir = mkdtempSync(path.join(os.tmpdir(), "feed-jarvis-urls-"));
    const urlsPath = path.join(tmpDir, "feeds.txt");
    const feedUrl = `http://127.0.0.1:${address.port}/feed.xml`;
    writeFileSync(
      urlsPath,
      `# comment line\n${feedUrl}\n${feedUrl}\n\n`,
      "utf8",
    );

    try {
      const cli = "./node_modules/.bin/tsx";
      const args = [
        "src/cli.ts",
        "fetch",
        "--urls-file",
        urlsPath,
        "--allow-host",
        "127.0.0.1",
        "--no-cache",
      ];

      const res = await runCli(cli, args);

      expect(res.status).toBe(0);
      const parsed = JSON.parse(res.stdout);
      expect(parsed).toEqual([
        {
          title: "File item",
          url: "http://127.0.0.1/item",
        },
      ]);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("enforces --fetch-concurrency for multi-feed fetches", async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    const server = createServer((req, res) => {
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);

      setTimeout(() => {
        const suffix = (req.url ?? "/feed").replace(/\W+/g, "-");
        const xml = `<?xml version="1.0"?>\n<rss version="2.0"><channel><item><title>${suffix}</title><link>http://127.0.0.1${req.url ?? "/feed"}</link></item></channel></rss>`;
        res.writeHead(200, { "content-type": "application/rss+xml" });
        res.end(xml);
        inFlight -= 1;
      }, 25);
    });
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => resolve());
    });

    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Failed to resolve test server address.");
    }

    const tmpDir = mkdtempSync(
      path.join(os.tmpdir(), "feed-jarvis-concurrency-"),
    );
    const urlsPath = path.join(tmpDir, "feeds.txt");
    const urls = Array.from(
      { length: 6 },
      (_unused, index) =>
        `http://127.0.0.1:${address.port}/feed-${index.toString(10)}.xml`,
    );
    writeFileSync(urlsPath, `${urls.join("\n")}\n`, "utf8");

    try {
      const res = await runCli("./node_modules/.bin/tsx", [
        "src/cli.ts",
        "fetch",
        "--urls-file",
        urlsPath,
        "--allow-host",
        "127.0.0.1",
        "--no-cache",
        "--max-items",
        "20",
        "--fetch-concurrency",
        "2",
        "--stats",
      ]);

      expect(res.status).toBe(0);
      expect(String(res.stderr)).toMatch(/- concurrency: 2/);
      const parsed = JSON.parse(res.stdout);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(6);
      expect(maxInFlight).toBeLessThanOrEqual(2);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("supports markdown persona directories via --personas", () => {
    const tmpDir = mkdtempSync(path.join(os.tmpdir(), "feed-jarvis-personas-"));
    const personasDir = path.join(tmpDir, "personas");
    const inputPath = path.join(tmpDir, "items.json");

    try {
      mkdirSync(personasDir, { recursive: true });
      writeFileSync(
        inputPath,
        JSON.stringify([
          {
            title: "Rate cut expectations shift",
            url: "https://example.com/r",
          },
        ]),
        "utf8",
      );
      writeFileSync(
        path.join(personasDir, "macro.md"),
        "name: Macro Hawk\nprefix: Macro Hawk:\n",
        "utf8",
      );

      const res = spawnSync(
        "./node_modules/.bin/tsx",
        [
          "src/cli.ts",
          "generate",
          "--input",
          inputPath,
          "--persona",
          "Macro Hawk",
          "--personas",
          personasDir,
          "--max-chars",
          "220",
        ],
        { encoding: "utf8" },
      );

      expect(res.status).toBe(0);
      expect(String(res.stdout)).toMatch(/Macro Hawk:/);
    } finally {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("loads bundled markdown personas by default", () => {
    const res = spawnSync(
      "./node_modules/.bin/tsx",
      ["src/cli.ts", "personas"],
      { encoding: "utf8" },
    );

    expect(res.status).toBe(0);
    expect(String(res.stdout)).toMatch(/Macro Hawk/);
    expect(String(res.stdout)).toMatch(/Analysis:/);
  });

  it("fails fast when --llm is used without OPENAI_API_KEY", () => {
    const tmpDir = mkdtempSync(path.join(os.tmpdir(), "feed-jarvis-llm-"));
    const inputPath = path.join(tmpDir, "items.json");

    try {
      writeFileSync(
        inputPath,
        JSON.stringify([
          { title: "Release notes", url: "https://example.com/r1" },
        ]),
        "utf8",
      );

      const env = { ...process.env };
      delete env.OPENAI_API_KEY;

      const res = spawnSync(
        "./node_modules/.bin/tsx",
        [
          "src/cli.ts",
          "generate",
          "--input",
          inputPath,
          "--persona",
          "Analyst",
          "--llm",
        ],
        {
          encoding: "utf8",
          env,
        },
      );

      expect(res.status).toBe(1);
      expect(String(res.stderr)).toMatch(/OPENAI_API_KEY/);
    } finally {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});

function runCli(
  cmd: string,
  args: string[],
): Promise<{ status: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });

    child.on("error", reject);
    child.on("close", (status) => {
      resolve({
        status,
        stdout,
        stderr,
      });
    });
  });
}
