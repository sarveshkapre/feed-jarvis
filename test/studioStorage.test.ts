import { describe, expect, test } from "vitest";
import { FEED_SETS_STORAGE_KEY } from "../web/feedSets.js";
import { FILTER_PRESETS_STORAGE_KEY } from "../web/filterPresets.js";
import { RULE_PRESETS_STORAGE_KEY } from "../web/rulePresets.js";
import {
  clearPersonasOverrides,
  readChannelMaxCharsByChannel,
  readFeedSets,
  readFilterPresets,
  readPersonasOverrides,
  readRulePresets,
  readSessionSnapshot,
  writeChannelMaxCharsByChannel,
  writeFeedSets,
  writeFilterPresets,
  writePersonasOverrides,
  writeRulePresets,
  writeSessionSnapshot,
} from "../web/studioStorage.js";

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
