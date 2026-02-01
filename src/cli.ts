#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import {
  DEFAULT_PERSONAS,
  type FeedItem,
  generatePosts,
  getPersona,
} from "./lib/posts.js";

type PackageJson = { name?: string; version?: string };
const require = createRequire(import.meta.url);
const pkg = require("../package.json") as PackageJson;

function printHelp(): void {
  console.log(`Feed Jarvis (${pkg.name ?? "feed-jarvis"} ${pkg.version ?? "0.0.0"})

Usage:
  feed-jarvis <command> [options]

Commands:
  generate   Generate posts from an input feed
  personas   List built-in personas

Generate options:
  --input <path|->        Path to events JSON, or '-' for stdin (required)
  --persona <name>        Persona name (required)
  --max-chars <number>    Max characters per post (default: 280)
  --format <text|json>    Output format (default: text)

Examples:
  feed-jarvis personas
  feed-jarvis generate --input events.json --persona Analyst
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
    console.log("Built-in personas:");
    for (const persona of DEFAULT_PERSONAS) {
      console.log(`- ${persona.name} (prefix: ${persona.prefix})`);
    }
    console.log("");
    console.log(
      "Any other persona name is allowed; the default prefix is '<name>:'.",
    );
    process.exit(0);
  }

  if (cmd !== "generate") {
    dieUsage(`Unknown command: ${cmd}`);
  }

  const args = parseArgs(rest);
  if (args.flags.has("--help") || args.flags.has("-h")) {
    printHelp();
    process.exit(0);
  }
  if (args.positionals.length > 0) {
    dieUsage(`Unexpected argument(s): ${args.positionals.join(" ")}`);
  }

  const inputPath = getRequiredFlag(args.flags, "--input");
  const personaName = getRequiredFlag(args.flags, "--persona");
  const maxChars = getNumberFlag(args.flags, "--max-chars", 280);
  const format = getStringFlag(args.flags, "--format", "text");
  if (format !== "text" && format !== "json") {
    dieUsage(`Invalid --format: ${format} (expected 'text' or 'json')`);
  }

  const raw =
    inputPath === "-" ? await readStdin() : await readFile(inputPath, "utf8");
  const items = parseFeedItems(raw);

  const persona = getPersona(personaName);
  const posts = generatePosts(items, persona, maxChars);

  if (format === "json") {
    process.stdout.write(`${JSON.stringify(posts, null, 2)}\n`);
    return;
  }

  for (const post of posts) console.log(post);
}

await main();

type ParsedArgs = {
  flags: Map<string, string | true>;
  positionals: string[];
};

function parseArgs(argv: string[]): ParsedArgs {
  const flags = new Map<string, string | true>();
  const positionals: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--") {
      positionals.push(...argv.slice(i + 1));
      break;
    }
    if (!arg) continue;

    if (arg === "-h") {
      flags.set("--help", true);
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
      flags.set(name, value);
      continue;
    }

    const next = argv[i + 1];
    if (!next || next.startsWith("-")) {
      flags.set(arg, true);
      continue;
    }

    flags.set(arg, next);
    i++;
  }

  return { flags, positionals };
}

function getRequiredFlag(
  flags: Map<string, string | true>,
  name: string,
): string {
  const value = flags.get(name);
  if (!value || value === true) dieUsage(`Missing required flag: ${name}`);
  return value;
}

function getStringFlag(
  flags: Map<string, string | true>,
  name: string,
  defaultValue: string,
): string {
  const value = flags.get(name);
  if (!value || value === true) return defaultValue;
  return value;
}

function getNumberFlag(
  flags: Map<string, string | true>,
  name: string,
  defaultValue: number,
): number {
  const raw = flags.get(name);
  if (!raw || raw === true) return defaultValue;

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    dieUsage(`Invalid ${name}: ${raw} (expected a positive number)`);
  }
  return Math.floor(parsed);
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
