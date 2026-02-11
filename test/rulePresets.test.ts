import { describe, expect, test } from "vitest";
import {
  parseRulePresets,
  removeRulePreset,
  serializeRulePresets,
  upsertRulePreset,
} from "../web/rulePresets.js";

describe("rulePresets", () => {
  test("parses invalid payloads safely", () => {
    expect(parseRulePresets(null)).toEqual([]);
    expect(parseRulePresets("not-json")).toEqual([]);
    expect(parseRulePresets(JSON.stringify({ nope: true }))).toEqual([]);
  });

  test("normalizes, dedupes, and sorts presets", () => {
    const raw = JSON.stringify([
      {
        name: "  Launch default  ",
        rules: {
          prepend: " New:",
          hashtags: " #Product ",
          utm: { source: "feed-jarvis", medium: "social" },
        },
      },
      {
        name: "alpha",
        rules: { append: "Worth a look." },
      },
      {
        name: "LAUNCH DEFAULT",
        rules: { prepend: "replace" },
      },
      {
        name: "Ignored",
        rules: {},
      },
      {
        name: "",
        rules: { prepend: "Nope" },
      },
    ]);

    const parsed = parseRulePresets(raw);
    expect(parsed.map((preset) => preset.name)).toEqual([
      "alpha",
      "Launch default",
    ]);
    expect(
      parsed.find((preset) => preset.name === "Launch default")?.rules,
    ).toMatchObject({
      prepend: "New:",
      hashtags: "#Product",
      utm: { source: "feed-jarvis", medium: "social" },
    });
  });

  test("upserts and removes by name (case-insensitive)", () => {
    let presets = parseRulePresets(
      JSON.stringify([
        {
          name: "Default",
          rules: { prepend: "New:" },
        },
      ]),
    );

    presets = upsertRulePreset(presets, {
      name: "default",
      rules: { append: "Worth it." },
    });
    expect(presets).toHaveLength(1);
    expect(presets[0]?.name).toBe("default");
    expect(presets[0]?.rules).toMatchObject({ append: "Worth it." });

    presets = removeRulePreset(presets, "DEFAULT");
    expect(presets).toEqual([]);
  });

  test("serialize and parse round-trip", () => {
    const presets = upsertRulePreset([], {
      name: "My rule",
      rules: {
        prepend: "New:",
        append: "Worth a look.",
        hashtags: "#ai",
        utm: { source: "feed-jarvis", campaign: "launch" },
      },
    });

    const raw = serializeRulePresets(presets);
    expect(parseRulePresets(raw)).toHaveLength(1);
    expect(parseRulePresets(raw)[0]?.name).toBe("My rule");
  });
});
