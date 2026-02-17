import type { FeedItem } from "./filters.js";

export type InvalidJsonItem = {
  index: number;
  reason: string;
};

export function normalizeUrls(raw: unknown): string[];
export function normalizeFeedUrl(raw: unknown): string;
export function toItemsJson(items: unknown): string;
export function safeHttpUrl(raw: unknown): URL | null;
export function parseItemsJsonPayload(parsed: unknown): {
  items: FeedItem[];
  invalid: InvalidJsonItem[];
};
export function formatInvalidItemsSummary(invalid: unknown): string;
