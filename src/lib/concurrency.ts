export type ConcurrencyBounds = {
  min?: number;
  max?: number;
};

export function parseConcurrency(
  value: unknown,
  fallback: number,
  bounds: ConcurrencyBounds = {},
): number {
  const min = Number.isFinite(bounds.min) ? Math.floor(bounds.min ?? 1) : 1;
  const max = Number.isFinite(bounds.max)
    ? Math.max(min, Math.floor(bounds.max ?? min))
    : Number.POSITIVE_INFINITY;

  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : Number.NaN;

  const normalized = Number.isFinite(parsed) ? Math.floor(parsed) : fallback;
  if (!Number.isFinite(normalized))
    return Math.max(min, Math.min(max, fallback));
  return Math.max(min, Math.min(max, normalized));
}

export async function mapWithConcurrency<T, R>(
  values: T[],
  concurrency: number,
  mapper: (value: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (values.length === 0) return [];

  const limit = parseConcurrency(concurrency, 1, {
    min: 1,
    max: values.length,
  });
  const results = new Array<R>(values.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= values.length) return;
      results[index] = await mapper(values[index] as T, index);
    }
  }

  await Promise.all(Array.from({ length: limit }, () => worker()));
  return results;
}
