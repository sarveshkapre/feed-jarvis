#!/usr/bin/env node

import { execSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const CHANGELOG_PATH = path.join(repoRoot, "CHANGELOG.md");
const DIST_CLI_PATH = path.join(repoRoot, "dist", "cli.js");
const NPM_PACK_CACHE_DIR = path.join(
  process.env.TMPDIR || "/tmp",
  "feed-jarvis-npm-cache",
);

function parseArgs(argv) {
  const options = {
    allowDirty: false,
    qualityCmd: "npm run check",
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--allow-dirty") {
      options.allowDirty = true;
      continue;
    }
    if (arg === "--quality-cmd") {
      options.qualityCmd = argv[i + 1] ?? "";
      i += 1;
    }
  }

  return options;
}

function runCommand(command, { capture = false, extraEnv = {} } = {}) {
  return execSync(command, {
    cwd: repoRoot,
    env: { ...process.env, ...extraEnv },
    stdio: capture ? "pipe" : "inherit",
    encoding: "utf8",
    shell: true,
  });
}

function checkCleanWorkingTree({ allowDirty }) {
  const output = runCommand("git status --porcelain", { capture: true }).trim();
  if (!output || allowDirty) return;
  throw new Error(
    "Working tree is not clean. Commit/stash changes before running release checks (or use --allow-dirty).",
  );
}

function readUnreleasedSection() {
  if (!existsSync(CHANGELOG_PATH)) {
    throw new Error("Missing CHANGELOG.md.");
  }

  const content = readFileSync(CHANGELOG_PATH, "utf8");
  const unreleasedHeader = /^##\s+Unreleased\s*$/m;
  if (!unreleasedHeader.test(content)) {
    throw new Error('CHANGELOG.md is missing a "## Unreleased" section.');
  }

  const sections = content.split(/^##\s+/m);
  const unreleasedSection = sections.find((section) =>
    section.startsWith("Unreleased"),
  );
  if (!unreleasedSection) {
    throw new Error('Unable to parse "## Unreleased" section in CHANGELOG.md.');
  }

  const hasEntries = unreleasedSection
    .split("\n")
    .some((line) => line.trim().startsWith("- "));
  if (!hasEntries) {
    throw new Error(
      'CHANGELOG "## Unreleased" section must include at least one bullet entry.',
    );
  }
}

function verifyArtifact() {
  if (!existsSync(DIST_CLI_PATH)) {
    throw new Error("Missing dist/cli.js. Run build before release.");
  }

  const stat = statSync(DIST_CLI_PATH);
  if (!stat.isFile() || stat.size === 0) {
    throw new Error("dist/cli.js exists but is empty.");
  }

  const packOutput = runCommand("npm pack --dry-run --json", {
    capture: true,
    extraEnv: {
      npm_config_cache: NPM_PACK_CACHE_DIR,
    },
  });

  let packReport = null;
  try {
    packReport = JSON.parse(packOutput);
  } catch {
    throw new Error("Unable to parse npm pack --dry-run --json output.");
  }

  const files = Array.isArray(packReport)
    ? Array.isArray(packReport[0]?.files)
      ? packReport[0].files
      : []
    : [];

  const hasDistCli = files.some(
    (entry) =>
      entry &&
      typeof entry === "object" &&
      Reflect.get(entry, "path") === "dist/cli.js",
  );

  if (!hasDistCli) {
    throw new Error(
      "npm pack --dry-run did not include dist/cli.js. Check package files/.npmignore settings.",
    );
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  console.log("release-check: validating git state...");
  checkCleanWorkingTree(options);
  console.log("release-check: validating changelog...");
  readUnreleasedSection();
  console.log(`release-check: running quality gate (${options.qualityCmd})...`);
  runCommand(options.qualityCmd);
  console.log("release-check: validating release artifact...");
  verifyArtifact();
  console.log("release-check: pass");
}

try {
  main();
} catch (error) {
  const message =
    error instanceof Error ? error.message : "Unknown release-check failure.";
  console.error(`release-check: fail: ${message}`);
  process.exitCode = 1;
}
