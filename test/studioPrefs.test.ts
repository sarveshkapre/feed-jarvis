import { describe, expect, test } from "vitest";
import {
  formatFetchSummary,
  getMaxCharsForChannel,
  parseChannelMaxChars,
  parseStudioSessionSnapshot,
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

  test("includes concurrency in fetch summary details when provided", () => {
    expect(
      formatFetchSummary(
        {
          sources: 3,
          cache: 0,
          network: 3,
          dedupe: false,
          deduped: 0,
          limited: 0,
          concurrency: 4,
        },
        6,
        3,
      ),
    ).toBe(
      "Loaded 6 item(s) from 3 feed(s). (0 cache, 3 network, concurrency 4)",
    );
  });

  test("includes retry and latency diagnostics in fetch summary details", () => {
    expect(
      formatFetchSummary(
        {
          sources: 2,
          cache: 1,
          network: 1,
          dedupe: false,
          deduped: 0,
          limited: 0,
          retryAttempts: 2,
          retrySuccesses: 1,
          durationMs: 48,
          slowestFeedMs: 35,
        },
        4,
        2,
      ),
    ).toBe(
      "Loaded 4 item(s) from 2 feed(s). (1 cache, 1 network, retries 2 (recovered 1), duration 48ms, slowest 35ms)",
    );
  });

  test("returns null for invalid or non-object session snapshots", () => {
    expect(parseStudioSessionSnapshot("not json")).toBeNull();
    expect(parseStudioSessionSnapshot(JSON.stringify(["bad"]))).toBeNull();
    expect(parseStudioSessionSnapshot("")).toBeNull();
  });

  test("drops stale keys and invalid enum values from session snapshots", () => {
    const snapshot = parseStudioSessionSnapshot(
      JSON.stringify({
        source: "desktop",
        channel: "mastodon",
        template: "unknown",
        generationMode: "auto",
        agentLayout: "grid",
        staleKey: "stale",
        dedupe: true,
        filterInclude: "ai",
      }),
    );

    expect(snapshot).toEqual({
      dedupe: true,
      filterInclude: "ai",
    });
  });

  test("keeps valid partial snapshot fields", () => {
    const snapshot = parseStudioSessionSnapshot(
      JSON.stringify({
        source: "json",
        channel: "linkedin",
        template: "takeaway",
        generationMode: "llm",
        agentLayout: "consensus",
        maxChars: "600",
        useCustomPersona: false,
      }),
    );

    expect(snapshot).toEqual({
      source: "json",
      channel: "linkedin",
      template: "takeaway",
      generationMode: "llm",
      agentLayout: "consensus",
      maxChars: "600",
      useCustomPersona: false,
    });
  });
});
