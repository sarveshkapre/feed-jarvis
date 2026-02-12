import { existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { createServer, type Server } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchFeed } from "./lib/feedFetch.js";
import { generatePostsWithLlm } from "./lib/llm.js";
import {
  DEFAULT_PERSONAS,
  getPersona,
  loadPersonasPath,
  type Persona,
} from "./lib/personas.js";
import {
  applyUtmToUrl,
  type FeedItem,
  generatePost,
  generatePosts,
  type PostChannel,
  type PostRules,
  type PostTemplate,
} from "./lib/posts.js";

const PORT = Number(process.env.PORT) || 4321;
const MAX_BODY_BYTES = 1_000_000;
const DEFAULT_MAX_ITEMS = 20;
const DEFAULT_CACHE_TTL_MS = 15 * 60 * 1000;
const DEFAULT_TIMEOUT_MS = 12_000;
const DEFAULT_MAX_BYTES = 1_000_000;
const DEFAULT_ALLOW_PRIVATE_HOSTS = false;
const DEFAULT_LLM_MODEL = "gpt-4.1-mini";
const bundledPersonasPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../personas",
);

const webRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../web",
);

const mimeTypes: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

export type StudioServerOptions = {
  allowPrivateHosts?: boolean;
  fetchFn?: typeof fetch;
  port?: number;
  personasPath?: string;
  openaiApiKey?: string;
  openaiBaseUrl?: string;
  openaiFetchFn?: typeof fetch;
  llmModel?: string;
};

type RuntimeOptions = {
  allowPrivateHosts: boolean;
  fetchFn?: typeof fetch;
  openaiApiKey?: string;
  openaiBaseUrl?: string;
  openaiFetchFn?: typeof fetch;
  llmModel: string;
};

function sendJson(
  res: import("node:http").ServerResponse,
  status: number,
  payload: unknown,
) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(`${JSON.stringify(payload)}\n`);
}

async function readJsonBody(
  req: import("node:http").IncomingMessage,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let bytes = 0;
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => {
      bytes += chunk.length;
      if (bytes > MAX_BODY_BYTES) {
        reject(new Error("Request too large."));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (chunks.length === 0) {
        resolve(null);
        return;
      }
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(JSON.parse(raw));
      } catch (_err) {
        reject(new Error("Invalid JSON body."));
      }
    });
    req.on("error", reject);
  });
}

function normalizeUrls(input: unknown): string[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input
      .map((value) => (typeof value === "string" ? value.trim() : ""))
      .filter((value) => value.length > 0);
  }
  if (typeof input === "string") {
    return input
      .split(/\n|,/)
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
  }
  return [];
}

function dedupeByUrl(items: FeedItem[]): FeedItem[] {
  const seen = new Set<string>();
  const out: FeedItem[] = [];
  for (const item of items) {
    const key = item.url.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function ensureFeedItems(raw: unknown): FeedItem[] {
  if (!Array.isArray(raw)) {
    throw new Error("Expected an array of {title, url} items.");
  }
  return raw.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`Invalid item at index ${index}.`);
    }
    const title = Reflect.get(item, "title");
    const url = Reflect.get(item, "url");
    if (typeof title !== "string" || typeof url !== "string") {
      throw new Error(`Invalid item at index ${index}.`);
    }
    const trimmedTitle = title.trim();
    const trimmedUrl = url.trim();
    if (!trimmedTitle || !trimmedUrl) {
      throw new Error(`Invalid item at index ${index}.`);
    }
    return { title: trimmedTitle, url: trimmedUrl };
  });
}

async function handleFetchFeed(body: unknown, options: RuntimeOptions) {
  if (!body || typeof body !== "object") {
    throw new Error("Missing request body.");
  }
  const urls = normalizeUrls(
    Reflect.get(body, "urls") ?? Reflect.get(body, "url"),
  );
  if (urls.length === 0) {
    throw new Error("Provide at least one feed URL.");
  }

  const maxItemsRaw = Number(Reflect.get(body, "maxItems"));
  const maxItems =
    Number.isFinite(maxItemsRaw) && maxItemsRaw > 0
      ? Math.floor(maxItemsRaw)
      : DEFAULT_MAX_ITEMS;
  const dedupe = Reflect.get(body, "dedupe") !== false;

  const allowHosts = Array.from(
    new Set(
      urls.map((value) => {
        const parsed = new URL(value);
        return parsed.hostname;
      }),
    ),
  );

  const results = await Promise.all(
    urls.map((url) =>
      fetchFeed(url, {
        allowHosts,
        allowPrivateHosts: options.allowPrivateHosts,
        cache: true,
        cacheTtlMs: DEFAULT_CACHE_TTL_MS,
        fetchFn: options.fetchFn,
        maxBytes: DEFAULT_MAX_BYTES,
        maxItems,
        timeoutMs: DEFAULT_TIMEOUT_MS,
      }),
    ),
  );

  const items = results.flatMap((result) => result.items);
  const dedupedItems = dedupe ? dedupeByUrl(items) : items;
  const finalItems = dedupedItems.slice(0, maxItems);
  const cacheCount = results.filter(
    (result) => result.source === "cache",
  ).length;

  return {
    items: finalItems,
    summary: {
      sources: results.length,
      cache: cacheCount,
      network: results.length - cacheCount,
      dedupe: dedupe,
      deduped: dedupe ? items.length - dedupedItems.length : 0,
      limited: dedupedItems.length - finalItems.length,
    },
  };
}

function resolvePersona(
  body: Record<string, unknown>,
  personas: Persona[],
): Persona {
  const custom = Reflect.get(body, "personaCustom");
  if (custom && typeof custom === "object") {
    const name =
      typeof Reflect.get(custom, "name") === "string"
        ? String(Reflect.get(custom, "name")).trim()
        : "";
    const prefix =
      typeof Reflect.get(custom, "prefix") === "string"
        ? String(Reflect.get(custom, "prefix")).trim()
        : "";
    return {
      name: name || "Custom",
      prefix: prefix || `${name || "Custom"}:`,
    };
  }

  const personaName =
    typeof Reflect.get(body, "personaName") === "string"
      ? String(Reflect.get(body, "personaName")).trim()
      : "Analyst";
  return getPersona(personaName, personas);
}

async function handleGenerate(
  body: unknown,
  personas: Persona[],
  runtime: RuntimeOptions,
) {
  if (!body || typeof body !== "object") {
    throw new Error("Missing request body.");
  }

  const items = ensureFeedItems(Reflect.get(body, "items"));
  const maxCharsRaw = Number(Reflect.get(body, "maxChars"));
  const maxChars =
    Number.isFinite(maxCharsRaw) && maxCharsRaw > 0
      ? Math.floor(maxCharsRaw)
      : 280;
  const persona = resolvePersona(body as Record<string, unknown>, personas);
  const channel = resolveChannel(Reflect.get(body, "channel"));
  const template = resolveTemplate(Reflect.get(body, "template"));
  const rules = resolveRules(Reflect.get(body, "rules"));
  const resolvedItems = applyRulesToItems(items, rules);
  const mode = resolveGenerationMode(Reflect.get(body, "mode"));

  if (mode === "llm") {
    const apiKey = runtime.openaiApiKey?.trim();
    if (!apiKey) {
      throw new Error(
        "LLM generation is not configured. Set OPENAI_API_KEY on the server.",
      );
    }
    const model =
      typeof Reflect.get(body, "llmModel") === "string" &&
      String(Reflect.get(body, "llmModel")).trim()
        ? String(Reflect.get(body, "llmModel")).trim()
        : runtime.llmModel;
    return {
      posts: await generatePostsWithLlm(resolvedItems, persona, {
        apiKey,
        model,
        maxChars,
        channel,
        template,
        rules,
        apiBaseUrl: runtime.openaiBaseUrl,
        fetchFn: runtime.openaiFetchFn,
      }),
      items: resolvedItems,
      mode: "llm",
      llmModel: model,
    };
  }

  return {
    posts: generatePosts(resolvedItems, persona, maxChars, {
      channel,
      template,
      rules,
    }),
    items: resolvedItems,
    mode: "template",
  };
}

async function handleAgentFeed(
  body: unknown,
  personas: Persona[],
  runtime: RuntimeOptions,
) {
  if (!body || typeof body !== "object") {
    throw new Error("Missing request body.");
  }

  const items = ensureFeedItems(Reflect.get(body, "items"));
  if (items.length === 0) {
    throw new Error("Provide at least one item.");
  }

  const maxCharsRaw = Number(Reflect.get(body, "maxChars"));
  const maxChars =
    Number.isFinite(maxCharsRaw) && maxCharsRaw > 0
      ? Math.floor(maxCharsRaw)
      : 280;
  const channel = resolveChannel(Reflect.get(body, "channel"));
  const template = resolveTemplate(Reflect.get(body, "template"));
  const rules = resolveRules(Reflect.get(body, "rules"));
  const resolvedItems = applyRulesToItems(items, rules);
  const mode = resolveGenerationMode(Reflect.get(body, "mode"));
  const personaNames = normalizeStringList(Reflect.get(body, "personaNames"));
  const layout = resolveAgentFeedLayout(Reflect.get(body, "layout"));
  const personaLimitRaw = Number(Reflect.get(body, "personaLimit"));
  const personaLimit =
    Number.isFinite(personaLimitRaw) && personaLimitRaw > 0
      ? Math.min(100, Math.floor(personaLimitRaw))
      : 12;

  const selectedPersonas =
    personaNames.length > 0
      ? personaNames.map((name) => getPersona(name, personas))
      : personas.slice(0, personaLimit);

  if (selectedPersonas.length === 0) {
    throw new Error("No personas available for feed generation.");
  }

  if (mode === "llm") {
    const apiKey = runtime.openaiApiKey?.trim();
    if (!apiKey) {
      throw new Error(
        "LLM generation is not configured. Set OPENAI_API_KEY on the server.",
      );
    }
    const model =
      typeof Reflect.get(body, "llmModel") === "string" &&
      String(Reflect.get(body, "llmModel")).trim()
        ? String(Reflect.get(body, "llmModel")).trim()
        : runtime.llmModel;

    const feed = [];
    for (let i = 0; i < selectedPersonas.length; i++) {
      const persona = selectedPersonas[i];
      if (!persona) continue;
      const item = pickAgentFeedItem(resolvedItems, i, layout);
      if (!item) continue;
      const posts = await generatePostsWithLlm([item], persona, {
        apiKey,
        model,
        maxChars,
        channel,
        template,
        rules,
        apiBaseUrl: runtime.openaiBaseUrl,
        fetchFn: runtime.openaiFetchFn,
      });
      feed.push({
        personaName: persona.name,
        personaPrefix: persona.prefix,
        itemTitle: item.title,
        itemUrl: item.url,
        post: posts[0] ?? "",
      });
    }

    return {
      feed,
      mode: "llm",
      llmModel: model,
      layout,
      personasUsed: selectedPersonas.map((persona) => persona.name),
    };
  }

  const feed = selectedPersonas.map((persona, index) => {
    const item = pickAgentFeedItem(resolvedItems, index, layout);
    const post = item
      ? generatePost(item, persona, maxChars, { channel, template, rules })
      : "";
    return {
      personaName: persona.name,
      personaPrefix: persona.prefix,
      itemTitle: item?.title ?? "",
      itemUrl: item?.url ?? "",
      post,
    };
  });

  return {
    feed,
    mode: "template",
    layout,
    personasUsed: selectedPersonas.map((persona) => persona.name),
  };
}

function resolveChannel(value: unknown): PostChannel {
  if (value === "x" || value === "linkedin" || value === "newsletter") {
    return value;
  }
  return "x";
}

function resolveTemplate(value: unknown): PostTemplate {
  if (value === "straight" || value === "takeaway" || value === "cta") {
    return value;
  }
  return "straight";
}

function resolveRules(value: unknown): PostRules | undefined {
  if (!value || typeof value !== "object") return undefined;

  const prepend =
    typeof Reflect.get(value, "prepend") === "string"
      ? String(Reflect.get(value, "prepend")).trim()
      : "";
  const append =
    typeof Reflect.get(value, "append") === "string"
      ? String(Reflect.get(value, "append")).trim()
      : "";
  const hashtags =
    typeof Reflect.get(value, "hashtags") === "string"
      ? String(Reflect.get(value, "hashtags")).trim()
      : "";

  const utmRaw = Reflect.get(value, "utm");
  const utm =
    utmRaw && typeof utmRaw === "object"
      ? {
          source:
            typeof Reflect.get(utmRaw, "source") === "string"
              ? String(Reflect.get(utmRaw, "source")).trim()
              : undefined,
          medium:
            typeof Reflect.get(utmRaw, "medium") === "string"
              ? String(Reflect.get(utmRaw, "medium")).trim()
              : undefined,
          campaign:
            typeof Reflect.get(utmRaw, "campaign") === "string"
              ? String(Reflect.get(utmRaw, "campaign")).trim()
              : undefined,
          content:
            typeof Reflect.get(utmRaw, "content") === "string"
              ? String(Reflect.get(utmRaw, "content")).trim()
              : undefined,
          term:
            typeof Reflect.get(utmRaw, "term") === "string"
              ? String(Reflect.get(utmRaw, "term")).trim()
              : undefined,
        }
      : undefined;

  const normalizedUtm =
    utm && (utm.source || utm.medium || utm.campaign || utm.content || utm.term)
      ? utm
      : undefined;

  if (!prepend && !append && !hashtags && !normalizedUtm) return undefined;
  return {
    prepend: prepend || undefined,
    append: append || undefined,
    hashtags: hashtags || undefined,
    utm: normalizedUtm,
  };
}

function resolveGenerationMode(value: unknown): "template" | "llm" {
  if (value === "llm") return "llm";
  return "template";
}

function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter(Boolean);
}

function resolveAgentFeedLayout(value: unknown): "rotating" | "consensus" {
  if (value === "consensus") return "consensus";
  return "rotating";
}

function pickAgentFeedItem(
  items: FeedItem[],
  index: number,
  layout: "rotating" | "consensus",
): FeedItem | undefined {
  if (items.length === 0) return undefined;
  if (layout === "consensus") return items[0];
  return items[index % items.length];
}

function applyRulesToItems(items: FeedItem[], rules?: PostRules): FeedItem[] {
  const utm = rules?.utm;
  if (!utm) return items;
  return items.map((item) => ({ ...item, url: applyUtmToUrl(item.url, utm) }));
}

async function serveStatic(
  req: import("node:http").IncomingMessage,
  res: import("node:http").ServerResponse,
) {
  const requestUrl = new URL(
    req.url ?? "/",
    `http://${req.headers.host ?? "localhost"}`,
  );
  let pathname = requestUrl.pathname;
  if (pathname === "/") pathname = "/index.html";
  if (pathname === "/about") pathname = "/about.html";

  const filePath = path.normalize(path.join(webRoot, pathname));
  if (!filePath.startsWith(webRoot)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const data = await readFile(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, {
      "content-type": mimeTypes[ext] ?? "application/octet-stream",
      "cache-control": ext === ".html" ? "no-store" : "public, max-age=3600",
    });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}

function readBooleanEnv(name: string, defaultValue: boolean): boolean {
  const raw = process.env[name];
  if (!raw) return defaultValue;

  const normalized = raw.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return defaultValue;
}

function resolveAllowPrivateHosts(configured?: boolean): boolean {
  if (typeof configured === "boolean") return configured;
  return readBooleanEnv(
    "FEED_JARVIS_ALLOW_PRIVATE_HOSTS",
    DEFAULT_ALLOW_PRIVATE_HOSTS,
  );
}

function resolvePersonasPath(configured?: string): string | undefined {
  const direct = configured?.trim();
  if (direct) return direct;
  const fromEnv = process.env.FEED_JARVIS_PERSONAS?.trim();
  if (fromEnv) return fromEnv;
  if (existsSync(bundledPersonasPath)) return bundledPersonasPath;
  return undefined;
}

async function loadRuntimePersonas(personasPath?: string): Promise<Persona[]> {
  if (!personasPath) return DEFAULT_PERSONAS;
  try {
    const loaded = await loadPersonasPath(personasPath);
    return mergeIfEmpty(DEFAULT_PERSONAS, loaded);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      `Failed to load personas from '${personasPath}': ${message}. Falling back to defaults.`,
    );
    return DEFAULT_PERSONAS;
  }
}

function mergeIfEmpty(base: Persona[], loaded: Persona[]): Persona[] {
  if (loaded.length > 0) return loaded;
  return base;
}

export function createStudioServer(options: StudioServerOptions = {}): Server {
  const runtimeOptions: RuntimeOptions = {
    allowPrivateHosts: resolveAllowPrivateHosts(options.allowPrivateHosts),
    fetchFn: options.fetchFn,
    openaiApiKey: options.openaiApiKey ?? process.env.OPENAI_API_KEY,
    openaiBaseUrl:
      options.openaiBaseUrl ??
      process.env.OPENAI_BASE_URL ??
      "https://api.openai.com/v1",
    openaiFetchFn: options.openaiFetchFn,
    llmModel:
      options.llmModel ??
      process.env.FEED_JARVIS_LLM_MODEL ??
      DEFAULT_LLM_MODEL,
  };
  const personasPromise = loadRuntimePersonas(
    resolvePersonasPath(options.personasPath),
  );

  return createServer(async (req, res) => {
    const requestUrl = new URL(
      req.url ?? "/",
      `http://${req.headers.host ?? "localhost"}`,
    );
    const method = req.method ?? "GET";

    if (requestUrl.pathname === "/api/personas" && method === "GET") {
      const personas = await personasPromise;
      sendJson(res, 200, { personas });
      return;
    }

    if (requestUrl.pathname === "/api/fetch" && method === "POST") {
      try {
        const body = await readJsonBody(req);
        const payload = await handleFetchFeed(body, runtimeOptions);
        sendJson(res, 200, payload);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Request failed.";
        sendJson(res, 400, { error: message });
      }
      return;
    }

    if (requestUrl.pathname === "/api/generate" && method === "POST") {
      try {
        const body = await readJsonBody(req);
        const personas = await personasPromise;
        const payload = await handleGenerate(body, personas, runtimeOptions);
        sendJson(res, 200, payload);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Request failed.";
        sendJson(res, 400, { error: message });
      }
      return;
    }

    if (requestUrl.pathname === "/api/agent-feed" && method === "POST") {
      try {
        const body = await readJsonBody(req);
        const personas = await personasPromise;
        const payload = await handleAgentFeed(body, personas, runtimeOptions);
        sendJson(res, 200, payload);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Request failed.";
        sendJson(res, 400, { error: message });
      }
      return;
    }

    if (requestUrl.pathname.startsWith("/api/")) {
      sendJson(res, 404, { error: "Not found" });
      return;
    }

    await serveStatic(req, res);
  });
}

export function startStudioServer(options: StudioServerOptions = {}): Server {
  const port = options.port ?? PORT;
  const server = createStudioServer(options);
  server.listen(port, () => {
    console.log(`Feed Jarvis Studio running on http://localhost:${port}`);
  });
  return server;
}

function isMainModule(moduleUrl: string): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  return path.resolve(entry) === fileURLToPath(moduleUrl);
}

if (isMainModule(import.meta.url)) {
  startStudioServer();
}
