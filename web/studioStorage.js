import {
  FEED_SETS_STORAGE_KEY,
  parseFeedSets,
  serializeFeedSets,
} from "./feedSets.js";
import {
  FILTER_PRESETS_STORAGE_KEY,
  parseFilterPresets,
  serializeFilterPresets,
} from "./filterPresets.js";
import {
  parseRulePresets,
  RULE_PRESETS_STORAGE_KEY,
  serializeRulePresets,
} from "./rulePresets.js";
import {
  parseChannelMaxChars,
  parseStudioSessionSnapshot,
  serializeChannelMaxChars,
} from "./studioPrefs.js";

function safeRead(storage, key, parse, fallback) {
  try {
    const raw = storage.getItem(key);
    return parse(raw);
  } catch {
    return fallback;
  }
}

function safeWrite(storage, key, value) {
  try {
    storage.setItem(key, value);
  } catch {
    // Ignore quota/privacy mode errors.
  }
}

export function readChannelMaxCharsByChannel(storage, storageKey) {
  return safeRead(storage, storageKey, parseChannelMaxChars, {});
}

export function writeChannelMaxCharsByChannel(storage, storageKey, map) {
  safeWrite(storage, storageKey, serializeChannelMaxChars(map));
}

export function readFeedSets(storage) {
  return safeRead(storage, FEED_SETS_STORAGE_KEY, parseFeedSets, []);
}

export function writeFeedSets(storage, sets) {
  safeWrite(storage, FEED_SETS_STORAGE_KEY, serializeFeedSets(sets));
}

export function readFilterPresets(storage) {
  return safeRead(storage, FILTER_PRESETS_STORAGE_KEY, parseFilterPresets, []);
}

export function writeFilterPresets(storage, presets) {
  safeWrite(
    storage,
    FILTER_PRESETS_STORAGE_KEY,
    serializeFilterPresets(presets),
  );
}

export function readRulePresets(storage) {
  return safeRead(storage, RULE_PRESETS_STORAGE_KEY, parseRulePresets, []);
}

export function writeRulePresets(storage, presets) {
  safeWrite(storage, RULE_PRESETS_STORAGE_KEY, serializeRulePresets(presets));
}

export function readSessionSnapshot(storage, storageKey) {
  return safeRead(storage, storageKey, parseStudioSessionSnapshot, null);
}

export function writeSessionSnapshot(storage, storageKey, snapshot) {
  safeWrite(storage, storageKey, JSON.stringify(snapshot));
}

export function readPersonasOverrides(storage, storageKey, parsePersonas) {
  try {
    const raw = storage.getItem(storageKey);
    if (!raw) return [];
    return parsePersonas(raw);
  } catch {
    return [];
  }
}

export function writePersonasOverrides(storage, storageKey, personas) {
  safeWrite(storage, storageKey, JSON.stringify(personas));
}

export function clearPersonasOverrides(storage, storageKey) {
  try {
    storage.removeItem(storageKey);
  } catch {
    // Ignore quota/privacy mode errors.
  }
}
