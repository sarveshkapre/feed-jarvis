#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import process from "node:process";

const checks = [
  {
    name: "secret-patterns",
    pattern: "sk-[A-Za-z0-9]{20,}|BEGIN (RSA|OPENSSH|EC|DSA) PRIVATE KEY",
    targets: [
      "AGENTS.md",
      "CHANGELOG.md",
      "README.md",
      "docs",
      "scripts",
      "src",
      "test",
      "web",
    ],
  },
  {
    name: "dynamic-code-exec",
    pattern: "eval\\(|new Function\\(",
    targets: ["src", "web", "scripts"],
  },
  {
    name: "runtime-shell-exec",
    pattern: "child_process|exec\\(",
    targets: ["src"],
  },
];

function runRg(pattern, targets) {
  const args = [
    "-n",
    "--hidden",
    "--glob",
    "!dist/**",
    "--glob",
    "!node_modules/**",
    pattern,
    ...targets,
  ];
  const result = spawnSync("rg", args, {
    cwd: process.cwd(),
    encoding: "utf8",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status === 0) {
    return { matched: true, output: result.stdout.trim() };
  }

  if (result.status === 1) {
    return { matched: false, output: "" };
  }

  throw new Error(result.stderr || `rg failed with status ${result.status}`);
}

function main() {
  const failures = [];

  for (const check of checks) {
    const result = runRg(check.pattern, check.targets);
    if (result.matched) {
      failures.push({
        name: check.name,
        output: result.output,
      });
    }
  }

  if (failures.length > 0) {
    console.error("security-grep: fail");
    for (const failure of failures) {
      console.error(`- ${failure.name}`);
      console.error(failure.output);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`security-grep: pass (${checks.length} checks)`);
}

main();
