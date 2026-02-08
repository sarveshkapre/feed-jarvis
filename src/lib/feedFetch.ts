import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { isIP } from "node:net";
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
  allowPrivateHosts?: boolean;
  now?: () => number;
  fetchFn?: typeof fetch;
  staleIfError?: boolean;
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
  const fetchFn = options.fetchFn ?? fetch;
  const allowPrivateHosts = options.allowPrivateHosts ?? true;
  const parsedUrl = new URL(url);
  if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
    throw new Error(`Unsupported URL protocol: ${parsedUrl.protocol}`);
  }
  if (!allowPrivateHosts) {
    enforcePublicHost(parsedUrl);
  }
  enforceAllowlist(parsedUrl, options.allowHosts);

  const cacheDir = options.cacheDir ?? getDefaultCacheDir();
  const cacheKey = createHash("sha256").update(url).digest("hex");
  const cachePath = path.join(cacheDir, `${cacheKey}.json`);

  const cached = options.cache
    ? await readCache(cachePath, now(), options.cacheTtlMs, true)
    : null;

  if (
    cached &&
    options.cacheTtlMs > 0 &&
    now() - cached.fetchedAtMs <= options.cacheTtlMs
  ) {
    return {
      items: parseFeedXml(cached.xml, options.maxItems),
      source: "cache",
    };
  }

  let fetchResult: {
    xml: string;
    etag?: string;
    lastModified?: string;
    notModified?: boolean;
  };
  try {
    fetchResult = await fetchXml(
      url,
      options.allowHosts,
      allowPrivateHosts,
      options.maxBytes,
      options.timeoutMs,
      fetchFn,
      cached,
    );
  } catch (err) {
    if (options.staleIfError && cached) {
      return {
        items: parseFeedXml(cached.xml, options.maxItems),
        source: "cache",
      };
    }
    throw err;
  }

  if (options.cache) {
    await writeCache(cachePath, {
      fetchedAtMs: now(),
      url,
      xml: fetchResult.xml,
      etag: fetchResult.etag,
      lastModified: fetchResult.lastModified,
    });
  }

  return {
    items: parseFeedXml(fetchResult.xml, options.maxItems),
    source: fetchResult.notModified ? "cache" : "network",
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
  etag?: string;
  lastModified?: string;
};

async function readCache(
  cachePath: string,
  nowMs: number,
  cacheTtlMs: number,
  ignoreTtl = false,
): Promise<CacheEntry | null> {
  try {
    const raw = await readFile(cachePath, "utf8");
    const parsed = JSON.parse(raw) as CacheEntry;
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.fetchedAtMs !== "number") return null;
    if (typeof parsed.url !== "string") return null;
    if (typeof parsed.xml !== "string") return null;
    if (parsed.etag && typeof parsed.etag !== "string") return null;
    if (parsed.lastModified && typeof parsed.lastModified !== "string")
      return null;

    if (!ignoreTtl) {
      if (cacheTtlMs <= 0) return null;
      if (nowMs - parsed.fetchedAtMs > cacheTtlMs) return null;
    }

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
  allowHosts: string[],
  allowPrivateHosts: boolean,
  maxBytes: number,
  timeoutMs: number,
  fetchFn: typeof fetch,
  cacheEntry?: CacheEntry | null,
): Promise<{
  xml: string;
  etag?: string;
  lastModified?: string;
  notModified?: boolean;
}> {
  let currentUrl = new URL(url);
  for (let redirectCount = 0; redirectCount <= 5; redirectCount++) {
    if (currentUrl.protocol !== "https:" && currentUrl.protocol !== "http:") {
      throw new Error(`Unsupported URL protocol: ${currentUrl.protocol}`);
    }
    if (!allowPrivateHosts) {
      enforcePublicHost(currentUrl);
    }
    enforceAllowlist(currentUrl, allowHosts);

    const headers: Record<string, string> = {
      "user-agent": "feed-jarvis/0.0.0",
      accept:
        "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.1",
    };
    if (cacheEntry?.etag) headers["if-none-match"] = cacheEntry.etag;
    if (cacheEntry?.lastModified)
      headers["if-modified-since"] = cacheEntry.lastModified;

    const res = await fetchFn(currentUrl.toString(), {
      redirect: "manual",
      signal: AbortSignal.timeout(timeoutMs),
      headers,
    });

    if (res.status === 304) {
      if (!cacheEntry) {
        throw new Error("Received 304 without a cached response");
      }
      return {
        xml: cacheEntry.xml,
        etag: cacheEntry.etag,
        lastModified: cacheEntry.lastModified,
        notModified: true,
      };
    }

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) {
        throw new Error(`Redirect (${res.status}) without Location header`);
      }
      currentUrl = new URL(location, currentUrl);
      continue;
    }

    if (!res.ok) {
      throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
    }

    const etag = res.headers.get("etag") ?? undefined;
    const lastModified = res.headers.get("last-modified") ?? undefined;

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
      return { xml: text, etag, lastModified };
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

    return { xml: new TextDecoder().decode(combined), etag, lastModified };
  }

  throw new Error("Too many redirects");
}

function enforcePublicHost(url: URL): void {
  const host = url.hostname.toLowerCase();

  if (host === "localhost" || host.endsWith(".localhost")) {
    throw new Error(
      `Refusing private host: ${url.hostname}. Set allowPrivateHosts=true for trusted local feeds.`,
    );
  }
  if (host.endsWith(".local")) {
    throw new Error(
      `Refusing local-network host: ${url.hostname}. Set allowPrivateHosts=true for trusted local feeds.`,
    );
  }

  const ipVersion = isIP(host);
  if (ipVersion === 4 && isPrivateIpv4(host)) {
    throw new Error(
      `Refusing private IP host: ${url.hostname}. Set allowPrivateHosts=true for trusted local feeds.`,
    );
  }
  if (ipVersion === 6 && isPrivateIpv6(host)) {
    throw new Error(
      `Refusing private IP host: ${url.hostname}. Set allowPrivateHosts=true for trusted local feeds.`,
    );
  }
}

function isPrivateIpv4(host: string): boolean {
  const parts = host.split(".").map((value) => Number(value));
  if (parts.length !== 4 || parts.some((value) => !Number.isInteger(value))) {
    return false;
  }

  const [a, b] = parts;
  if (a === undefined || b === undefined) return false;

  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 198 && (b === 18 || b === 19)) return true;
  if (a >= 224) return true;

  return false;
}

function isPrivateIpv6(host: string): boolean {
  const normalized = host.toLowerCase();
  if (normalized === "::1" || normalized === "::") return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  if (/^fe[89ab]/.test(normalized)) return true;

  const mappedV4 = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mappedV4?.[1]) {
    return isPrivateIpv4(mappedV4[1]);
  }

  return false;
}
