import { describe, expect, test } from "vitest";
import { FEED_SETS_STORAGE_KEY } from "../web/feedSets.js";
import { FILTER_PRESETS_STORAGE_KEY } from "../web/filterPresets.js";
import { RULE_PRESETS_STORAGE_KEY } from "../web/rulePresets.js";
import {
  clearPersonasOverrides,
  migrateStudioStorage,
  readChannelMaxCharsByChannel,
  readFeedSets,
  readFilterPresets,
  readPersonasOverrides,
  readRulePresets,
  readSessionSnapshot,
  STUDIO_STORAGE_SCHEMA_VERSION_KEY,
  writeChannelMaxCharsByChannel,
  writeFeedSets,
  writeFilterPresets,
  writePersonasOverrides,
  writeRulePresets,
  writeSessionSnapshot,
} from "../web/studioStorage.js";

const SESSION_ROUND_TRIP_FIXTURE = Object.freeze({
  source: "feed",
  feedUrls: "https://example.com/rss.xml\nhttps://example.com/atom.xml",
  feedSetName: "Daily feeds",
  maxItems: "25",
  fetchConcurrency: "6",
  dedupe: true,
  jsonItems: '[{"title":"Hello","url":"https://example.com/post"}]',
  filterInclude: "launch, update",
  filterExclude: "hiring",
  filterMinTitleLength: "10",
  filterPresetName: "Launch watch",
  personaName: "Analyst",
  useCustomPersona: false,
  customPersonaName: "",
  customPersonaPrefix: "",
  personaSearch: "analyst",
  channel: "linkedin",
  template: "takeaway",
  generationMode: "llm",
  llmModel: "gpt-4.1-mini",
  maxChars: "700",
  agentPersonaLimit: "8",
  agentPersonaNames: "Analyst, Builder",
  agentPersonaMaxChars: "Analyst:320\nBuilder:280",
  agentPersonaSearch: "builder",
  agentLayout: "consensus",
  rulePresetName: "Launch voice",
  rulePrepend: "New:",
  ruleAppend: "Learn more at the link.",
  ruleHashtags: "#ai #product",
  utmEnabled: true,
  utmSource: "newsletter",
  utmMedium: "social",
  utmCampaign: "weekly-launch",
} satisfies Record<string, string | boolean>);

function createStorage(seed: Record<string, string> = {}) {
  const values = new Map(Object.entries(seed));
  let failGet = false;
  let failSet = false;
  let failRemove = false;

  return {
    getItem(key: string) {
      if (failGet) throw new Error("get failed");
      return values.has(key) ? (values.get(key) ?? null) : null;
    },
    setItem(key: string, value: string) {
      if (failSet) throw new Error("set failed");
      values.set(key, value);
    },
    removeItem(key: string) {
      if (failRemove) throw new Error("remove failed");
      values.delete(key);
    },
    toObject() {
      return Object.fromEntries(values.entries());
    },
    failGet(next = true) {
      failGet = next;
    },
    failSet(next = true) {
      failSet = next;
    },
    failRemove(next = true) {
      failRemove = next;
    },
  };
}

describe("studioStorage", () => {
  test("reads/writes channel max chars using safe storage wrappers", () => {
    const storage = createStorage();
    const key = "feed-jarvis-studio:channel-maxchars:v1";

    writeChannelMaxCharsByChannel(storage, key, { x: 320, linkedin: 700 });
    expect(readChannelMaxCharsByChannel(storage, key)).toEqual({
      x: 320,
      linkedin: 700,
    });
  });

  test("returns defaults when storage access throws", () => {
    const storage = createStorage();
    const key = "feed-jarvis-studio:channel-maxchars:v1";
    storage.failGet();
    expect(readChannelMaxCharsByChannel(storage, key)).toEqual({});

    storage.failSet();
    expect(() =>
      writeChannelMaxCharsByChannel(storage, key, { x: 280 }),
    ).not.toThrow();
  });

  test("migrates legacy storage keys into versioned keys", () => {
    const storage = createStorage({
      "feed-jarvis-studio": JSON.stringify({
        source: "json",
        channel: "x",
        dedupe: true,
        stale: "drop",
      }),
      "feed-jarvis-personas": JSON.stringify([
        { name: " Analyst ", prefix: " Analyst: " },
        { name: "bad" },
      ]),
      "feed-jarvis-studio:channel-maxchars": JSON.stringify({
        x: 320,
        linkedin: "700",
        bad: 1,
      }),
    });

    const result = migrateStudioStorage(storage, {
      sessionKey: "feed-jarvis-studio:v1",
      personasKey: "feed-jarvis-personas:v1",
      channelMaxCharsKey: "feed-jarvis-studio:channel-maxchars:v1",
    });

    expect(result).toEqual({
      fromVersion: 0,
      toVersion: 2,
      migratedKeys: [
        "feed-jarvis-studio:v1",
        "feed-jarvis-personas:v1",
        "feed-jarvis-studio:channel-maxchars:v1",
      ],
    });

    const raw = storage.toObject();
    expect(raw["feed-jarvis-studio"]).toBeUndefined();
    expect(raw["feed-jarvis-personas"]).toBeUndefined();
    expect(raw["feed-jarvis-studio:channel-maxchars"]).toBeUndefined();
    expect(raw[STUDIO_STORAGE_SCHEMA_VERSION_KEY]).toBe("2");

    expect(JSON.parse(raw["feed-jarvis-studio:v1"] as string)).toEqual({
      source: "json",
      channel: "x",
      dedupe: true,
    });
    expect(JSON.parse(raw["feed-jarvis-personas:v1"] as string)).toEqual([
      { name: "Analyst", prefix: "Analyst:" },
    ]);
    expect(
      readChannelMaxCharsByChannel(
        storage,
        "feed-jarvis-studio:channel-maxchars:v1",
      ),
    ).toEqual({ x: 320, linkedin: 700 });
  });

  test("keeps existing versioned keys when schema is already current", () => {
    const storage = createStorage({
      [STUDIO_STORAGE_SCHEMA_VERSION_KEY]: "2",
      "feed-jarvis-studio:v1": JSON.stringify({ source: "feed" }),
      "feed-jarvis-studio": JSON.stringify({ source: "json" }),
    });

    const result = migrateStudioStorage(storage, {
      sessionKey: "feed-jarvis-studio:v1",
    });

    expect(result).toEqual({
      fromVersion: 2,
      toVersion: 2,
      migratedKeys: [],
    });

    const raw = storage.toObject();
    expect(raw["feed-jarvis-studio:v1"]).toBe(
      JSON.stringify({ source: "feed" }),
    );
    expect(raw["feed-jarvis-studio"]).toBe(JSON.stringify({ source: "json" }));
  });

  test("reads and writes feed/filter/rule presets via their storage keys", () => {
    const storage = createStorage();

    writeFeedSets(storage, [
      { name: "Main", urls: ["https://example.com/rss"] },
    ]);
    writeFilterPresets(storage, [
      {
        name: "Focus",
        filters: { include: "ai", exclude: "", minTitleLength: 0 },
      },
    ]);
    writeRulePresets(storage, [
      { name: "Thread", rules: { prepend: "New:", hashtags: "ai" } },
    ]);

    expect(readFeedSets(storage)).toEqual([
      { name: "Main", urls: ["https://example.com/rss"] },
    ]);
    expect(readFilterPresets(storage)).toEqual([
      {
        name: "Focus",
        filters: { include: "ai", exclude: "", minTitleLength: 0 },
      },
    ]);
    expect(readRulePresets(storage)).toEqual([
      { name: "Thread", rules: { prepend: "New:", hashtags: "ai" } },
    ]);

    const raw = storage.toObject();
    expect(raw[FEED_SETS_STORAGE_KEY]).toBeTruthy();
    expect(raw[FILTER_PRESETS_STORAGE_KEY]).toBeTruthy();
    expect(raw[RULE_PRESETS_STORAGE_KEY]).toBeTruthy();
  });

  test("returns empty arrays when preset payloads are invalid", () => {
    const storage = createStorage({
      [FEED_SETS_STORAGE_KEY]: "invalid-json",
      [FILTER_PRESETS_STORAGE_KEY]: "invalid-json",
      [RULE_PRESETS_STORAGE_KEY]: "invalid-json",
    });

    expect(readFeedSets(storage)).toEqual([]);
    expect(readFilterPresets(storage)).toEqual([]);
    expect(readRulePresets(storage)).toEqual([]);
  });

  test("reads and writes sanitized session snapshots", () => {
    const storage = createStorage();
    const key = "feed-jarvis-studio:v1";

    writeSessionSnapshot(storage, key, {
      source: "json",
      channel: "x",
      staleField: "ignored",
      dedupe: true,
    });

    expect(readSessionSnapshot(storage, key)).toEqual({
      source: "json",
      channel: "x",
      dedupe: true,
    });
  });

  test("round-trips the deterministic session fixture without drift", () => {
    const storage = createStorage();
    const key = "feed-jarvis-studio:v1";
    writeSessionSnapshot(storage, key, {
      ...SESSION_ROUND_TRIP_FIXTURE,
      staleKey: "drop-me",
    });

    expect(readSessionSnapshot(storage, key)).toEqual(
      SESSION_ROUND_TRIP_FIXTURE,
    );
  });

  test("returns null for invalid stored session snapshots", () => {
    const key = "feed-jarvis-studio:v1";
    const storage = createStorage({ [key]: "not-json" });
    expect(readSessionSnapshot(storage, key)).toBeNull();
  });

  test("reads personas overrides with parser callback and safe fallback", () => {
    const key = "feed-jarvis-personas:v1";
    const storage = createStorage({
      [key]: JSON.stringify([{ name: "Analyst", prefix: "A" }]),
    });

    expect(
      readPersonasOverrides(storage, key, (raw) => JSON.parse(raw)),
    ).toEqual([{ name: "Analyst", prefix: "A" }]);

    expect(
      readPersonasOverrides(storage, key, () => {
        throw new Error("bad");
      }),
    ).toEqual([]);
  });

  test("writes and clears persona overrides safely", () => {
    const key = "feed-jarvis-personas:v1";
    const storage = createStorage();

    writePersonasOverrides(storage, key, [{ name: "Macro", prefix: "M" }]);
    expect(storage.toObject()[key]).toContain("Macro");

    clearPersonasOverrides(storage, key);
    expect(storage.toObject()[key]).toBeUndefined();
  });

  test("swallows write/remove failures for personas", () => {
    const key = "feed-jarvis-personas:v1";
    const storage = createStorage();
    storage.failSet();
    expect(() =>
      writePersonasOverrides(storage, key, [{ name: "Macro", prefix: "M" }]),
    ).not.toThrow();
    storage.failSet(false);
    writePersonasOverrides(storage, key, [{ name: "Macro", prefix: "M" }]);

    storage.failRemove();
    expect(() => clearPersonasOverrides(storage, key)).not.toThrow();
  });
});
