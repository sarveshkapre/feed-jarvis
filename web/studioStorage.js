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

const LEGACY_SESSION_STORAGE_KEY = "feed-jarvis-studio";
const LEGACY_PERSONAS_STORAGE_KEY = "feed-jarvis-personas";
const LEGACY_CHANNEL_MAXCHARS_STORAGE_KEY =
  "feed-jarvis-studio:channel-maxchars";
export const STUDIO_STORAGE_SCHEMA_VERSION = 2;
export const STUDIO_STORAGE_SCHEMA_VERSION_KEY =
  "feed-jarvis-studio:schema-version";

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

function safeRemove(storage, key) {
  try {
    storage.removeItem(key);
  } catch {
    // Ignore quota/privacy mode errors.
  }
}

function readSchemaVersion(storage, schemaKey) {
  try {
    const raw = storage.getItem(schemaKey);
    const num = Number(raw);
    if (!Number.isFinite(num) || num < 0) return 0;
    return Math.floor(num);
  } catch {
    return 0;
  }
}

function parsePersonasOverridesRaw(raw) {
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry) => {
        if (!entry || typeof entry !== "object") return null;
        const name = Reflect.get(entry, "name");
        const prefix = Reflect.get(entry, "prefix");
        if (typeof name !== "string" || typeof prefix !== "string") return null;
        const nextName = name.trim();
        const nextPrefix = prefix.trim();
        if (!nextName || !nextPrefix) return null;
        return { name: nextName, prefix: nextPrefix };
      })
      .filter((entry) => entry !== null);
  } catch {
    return [];
  }
}

function migrateKey({
  storage,
  legacyKey,
  currentKey,
  parse,
  serialize,
  shouldMigrate,
}) {
  let legacyRaw = null;
  let currentRaw = null;
  try {
    legacyRaw = storage.getItem(legacyKey);
    currentRaw = storage.getItem(currentKey);
  } catch {
    return false;
  }

  if (typeof legacyRaw !== "string" || !legacyRaw.trim()) return false;
  if (typeof currentRaw === "string" && currentRaw.trim()) return false;

  const parsed = parse(legacyRaw);
  if (!shouldMigrate(parsed)) return false;

  safeWrite(storage, currentKey, serialize(parsed));
  safeRemove(storage, legacyKey);
  return true;
}

export function migrateStudioStorage(
  storage,
  {
    sessionKey = "feed-jarvis-studio:v1",
    personasKey = "feed-jarvis-personas:v1",
    channelMaxCharsKey = "feed-jarvis-studio:channel-maxchars:v1",
    schemaVersionKey = STUDIO_STORAGE_SCHEMA_VERSION_KEY,
    targetVersion = STUDIO_STORAGE_SCHEMA_VERSION,
  } = {},
) {
  const fromVersion = readSchemaVersion(storage, schemaVersionKey);
  const migratedKeys = [];

  if (fromVersion < 1) {
    if (
      migrateKey({
        storage,
        legacyKey: LEGACY_SESSION_STORAGE_KEY,
        currentKey: sessionKey,
        parse: parseStudioSessionSnapshot,
        serialize: JSON.stringify,
        shouldMigrate: (value) =>
          Boolean(
            value &&
              typeof value === "object" &&
              !Array.isArray(value) &&
              Object.keys(value).length > 0,
          ),
      })
    ) {
      migratedKeys.push(sessionKey);
    }

    if (
      migrateKey({
        storage,
        legacyKey: LEGACY_PERSONAS_STORAGE_KEY,
        currentKey: personasKey,
        parse: parsePersonasOverridesRaw,
        serialize: JSON.stringify,
        shouldMigrate: (value) => Array.isArray(value) && value.length > 0,
      })
    ) {
      migratedKeys.push(personasKey);
    }

    if (
      migrateKey({
        storage,
        legacyKey: LEGACY_CHANNEL_MAXCHARS_STORAGE_KEY,
        currentKey: channelMaxCharsKey,
        parse: parseChannelMaxChars,
        serialize: serializeChannelMaxChars,
        shouldMigrate: (value) =>
          Boolean(
            value &&
              typeof value === "object" &&
              !Array.isArray(value) &&
              Object.keys(value).length > 0,
          ),
      })
    ) {
      migratedKeys.push(channelMaxCharsKey);
    }
  }

  safeWrite(storage, schemaVersionKey, String(targetVersion));
  return {
    fromVersion,
    toVersion: targetVersion,
    migratedKeys,
  };
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
  safeRemove(storage, storageKey);
}
