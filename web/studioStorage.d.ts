import type { FeedSet } from "./feedSets.js";
import type { FilterPreset } from "./filterPresets.js";
import type { RulePreset } from "./rulePresets.js";
import type { StudioSessionSnapshot } from "./studioPrefs.js";

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export type ChannelMaxCharsMap = Record<string, number>;
export type PersonaEntry = { name: string; prefix: string };

export declare function readChannelMaxCharsByChannel(
  storage: StorageLike,
  storageKey: string,
): ChannelMaxCharsMap;
export declare function writeChannelMaxCharsByChannel(
  storage: StorageLike,
  storageKey: string,
  map: ChannelMaxCharsMap,
): void;

export declare function readFeedSets(storage: StorageLike): FeedSet[];
export declare function writeFeedSets(
  storage: StorageLike,
  sets: FeedSet[],
): void;

export declare function readFilterPresets(storage: StorageLike): FilterPreset[];
export declare function writeFilterPresets(
  storage: StorageLike,
  presets: FilterPreset[],
): void;

export declare function readRulePresets(storage: StorageLike): RulePreset[];
export declare function writeRulePresets(
  storage: StorageLike,
  presets: RulePreset[],
): void;

export declare function readSessionSnapshot(
  storage: StorageLike,
  storageKey: string,
): StudioSessionSnapshot | null;
export declare function writeSessionSnapshot(
  storage: StorageLike,
  storageKey: string,
  snapshot: Record<string, unknown>,
): void;

export declare function readPersonasOverrides(
  storage: StorageLike,
  storageKey: string,
  parsePersonas: (raw: string) => PersonaEntry[],
): PersonaEntry[];
export declare function writePersonasOverrides(
  storage: StorageLike,
  storageKey: string,
  personas: PersonaEntry[],
): void;
export declare function clearPersonasOverrides(
  storage: StorageLike,
  storageKey: string,
): void;
