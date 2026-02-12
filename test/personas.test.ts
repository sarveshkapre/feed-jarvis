import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_PERSONAS,
  getPersona,
  loadPersonasPath,
  mergePersonas,
  parsePersonaMarkdown,
  parsePersonasJson,
} from "../src/lib/personas.js";

describe("personas", () => {
  it("parses personas json and merges overrides deterministically", () => {
    const fromFile = parsePersonasJson(
      JSON.stringify([
        { name: "Analyst", prefix: "Deep dive:" },
        { name: "Founder", prefix: "Founder note:" },
      ]),
    );

    const merged = mergePersonas(DEFAULT_PERSONAS, fromFile);
    expect(merged.map((p) => p.name)).toEqual([
      "Analyst",
      "Builder",
      "Founder",
    ]);

    const analyst = getPersona("analyst", merged);
    expect(analyst.prefix).toBe("Deep dive:");

    const founder = getPersona("Founder", merged);
    expect(founder.prefix).toBe("Founder note:");
  });

  it("rejects invalid personas json", () => {
    expect(() => parsePersonasJson('{"name":"x"}')).toThrow();
    expect(() => parsePersonasJson('[{"name":"","prefix":"x"}]')).toThrow();
  });

  it("parses markdown persona contracts", () => {
    const persona = parsePersonaMarkdown(
      `---
name: Macro Hawk
prefix: Macro Hawk:
role: Economy analyst
style: skeptical, concise
topics: economy, rates, inflation
---

# ignored heading
`,
    );

    expect(persona).toMatchObject({
      name: "Macro Hawk",
      prefix: "Macro Hawk:",
      role: "Economy analyst",
      style: "skeptical, concise",
      topics: ["economy", "rates", "inflation"],
    });
  });

  it("loads personas from a markdown directory", async () => {
    const tmp = mkdtempSync(path.join(os.tmpdir(), "feed-jarvis-personas-"));
    try {
      writeFileSync(
        path.join(tmp, "finance.md"),
        `name: Finance Wire\nprefix: Finance Wire:\n`,
        "utf8",
      );
      writeFileSync(
        path.join(tmp, "tech.md"),
        `# Tech Radar\nprefix: Tech Radar:\n`,
        "utf8",
      );

      const personas = await loadPersonasPath(tmp);
      expect(personas.map((persona) => persona.name)).toEqual([
        "Finance Wire",
        "Tech Radar",
      ]);
      expect(personas[0]?.prefix).toBe("Finance Wire:");
      expect(personas[1]?.prefix).toBe("Tech Radar:");
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});
