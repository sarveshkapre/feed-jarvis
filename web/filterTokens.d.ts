type FilterTextFields = {
  include?: string;
  exclude?: string;
};

export function parseFilterTokens(
  filters: FilterTextFields | null | undefined,
): {
  include: string[];
  exclude: string[];
};

export function removeFilterToken(
  raw: string | null | undefined,
  target: string | null | undefined,
): string;
