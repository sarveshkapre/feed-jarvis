import { describe, expect, test } from "vitest";
import {
  formatFetchSummary,
  getMaxCharsForChannel,
  parseChannelMaxChars,
  serializeChannelMaxChars,
  setMaxCharsForChannel,
} from "../web/studioPrefs.js";

describe("studioPrefs", () => {
  test("parses and serializes per-channel maxChars safely", () => {
    const parsed = parseChannelMaxChars(
      JSON.stringify({
        x: 300,
        linkedin: "700",
        newsletter: 0,
        invalid: 123,
      }),
    );
    expect(parsed).toEqual({ x: 300, linkedin: 700 });

    const serialized = serializeChannelMaxChars(parsed);
    expect(parseChannelMaxChars(serialized)).toEqual({ x: 300, linkedin: 700 });
  });

  test("gets maxChars using saved values then defaults", () => {
    const defaults = { x: 280, linkedin: 700, newsletter: 900 };
    expect(getMaxCharsForChannel("x", { x: 310 }, defaults)).toBe(310);
    expect(getMaxCharsForChannel("linkedin", {}, defaults)).toBe(700);
  });

  test("updates maxChars for a channel only when valid and changed", () => {
    const start = { x: 280 };
    expect(setMaxCharsForChannel(start, "x", 280)).toBe(start);
    expect(setMaxCharsForChannel(start, "x", "281")).toEqual({ x: 281 });
    expect(setMaxCharsForChannel(start, "x", "")).toBe(start);
  });

  test("formats fetch summary with details when present", () => {
    expect(
      formatFetchSummary(
        {
          sources: 2,
          cache: 1,
          network: 1,
          dedupe: true,
          deduped: 3,
          limited: 0,
        },
        20,
        2,
      ),
    ).toBe("Loaded 20 item(s) from 2 feed(s). (1 cache, 1 network, 3 deduped)");

    expect(formatFetchSummary(null, 5, 1)).toBe(
      "Loaded 5 item(s) from 1 feed(s).",
    );
  });
});
