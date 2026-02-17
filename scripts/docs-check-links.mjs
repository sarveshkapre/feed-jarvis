#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const ignoreDirs = new Set([
  ".git",
  ".clone_memory_archive",
  "dist",
  "node_modules",
]);

function listMarkdownFiles(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (ignoreDirs.has(entry.name)) continue;
      listMarkdownFiles(path.join(dir, entry.name), files);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(path.join(dir, entry.name));
    }
  }
  return files;
}

function toAnchorId(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[`*_()[\]{}<>!.,:?'"\\/]/g, "")
    .replace(/\s+/g, "-");
}

function collectAnchors(markdownPath) {
  const content = readFileSync(markdownPath, "utf8");
  const anchors = new Set();
  for (const line of content.split(/\r?\n/)) {
    if (!line.startsWith("#")) continue;
    const heading = line.replace(/^#+\s*/, "").trim();
    if (!heading) continue;
    anchors.add(toAnchorId(heading));
  }
  return anchors;
}

function* extractMarkdownLinks(content) {
  const regex = /(?<!!)\[[^\]]+\]\(([^)\s]+)\)/g;
  let match = regex.exec(content);
  while (match) {
    const target = match[1] ?? "";
    yield target.trim();
    match = regex.exec(content);
  }
}

function isExternalTarget(target) {
  return (
    target.startsWith("http://") ||
    target.startsWith("https://") ||
    target.startsWith("mailto:") ||
    target.startsWith("tel:")
  );
}

function resolveTargetPath(sourcePath, rawTarget) {
  const target = rawTarget.replace(/^<|>$/g, "");
  if (!target || target.startsWith("#")) {
    return { resolvedPath: sourcePath, anchor: target.slice(1) };
  }

  const [pathPart, anchor = ""] = target.split("#");
  const absolutePath = path.resolve(path.dirname(sourcePath), pathPart);
  return { resolvedPath: absolutePath, anchor };
}

function main() {
  const markdownFiles = listMarkdownFiles(repoRoot);
  const anchorCache = new Map();
  const failures = [];
  let linksChecked = 0;

  for (const filePath of markdownFiles) {
    const content = readFileSync(filePath, "utf8");
    for (const target of extractMarkdownLinks(content)) {
      if (!target || isExternalTarget(target)) continue;

      linksChecked += 1;
      const { resolvedPath, anchor } = resolveTargetPath(filePath, target);
      if (!existsSync(resolvedPath) || !statSync(resolvedPath).isFile()) {
        failures.push(
          `${path.relative(repoRoot, filePath)} -> missing target: ${target}`,
        );
        continue;
      }

      if (!anchor) continue;
      let anchors = anchorCache.get(resolvedPath);
      if (!anchors) {
        if (!resolvedPath.endsWith(".md")) continue;
        anchors = collectAnchors(resolvedPath);
        anchorCache.set(resolvedPath, anchors);
      }

      const normalized = toAnchorId(anchor);
      if (!anchors.has(normalized)) {
        failures.push(
          `${path.relative(repoRoot, filePath)} -> missing anchor "${anchor}" in ${path.relative(repoRoot, resolvedPath)}`,
        );
      }
    }
  }

  if (failures.length > 0) {
    console.error("docs-check-links: fail");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(
    `docs-check-links: pass (${markdownFiles.length} files scanned, ${linksChecked} local links checked)`,
  );
}

main();
