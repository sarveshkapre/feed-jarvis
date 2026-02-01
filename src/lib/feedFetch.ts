import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { FeedItem } from "./posts.js";
import { parseFeedXml } from "./rss.js";

export type FetchFeedOptions = {
  allowHosts: string[];
  cache: boolean;
  cacheDir?: string;
  cacheTtlMs: number;
  maxBytes: number;
  maxItems: number;
  timeoutMs: number;
  now?: () => number;
};

export type FetchFeedResult = {
  items: FeedItem[];
  source: "cache" | "network";
};

export async function fetchFeed(
  url: string,
  options: FetchFeedOptions,
): Promise<FetchFeedResult> {
  const now = options.now ?? (() => Date.now());
  const parsedUrl = new URL(url);
  if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
    throw new Error(`Unsupported URL protocol: ${parsedUrl.protocol}`);
  }
  enforceAllowlist(parsedUrl, options.allowHosts);

  const cacheDir = options.cacheDir ?? getDefaultCacheDir();
  const cacheKey = createHash("sha256").update(url).digest("hex");
  const cachePath = path.join(cacheDir, `${cacheKey}.json`);

  if (options.cache) {
    const cached = await readCache(cachePath, now(), options.cacheTtlMs);
    if (cached) {
      return {
        items: parseFeedXml(cached.xml, options.maxItems),
        source: "cache",
      };
    }
  }

  const xml = await fetchXml(url, options.maxBytes, options.timeoutMs);

  if (options.cache) {
    await writeCache(cachePath, {
      fetchedAtMs: now(),
      url,
      xml,
    });
  }

  return {
    items: parseFeedXml(xml, options.maxItems),
    source: "network",
  };
}

function enforceAllowlist(url: URL, allowHosts: string[]): void {
  if (allowHosts.length === 0) {
    throw new Error(
      "Refusing to fetch without an allowlist. Pass one or more --allow-host entries.",
    );
  }

  const host = url.hostname.toLowerCase();
  const allowed = allowHosts.some((raw) => {
    const needle = raw.trim().toLowerCase();
    if (!needle) return false;
    if (needle.startsWith("."))
      return host === needle.slice(1) || host.endsWith(needle);
    return host === needle;
  });

  if (!allowed) {
    throw new Error(
      `Host not allowlisted: ${url.hostname} (allowed: ${allowHosts.join(", ")})`,
    );
  }
}

type CacheEntry = {
  fetchedAtMs: number;
  url: string;
  xml: string;
};

async function readCache(
  cachePath: string,
  nowMs: number,
  cacheTtlMs: number,
): Promise<CacheEntry | null> {
  try {
    const raw = await readFile(cachePath, "utf8");
    const parsed = JSON.parse(raw) as CacheEntry;
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.fetchedAtMs !== "number") return null;
    if (typeof parsed.url !== "string") return null;
    if (typeof parsed.xml !== "string") return null;

    if (cacheTtlMs <= 0) return null;
    if (nowMs - parsed.fetchedAtMs > cacheTtlMs) return null;

    return parsed;
  } catch {
    return null;
  }
}

async function writeCache(cachePath: string, entry: CacheEntry): Promise<void> {
  const dir = path.dirname(cachePath);
  await mkdir(dir, { recursive: true });

  const tmpPath = `${cachePath}.tmp-${process.pid}-${Date.now()}`;
  await writeFile(tmpPath, JSON.stringify(entry), "utf8");
  await rename(tmpPath, cachePath);
}

function getDefaultCacheDir(): string {
  const fromEnv = process.env.FEED_JARVIS_CACHE_DIR?.trim();
  if (fromEnv) return fromEnv;

  const home = os.homedir();
  if (process.platform === "darwin") {
    return path.join(home, "Library", "Caches", "feed-jarvis");
  }
  const xdg = process.env.XDG_CACHE_HOME?.trim();
  if (xdg) return path.join(xdg, "feed-jarvis");
  return path.join(home, ".cache", "feed-jarvis");
}

async function fetchXml(
  url: string,
  maxBytes: number,
  timeoutMs: number,
): Promise<string> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      "user-agent": "feed-jarvis/0.0.0",
      accept:
        "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.1",
    },
  });

  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  }

  const lengthHeader = res.headers.get("content-length");
  if (lengthHeader) {
    const length = Number(lengthHeader);
    if (Number.isFinite(length) && length > maxBytes) {
      throw new Error(`Feed too large: ${length} bytes (max: ${maxBytes})`);
    }
  }

  if (!res.body) {
    const text = await res.text();
    if (Buffer.byteLength(text, "utf8") > maxBytes) {
      throw new Error(`Feed too large (max: ${maxBytes} bytes)`);
    }
    return text;
  }

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    received += value.byteLength;
    if (received > maxBytes) {
      throw new Error(`Feed too large (max: ${maxBytes} bytes)`);
    }
    chunks.push(value);
  }

  const combined = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder().decode(combined);
}
