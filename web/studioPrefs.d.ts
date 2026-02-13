export function parseChannelMaxChars(
  raw: string | null | undefined,
): Record<string, number>;

export function parseStudioSessionSnapshot(
  raw: string | null | undefined,
): Record<string, string | boolean> | null;

export function serializeChannelMaxChars(
  map: Record<string, unknown> | null | undefined,
): string;

export function getMaxCharsForChannel(
  channel: string,
  savedByChannel: Record<string, unknown> | null | undefined,
  defaults: Record<string, unknown> | null | undefined,
): number;

export function setMaxCharsForChannel(
  savedByChannel: Record<string, unknown> | null | undefined,
  channel: string,
  value: unknown,
): Record<string, number>;

export function formatFetchSummary(
  summary: unknown,
  itemsCount: unknown,
  fallbackSources: unknown,
): string;
