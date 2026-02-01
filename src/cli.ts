#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fetchFeed } from "./lib/feedFetch.js";
import {
  DEFAULT_PERSONAS,
  getPersona,
  loadPersonasFile,
  mergePersonas,
} from "./lib/personas.js";
import { type FeedItem, generatePosts } from "./lib/posts.js";

type PackageJson = { name?: string; version?: string };
const require = createRequire(import.meta.url);
const pkg = require("../package.json") as PackageJson;

function printHelp(): void {
  console.log(`Feed Jarvis (${pkg.name ?? "feed-jarvis"} ${pkg.version ?? "0.0.0"})

Usage:
  feed-jarvis <command> [options]

Commands:
  fetch      Fetch RSS/Atom and output events JSON
  generate   Generate posts from an input feed
  personas   List built-in personas

Fetch options:
  --url <url>               RSS/Atom feed URL (repeatable; required)
  --allow-host <host>       Allowed host (repeatable; required)
  --out <path|->            Output events JSON path (default: stdout)
  --max-items <number>      Max events to emit (default: 20)
  --timeout-ms <number>     Fetch timeout (default: 10000)
  --max-bytes <number>      Max feed bytes (default: 1000000)
  --cache-ttl <seconds>     Cache TTL seconds (default: 3600)
  --cache-dir <path>        Cache directory (default: OS cache dir)
  --no-cache                Disable caching
  --no-dedupe               Do not dedupe by event url

Generate options:
  --input <path|->        Path to events JSON, or '-' for stdin (required)
  --persona <name>        Persona name (required)
  --personas <path>       Optional personas JSON file (array of {name, prefix})
  --max-chars <number>    Max characters per post (default: 280)
  --format <text|json>    Output format (default: text)

Examples:
  feed-jarvis personas
  feed-jarvis personas --personas personas.json
  feed-jarvis fetch --url https://example.com/rss.xml --allow-host example.com > events.json
  feed-jarvis fetch --url https://a.com/rss.xml --url https://b.com/atom.xml --allow-host a.com --allow-host b.com > events.json
  feed-jarvis generate --input events.json --persona Analyst --personas personas.json
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
    const filePersonas = personasPath
      ? await loadPersonasOrDie(personasPath)
      : [];
    const personas = mergePersonas(DEFAULT_PERSONAS, filePersonas);

    console.log(
      personasPath
        ? `Personas (built-in + ${personasPath}):`
        : "Built-in personas:",
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

    const urls = getStringArrayFlag(args.flags, "--url");
    if (urls.length === 0) dieUsage("Missing required flag: --url");
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
  const format = getStringFlag(args.flags, "--format", "text");
  const personasPath = getOptionalStringFlag(args.flags, "--personas");
  if (format !== "text" && format !== "json") {
    dieUsage(`Invalid --format: ${format} (expected 'text' or 'json')`);
  }

  const raw =
    inputPath === "-" ? await readStdin() : await readFile(inputPath, "utf8");
  const items = parseFeedItems(raw);

  const filePersonas = personasPath
    ? await loadPersonasOrDie(personasPath)
    : [];
  const personas = mergePersonas(DEFAULT_PERSONAS, filePersonas);
  const persona = getPersona(personaName, personas);
  const posts = generatePosts(items, persona, maxChars);

  if (format === "json") {
    process.stdout.write(`${JSON.stringify(posts, null, 2)}\n`);
    return;
  }

  for (const post of posts) console.log(post);
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
    if (!next || next.startsWith("-")) {
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
    return await loadPersonasFile(path);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    die(`Invalid personas file '${path}': ${message}`);
  }
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
