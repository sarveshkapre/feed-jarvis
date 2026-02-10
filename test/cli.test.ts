import { spawnSync } from "node:child_process";
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
});
