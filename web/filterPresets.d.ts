import type { ItemFilters } from "./filters.js";

export type FilterPreset = {
  name: string;
  filters: Required<Pick<ItemFilters, "include" | "exclude">> & {
    minTitleLength: number;
  };
  updatedAt?: string;
};

export const FILTER_PRESETS_STORAGE_KEY: string;

export function parseFilterPresets(raw: unknown): FilterPreset[];

export function serializeFilterPresets(presets: unknown): string;

export function upsertFilterPreset(
  presets: unknown,
  next: unknown,
): FilterPreset[];

export function removeFilterPreset(
  presets: unknown,
  name: unknown,
): FilterPreset[];

export function mergeFilterPresets(
  existingPresets: unknown,
  incomingPresets: unknown,
): FilterPreset[];
