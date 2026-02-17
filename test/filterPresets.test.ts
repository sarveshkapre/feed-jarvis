import { describe, expect, test } from "vitest";
import {
  mergeFilterPresets,
  parseFilterPresets,
  removeFilterPreset,
  serializeFilterPresets,
  upsertFilterPreset,
} from "../web/filterPresets.js";

describe("filterPresets", () => {
  test("parses invalid payloads safely", () => {
    expect(parseFilterPresets(null)).toEqual([]);
    expect(parseFilterPresets("not-json")).toEqual([]);
    expect(parseFilterPresets(JSON.stringify({ nope: true }))).toEqual([]);
  });

  test("normalizes, dedupes, and sorts presets", () => {
    const raw = JSON.stringify([
      {
        name: "  Triage default  ",
        filters: {
          include: "launch, release",
          exclude: "hiring",
          minTitleLength: 12,
        },
      },
      {
        name: "alpha",
        filters: { exclude: "podcast" },
      },
      {
        name: "TRIAGE DEFAULT",
        filters: { include: "replace" },
      },
      {
        name: "Ignore me",
        filters: { include: "   " },
      },
      {
        name: "",
        filters: { include: "Nope" },
      },
    ]);

    const parsed = parseFilterPresets(raw);
    expect(parsed.map((preset) => preset.name)).toEqual([
      "alpha",
      "Triage default",
    ]);
    expect(
      parsed.find((preset) => preset.name === "Triage default")?.filters,
    ).toMatchObject({ include: "launch, release", exclude: "hiring" });
  });

  test("upserts and removes presets by name case-insensitively", () => {
    let presets = parseFilterPresets(
      JSON.stringify([
        { name: "Default", filters: { include: "launch", minTitleLength: 10 } },
      ]),
    );

    presets = upsertFilterPreset(presets, {
      name: "default",
      filters: { exclude: "hiring" },
    });
    expect(presets).toHaveLength(1);
    expect(presets[0]?.name).toBe("default");
    expect(presets[0]?.filters).toMatchObject({
      include: "",
      exclude: "hiring",
      minTitleLength: 0,
    });

    presets = removeFilterPreset(presets, "DEFAULT");
    expect(presets).toEqual([]);
  });

  test("serialize and parse round-trip", () => {
    const presets = upsertFilterPreset([], {
      name: "My filters",
      filters: { include: "release", exclude: "podcast", minTitleLength: 20 },
    });

    const raw = serializeFilterPresets(presets);
    expect(parseFilterPresets(raw)).toHaveLength(1);
    expect(parseFilterPresets(raw)[0]?.name).toBe("My filters");
  });

  test("merges imported presets into existing state", () => {
    const existing = parseFilterPresets(
      JSON.stringify([
        {
          name: "Daily",
          filters: { include: "macro", exclude: "podcast", minTitleLength: 10 },
        },
      ]),
    );
    const incoming = parseFilterPresets(
      JSON.stringify([
        {
          name: "daily",
          filters: { include: "rates", exclude: "hiring", minTitleLength: 8 },
        },
        {
          name: "Ship",
          filters: { include: "launch", exclude: "", minTitleLength: 0 },
        },
      ]),
    );

    const merged = mergeFilterPresets(existing, incoming);
    expect(merged.map((preset) => preset.name)).toEqual(["daily", "Ship"]);
    expect(merged[0]?.filters).toMatchObject({
      include: "rates",
      exclude: "hiring",
      minTitleLength: 8,
    });
  });
});
