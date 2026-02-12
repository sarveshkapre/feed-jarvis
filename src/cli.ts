#!/usr/bin/env node

import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchFeed } from "./lib/feedFetch.js";
import { generatePostsWithLlm } from "./lib/llm.js";
import { parseOpmlUrls } from "./lib/opml.js";
import {
  DEFAULT_PERSONAS,
  getPersona,
  loadPersonasPath,
  mergePersonas,
  type Persona,
} from "./lib/personas.js";
import {
  applyUtmToUrl,
  type FeedItem,
  generatePosts,
  type PostChannel,
  type PostRules,
  type PostTemplate,
} from "./lib/posts.js";

type PackageJson = { name?: string; version?: string };
const require = createRequire(import.meta.url);
const pkg = require("../package.json") as PackageJson;
const DEFAULT_LLM_MODEL = "gpt-4.1-mini";
const bundledPersonasPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../personas",
);

process.stdout.on("error", (err: unknown) => {
  // Common when users pipe output into tools like `head`.
  if (err && typeof err === "object" && Reflect.get(err, "code") === "EPIPE") {
    process.exit(0);
  }
  throw err;
});

function printHelp(): void {
  console.log(`Feed Jarvis (${pkg.name ?? "feed-jarvis"} ${pkg.version ?? "0.0.0"})

Usage:
  feed-jarvis <command> [options]

Commands:
  fetch      Fetch RSS/Atom and output events JSON
  generate   Generate posts from an input feed
  personas   List available personas

Fetch options:
  --url <url>               RSS/Atom feed URL (repeatable; required unless --opml provided)
  --urls-file <path>        Local newline-delimited URL file (repeatable)
  --opml <path>             Local OPML file with feed URLs (repeatable)
  --allow-host <host>       Allowed host (repeatable; required)
  --out <path|->            Output events JSON path (default: stdout)
  --max-items <number>      Max events to emit (default: 20)
  --timeout-ms <number>     Fetch timeout (default: 10000)
  --max-bytes <number>      Max feed bytes (default: 1000000)
  --cache-ttl <seconds>     Cache TTL seconds (default: 3600)
  --cache-dir <path>        Cache directory (default: OS cache dir)
  --no-cache                Disable caching
  --no-dedupe               Do not dedupe by event url
  --stats                   Print fetch stats to stderr
  --stale-if-error          Use stale cache on fetch errors

Generate options:
  --input <path|->        Path to events JSON, or '-' for stdin (required)
  --persona <name>        Persona name (required)
  --personas <path>       Optional personas source: JSON, markdown file, or markdown directory
  --max-chars <number>    Max characters per post (default: 280)
  --channel <x|linkedin|newsletter> Target channel style (default: x)
  --template <straight|takeaway|cta> Draft framing template (default: straight)
  --llm                   Generate posts with OpenAI Responses API (requires OPENAI_API_KEY)
  --llm-model <id>        OpenAI model for --llm (default: FEED_JARVIS_LLM_MODEL or gpt-4.1-mini)
  --prepend <text>        Optional text to prepend
  --append <text>         Optional text to append
  --hashtags <text>       Optional hashtags (space/comma separated)
  --utm-source <value>    Optional UTM parameter for links
  --utm-medium <value>    Optional UTM parameter for links
  --utm-campaign <value>  Optional UTM parameter for links
  --utm-content <value>   Optional UTM parameter for links
  --utm-term <value>      Optional UTM parameter for links
  --stats                Print generation stats to stderr
  --format <text|json|jsonl|csv> Output format (default: text)
  --out <path|->          Output path for posts (default: stdout)

Examples:
  feed-jarvis personas
  feed-jarvis personas --personas personas.json
  feed-jarvis fetch --url https://example.com/rss.xml --allow-host example.com > events.json
  feed-jarvis fetch --url https://a.com/rss.xml --url https://b.com/atom.xml --allow-host a.com --allow-host b.com > events.json
  feed-jarvis fetch --urls-file feeds.txt --allow-host example.com > events.json
  feed-jarvis fetch --opml feeds.opml --allow-host example.com --allow-host news.example.com > events.json
  feed-jarvis generate --input events.json --persona Analyst --personas personas.json --out posts.txt
  cat events.json | feed-jarvis generate --input - --persona Builder --format json

Input format:
  JSON array of { "title": string, "url": string }
`);
}

function dieUsage(message: string): never {
  console.error(message);
  console.error("");
  printHelp();
  process.exit(2);
}

function die(message: string, exitCode = 1): never {
  console.error(message);
  process.exit(exitCode);
}

async function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
}

async function main() {
  const [cmdRaw, ...rest] = process.argv.slice(2);
  const cmd = cmdRaw?.trim();

  if (!cmd) {
    printHelp();
    process.exit(2);
  }

  if (cmd === "--help" || cmd === "-h" || cmd === "help") {
    printHelp();
    process.exit(0);
  }

  if (cmd === "--version" || cmd === "-v" || cmd === "version") {
    console.log(pkg.version ?? "0.0.0");
    process.exit(0);
  }

  if (cmd === "personas") {
    const args = parseArgs(rest);
    if (args.flags.has("--help")) {
      printHelp();
      process.exit(0);
    }
    if (args.positionals.length > 0) {
      dieUsage(`Unexpected argument(s): ${args.positionals.join(" ")}`);
    }

    const personasPath = getOptionalStringFlag(args.flags, "--personas");
    const basePersonas = await loadBasePersonas();
    const filePersonas = personasPath
      ? await loadPersonasOrDie(personasPath)
      : [];
    const personas = mergePersonas(basePersonas, filePersonas);

    console.log(
      personasPath
        ? `Personas (bundled + ${personasPath}):`
        : `Personas (${describeBasePersonasSource(basePersonas)}):`,
    );
    for (const persona of personas) {
      console.log(`- ${persona.name} (prefix: ${persona.prefix})`);
    }
    console.log("");
    console.log(
      "Any other persona name is allowed; the default prefix is '<name>:'.",
    );
    process.exit(0);
  }

  if (cmd === "fetch") {
    const args = parseArgs(rest);
    if (args.flags.has("--help")) {
      printHelp();
      process.exit(0);
    }
    if (args.positionals.length > 0) {
      dieUsage(`Unexpected argument(s): ${args.positionals.join(" ")}`);
    }

    const directUrls = getStringArrayFlag(args.flags, "--url");
    const urlFilePaths = getStringArrayFlag(args.flags, "--urls-file");
    const fileUrls =
      urlFilePaths.length > 0 ? await loadUrlsFilesOrDie(urlFilePaths) : [];
    const opmlPaths = getStringArrayFlag(args.flags, "--opml");
    const opmlUrls =
      opmlPaths.length > 0 ? await loadOpmlUrlsOrDie(opmlPaths) : [];
    const urls = dedupeStrings([...directUrls, ...fileUrls, ...opmlUrls]);
    if (urls.length === 0) {
      dieUsage(
        "Provide one or more --url values, --urls-file paths, or at least one --opml file.",
      );
    }
    const allowHosts = getStringArrayFlag(args.flags, "--allow-host");
    const outPath = getOptionalStringFlag(args.flags, "--out");
    const maxItems = getNumberFlag(args.flags, "--max-items", 20, { min: 1 });
    const timeoutMs = getNumberFlag(args.flags, "--timeout-ms", 10_000, {
      min: 1,
    });
    const maxBytes = getNumberFlag(args.flags, "--max-bytes", 1_000_000, {
      min: 1,
    });
    const cacheTtlSeconds = getNumberFlag(args.flags, "--cache-ttl", 3600, {
      min: 0,
    });
    const cacheDir = getOptionalStringFlag(args.flags, "--cache-dir");
    const cache = !args.flags.has("--no-cache");
    const dedupe = !args.flags.has("--no-dedupe");
    const stats = args.flags.has("--stats");
    const staleIfError = args.flags.has("--stale-if-error");

    let results: Awaited<ReturnType<typeof fetchFeed>>[] = [];
    try {
      results = await Promise.all(
        urls.map((url) =>
          fetchFeed(url, {
            allowHosts,
            cache,
            cacheDir,
            cacheTtlMs: cacheTtlSeconds * 1000,
            maxBytes,
            maxItems,
            timeoutMs,
            staleIfError,
          }),
        ),
      );
    } catch (err) {
      die(err instanceof Error ? err.message : String(err));
    }

    const items = results.flatMap((r) => r.items);
    const finalItems = dedupe
      ? dedupeByUrl(items).slice(0, maxItems)
      : items.slice(0, maxItems);
    const output = `${JSON.stringify(finalItems, null, 2)}\n`;
    if (stats) {
      const cacheCount = results.filter((r) => r.source === "cache").length;
      const networkCount = results.filter((r) => r.source === "network").length;
      const dedupedCount = dedupe ? items.length - finalItems.length : 0;
      console.error(
        [
          "Feed Jarvis fetch stats:",
          opmlPaths.length > 0
            ? `- opml files: ${opmlPaths.length} (${opmlUrls.length} url(s))`
            : undefined,
          urlFilePaths.length > 0
            ? `- url files: ${urlFilePaths.length} (${fileUrls.length} url(s))`
            : undefined,
          `- feeds: ${results.length} (${cacheCount} cache, ${networkCount} network)`,
          `- items: ${items.length}`,
          `- emitted: ${finalItems.length}`,
          dedupe ? `- deduped: ${dedupedCount}` : undefined,
        ]
          .filter(Boolean)
          .join("\n"),
      );
    }
    if (!outPath || outPath === "-") {
      process.stdout.write(output);
      return;
    }
    await writeFile(outPath, output, "utf8");
    return;
  }

  if (cmd !== "generate") {
    dieUsage(`Unknown command: ${cmd}`);
  }

  const args = parseArgs(rest);
  if (args.flags.has("--help")) {
    printHelp();
    process.exit(0);
  }
  if (args.positionals.length > 0) {
    dieUsage(`Unexpected argument(s): ${args.positionals.join(" ")}`);
  }

  const inputPath = getRequiredFlag(args.flags, "--input");
  const personaName = getRequiredFlag(args.flags, "--persona");
  const maxChars = getNumberFlag(args.flags, "--max-chars", 280, { min: 1 });
  const channel = resolveChannel(getStringFlag(args.flags, "--channel", "x"));
  const template = resolveTemplate(
    getStringFlag(args.flags, "--template", "straight"),
  );
  const rules = resolveRules(args.flags);
  const format = getStringFlag(args.flags, "--format", "text");
  const personasPath = getOptionalStringFlag(args.flags, "--personas");
  const outPath = getOptionalStringFlag(args.flags, "--out");
  const stats = args.flags.has("--stats");
  const llmRequested =
    args.flags.has("--llm") ||
    Boolean(getOptionalStringFlag(args.flags, "--llm-model"));
  const llmModel = getStringFlag(
    args.flags,
    "--llm-model",
    process.env.FEED_JARVIS_LLM_MODEL || DEFAULT_LLM_MODEL,
  );
  if (
    format !== "text" &&
    format !== "json" &&
    format !== "jsonl" &&
    format !== "csv"
  ) {
    dieUsage(
      `Invalid --format: ${format} (expected 'text', 'json', 'jsonl', or 'csv')`,
    );
  }

  const raw =
    inputPath === "-" ? await readStdin() : await readFile(inputPath, "utf8");
  const items = parseFeedItems(raw);

  const basePersonas = await loadBasePersonas();
  const filePersonas = personasPath
    ? await loadPersonasOrDie(personasPath)
    : [];
  const personas = mergePersonas(basePersonas, filePersonas);
  const persona = getPersona(personaName, personas);
  const resolvedItems = applyRulesToItems(items, rules);
  const posts = llmRequested
    ? await generatePostsWithLlmOrDie({
        items: resolvedItems,
        persona,
        maxChars,
        channel,
        template,
        rules,
        model: llmModel,
      })
    : generatePosts(resolvedItems, persona, maxChars, {
        channel,
        template,
        rules,
      });

  if (stats) {
    console.error(
      formatGenerateStats(posts, maxChars, {
        channel,
        template,
        persona,
        items: resolvedItems,
        mode: llmRequested ? "llm" : "template",
        llmModel: llmRequested ? llmModel : undefined,
      }),
    );
  }

  const output = formatGenerateOutput(posts, format, {
    items: resolvedItems,
    persona,
    channel,
    template,
    rules,
  });
  if (!outPath || outPath === "-") {
    process.stdout.write(output);
    return;
  }
  await writeFile(outPath, output, "utf8");
  return;
}

await main();

type ParsedArgs = {
  flags: Map<string, FlagValue>;
  positionals: string[];
};

type FlagValue = true | string | string[];

function parseArgs(argv: string[]): ParsedArgs {
  const flags = new Map<string, FlagValue>();
  const positionals: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--") {
      positionals.push(...argv.slice(i + 1));
      break;
    }
    if (!arg) continue;

    if (arg === "-h") {
      setFlagValue(flags, "--help", true);
      continue;
    }

    if (!arg.startsWith("--") || arg === "--") {
      positionals.push(arg);
      continue;
    }

    const eqIndex = arg.indexOf("=");
    if (eqIndex !== -1) {
      const name = arg.slice(0, eqIndex);
      const value = arg.slice(eqIndex + 1);
      setFlagValue(flags, name, value);
      continue;
    }

    const next = argv[i + 1];
    if (!next) {
      setFlagValue(flags, arg, true);
      continue;
    }

    // Treat '-' as a value for flags like --input/- or --out -.
    if (next === "-") {
      setFlagValue(flags, arg, next);
      i++;
      continue;
    }

    if (next.startsWith("-")) {
      setFlagValue(flags, arg, true);
      continue;
    }

    setFlagValue(flags, arg, next);
    i++;
  }

  return { flags, positionals };
}

function getRequiredFlag(flags: Map<string, FlagValue>, name: string): string {
  const value = flags.get(name);
  const resolved = resolveStringFlag(value);
  if (!resolved) dieUsage(`Missing required flag: ${name}`);
  return resolved;
}

function getStringFlag(
  flags: Map<string, FlagValue>,
  name: string,
  defaultValue: string,
): string {
  const value = flags.get(name);
  const resolved = resolveStringFlag(value);
  return resolved ?? defaultValue;
}

function getOptionalStringFlag(
  flags: Map<string, FlagValue>,
  name: string,
): string | undefined {
  return resolveStringFlag(flags.get(name));
}

function getNumberFlag(
  flags: Map<string, FlagValue>,
  name: string,
  defaultValue: number,
  constraints: { min: number },
): number {
  const raw = resolveStringFlag(flags.get(name));
  if (!raw) return defaultValue;

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < constraints.min) {
    dieUsage(
      `Invalid ${name}: ${raw} (expected a number >= ${constraints.min})`,
    );
  }
  return Math.floor(parsed);
}

function getStringArrayFlag(
  flags: Map<string, FlagValue>,
  name: string,
): string[] {
  const raw = flags.get(name);
  if (!raw || raw === true) return [];

  const values = Array.isArray(raw) ? raw : [raw];
  return values
    .flatMap((v) => v.split(","))
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

function parseFeedItems(raw: string): FeedItem[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    die(`Invalid JSON input: ${String(err)}`);
  }

  if (!Array.isArray(parsed)) {
    die("Invalid input: expected a JSON array of {title, url} items.");
  }

  const items: FeedItem[] = [];
  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i];
    if (!item || typeof item !== "object") {
      die(`Invalid item at index ${i}: expected an object.`);
    }

    const title = Reflect.get(item, "title");
    const url = Reflect.get(item, "url");
    if (typeof title !== "string" || typeof url !== "string") {
      die(`Invalid item at index ${i}: expected string 'title' and 'url'.`);
    }
    if (title.trim().length === 0 || url.trim().length === 0) {
      die(`Invalid item at index ${i}: 'title' and 'url' must be non-empty.`);
    }
    items.push({ title, url });
  }

  return items;
}

async function loadPersonasOrDie(path: string) {
  try {
    return await loadPersonasPath(path);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    die(`Invalid personas file '${path}': ${message}`);
  }
}

async function loadBasePersonas(): Promise<Persona[]> {
  if (!existsSync(bundledPersonasPath)) {
    return DEFAULT_PERSONAS;
  }
  try {
    const bundled = await loadPersonasPath(bundledPersonasPath);
    return mergePersonas(DEFAULT_PERSONAS, bundled);
  } catch {
    return DEFAULT_PERSONAS;
  }
}

function describeBasePersonasSource(base: Persona[]): string {
  if (
    base.length > DEFAULT_PERSONAS.length &&
    existsSync(bundledPersonasPath)
  ) {
    return `bundled markdown pack (${base.length})`;
  }
  return `built-in (${base.length})`;
}

async function loadOpmlUrlsOrDie(paths: string[]): Promise<string[]> {
  const urls: string[] = [];
  for (const path of paths) {
    let raw = "";
    try {
      raw = await readFile(path, "utf8");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      die(`Unable to read OPML file '${path}': ${message}`);
    }

    const parsedUrls = parseOpmlUrls(raw, 1000);
    if (parsedUrls.length === 0) {
      die(`No valid feed URLs found in OPML file '${path}'.`);
    }
    urls.push(...parsedUrls);
  }
  return dedupeStrings(urls);
}

async function loadUrlsFilesOrDie(paths: string[]): Promise<string[]> {
  const urls: string[] = [];
  for (const path of paths) {
    let raw = "";
    try {
      raw = await readFile(path, "utf8");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      die(`Unable to read URL file '${path}': ${message}`);
    }

    const parsedUrls = raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("#"));
    if (parsedUrls.length === 0) {
      die(`No valid feed URLs found in URL file '${path}'.`);
    }
    urls.push(...parsedUrls);
  }
  return dedupeStrings(urls);
}

type GenerateContext = {
  items: FeedItem[];
  persona: { name: string; prefix: string };
  channel: PostChannel;
  template: PostTemplate;
  rules?: PostRules;
};

type GenerateStatsContext = {
  items: FeedItem[];
  persona: { name: string; prefix: string };
  channel: PostChannel;
  template: PostTemplate;
  mode: "template" | "llm";
  llmModel?: string;
};

function formatGenerateStats(
  posts: string[],
  maxChars: number,
  context: GenerateStatsContext,
): string {
  const lengths = posts.map((post) => post.length).sort((a, b) => a - b);
  const count = lengths.length;
  const sum = lengths.reduce((acc, n) => acc + n, 0);
  const min = count ? lengths[0] : 0;
  const max = count ? lengths[lengths.length - 1] : 0;
  const avg = count ? Math.round(sum / count) : 0;

  const p50 = percentile(lengths, 0.5);
  const p90 = percentile(lengths, 0.9);
  const over = posts.filter((post) => post.length > maxChars).length;

  return [
    "Feed Jarvis generate stats:",
    `- persona: ${context.persona.name}`,
    `- channel: ${context.channel}`,
    `- template: ${context.template}`,
    `- mode: ${context.mode}`,
    context.llmModel ? `- llm model: ${context.llmModel}` : undefined,
    `- items: ${context.items.length}`,
    `- posts: ${posts.length}`,
    `- chars: min ${min}, p50 ${p50}, p90 ${p90}, avg ${avg}, max ${max}`,
    `- over maxChars (${maxChars}): ${over}`,
  ].join("\n");
}

type LlmGenerateCliOptions = {
  items: FeedItem[];
  persona: Persona;
  maxChars: number;
  channel: PostChannel;
  template: PostTemplate;
  rules?: PostRules;
  model: string;
};

async function generatePostsWithLlmOrDie(
  options: LlmGenerateCliOptions,
): Promise<string[]> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    die("Missing OPENAI_API_KEY for --llm generation.");
  }
  try {
    return await generatePostsWithLlm(options.items, options.persona, {
      apiKey,
      model: options.model,
      maxChars: options.maxChars,
      channel: options.channel,
      template: options.template,
      rules: options.rules,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    die(`LLM generation failed: ${message}`);
  }
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const clamped = Math.min(1, Math.max(0, p));
  const index = Math.floor(clamped * (sorted.length - 1));
  return sorted[index] ?? 0;
}

function escapeCsv(value: unknown): string {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function formatGenerateOutput(
  posts: string[],
  format: string,
  context: GenerateContext,
): string {
  if (format === "json") {
    return `${JSON.stringify(posts, null, 2)}\n`;
  }
  if (format === "jsonl") {
    return `${posts.map((post) => JSON.stringify(post)).join("\n")}\n`;
  }
  if (format === "csv") {
    const header = [
      "channel",
      "template",
      "persona_name",
      "persona_prefix",
      "rule_prepend",
      "rule_append",
      "rule_hashtags",
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "title",
      "url",
      "post",
    ].join(",");

    const rules = context.rules ?? {};
    const utm = rules.utm ?? {};
    const rows = context.items.map((item, index) => {
      const post = posts[index] ?? "";
      const url = item.url ?? "";
      return [
        escapeCsv(context.channel),
        escapeCsv(context.template),
        escapeCsv(context.persona.name),
        escapeCsv(context.persona.prefix),
        escapeCsv(rules.prepend ?? ""),
        escapeCsv(rules.append ?? ""),
        escapeCsv(rules.hashtags ?? ""),
        escapeCsv(utm.source ?? ""),
        escapeCsv(utm.medium ?? ""),
        escapeCsv(utm.campaign ?? ""),
        escapeCsv(utm.content ?? ""),
        escapeCsv(utm.term ?? ""),
        escapeCsv(item.title ?? ""),
        escapeCsv(url),
        escapeCsv(post),
      ].join(",");
    });

    return `${[header, ...rows].join("\n")}\n`;
  }
  return `${posts.join("\n")}\n`;
}

function dedupeByUrl(items: FeedItem[]): FeedItem[] {
  const seen = new Set<string>();
  const out: FeedItem[] = [];
  for (const item of items) {
    const key = item.url.trim();
    if (key.length === 0) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function dedupeStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const key = value.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

function setFlagValue(
  flags: Map<string, FlagValue>,
  name: string,
  value: true | string,
) {
  const existing = flags.get(name);

  if (existing === undefined) {
    flags.set(name, value);
    return;
  }

  if (value === true) {
    flags.set(name, true);
    return;
  }

  if (existing === true) {
    flags.set(name, value);
    return;
  }

  if (Array.isArray(existing)) {
    existing.push(value);
    flags.set(name, existing);
    return;
  }

  flags.set(name, [existing, value]);
}

function resolveStringFlag(value: FlagValue | undefined): string | undefined {
  if (!value || value === true) return undefined;
  if (Array.isArray(value)) return value.at(-1);
  return value;
}

function resolveChannel(value: string): PostChannel {
  if (value === "x" || value === "linkedin" || value === "newsletter") {
    return value;
  }
  dieUsage(
    `Invalid --channel: ${value} (expected 'x', 'linkedin', or 'newsletter')`,
  );
}

function resolveTemplate(value: string): PostTemplate {
  if (value === "straight" || value === "takeaway" || value === "cta") {
    return value;
  }
  dieUsage(
    `Invalid --template: ${value} (expected 'straight', 'takeaway', or 'cta')`,
  );
}

function resolveRules(flags: Map<string, FlagValue>): PostRules | undefined {
  const prepend = getOptionalStringFlag(flags, "--prepend")?.trim();
  const append = getOptionalStringFlag(flags, "--append")?.trim();
  const hashtags = getOptionalStringFlag(flags, "--hashtags")?.trim();

  const utmSource = getOptionalStringFlag(flags, "--utm-source")?.trim();
  const utmMedium = getOptionalStringFlag(flags, "--utm-medium")?.trim();
  const utmCampaign = getOptionalStringFlag(flags, "--utm-campaign")?.trim();
  const utmContent = getOptionalStringFlag(flags, "--utm-content")?.trim();
  const utmTerm = getOptionalStringFlag(flags, "--utm-term")?.trim();

  const utm =
    utmSource || utmMedium || utmCampaign || utmContent || utmTerm
      ? {
          source: utmSource || undefined,
          medium: utmMedium || undefined,
          campaign: utmCampaign || undefined,
          content: utmContent || undefined,
          term: utmTerm || undefined,
        }
      : undefined;

  if (!prepend && !append && !hashtags && !utm) return undefined;
  return {
    prepend: prepend || undefined,
    append: append || undefined,
    hashtags: hashtags || undefined,
    utm,
  };
}

function applyRulesToItems(items: FeedItem[], rules?: PostRules): FeedItem[] {
  const utm = rules?.utm;
  if (!utm) return items;
  return items.map((item) => ({ ...item, url: applyUtmToUrl(item.url, utm) }));
}
