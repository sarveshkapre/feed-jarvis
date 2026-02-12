export type FeedSet = {
  name: string;
  urls: string[];
  updatedAt?: string;
};

export const FEED_SETS_STORAGE_KEY: string;

export function parseFeedSets(raw: string | null | undefined): FeedSet[];
export function parseFeedSetsOpml(raw: string | null | undefined): FeedSet[];
export function serializeFeedSets(sets: unknown): string;
export function serializeFeedSetsAsOpml(sets: unknown): string;
export function upsertFeedSet(sets: unknown, next: unknown): FeedSet[];
export function removeFeedSet(sets: unknown, name: unknown): FeedSet[];
