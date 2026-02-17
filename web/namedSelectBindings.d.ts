export type NamedEntry = {
  name?: string;
};

export type NamedSelectOption = {
  value: string;
  label: string;
};

export type NamedSelectSnapshot = {
  options: NamedSelectOption[];
  selectedValue: string;
  hasSelection: boolean;
};

export function collectNamedEntryNames(entries: unknown[]): string[];

export function resolveNamedSelection(
  entryNames: unknown[],
  selectedName: unknown,
): string;

export function buildNamedSelectSnapshot(
  entries: unknown[],
  options?: {
    selectedName?: string;
    placeholderLabel?: string;
  },
): NamedSelectSnapshot;

export function applyNamedSelectSnapshot(
  select: {
    innerHTML: string;
    value: string;
    appendChild: (option: { value: string; textContent: string }) => void;
  },
  snapshot: NamedSelectSnapshot,
  options?: {
    createOptionElement?: () => { value: string; textContent: string };
  },
): void;

export function syncNamedSelectControl(options: {
  select: {
    innerHTML: string;
    value: string;
    appendChild: (option: { value: string; textContent: string }) => void;
  } | null;
  entries: unknown[];
  placeholderLabel: string;
  selectedName?: string;
  loadButton?: { disabled: boolean } | null;
  deleteButton?: { disabled: boolean } | null;
  createOptionElement?: () => { value: string; textContent: string };
}): {
  selectedValue: string;
  hasSelection: boolean;
};

export function findNamedEntryByName(
  entries: unknown[],
  selectedName: unknown,
): NamedEntry | null;
