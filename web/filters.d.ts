export type FeedItem = {
  title: string;
  url: string;
};

export type ItemFilters = {
  include?: string;
  exclude?: string;
  minTitleLength?: number;
};

export function normalizeItemFilters(raw?: ItemFilters): Required<
  Pick<ItemFilters, "include" | "exclude">
> & {
  minTitleLength: number;
};

export function applyItemFilters(
  items: FeedItem[],
  rawFilters?: ItemFilters,
): FeedItem[];
