export type DraftExportRow = {
  channel: string;
  mode: string;
  llmModel: string;
  template: string;
  personaName: string;
  personaPrefix: string;
  rulePrepend: string;
  ruleAppend: string;
  ruleHashtags: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  title: string;
  url: string;
  post: string;
};

export type BuildDraftRowsInput = {
  generatedMeta: unknown;
  posts: unknown;
  generatedItems: unknown;
};

export function buildDraftRows(input: BuildDraftRowsInput): DraftExportRow[];
export function toDraftsJsonl(rows: unknown): string;
export function toDraftsCsv(rows: unknown): string;
export function toAgentFeedJson(meta: unknown, feed: unknown): string;
export function copyText(
  clipboard: { writeText?: (text: string) => Promise<void> } | null | undefined,
  text: unknown,
): Promise<void>;
export function downloadFile(
  documentRef: {
    createElement: (tag: string) => {
      href: string;
      download: string;
      click: () => void;
    };
    body: {
      appendChild: (node: unknown) => unknown;
      removeChild: (node: unknown) => unknown;
    };
  },
  urlRef: {
    createObjectURL: (blob: Blob) => string;
    revokeObjectURL: (url: string) => void;
  },
  filename: string,
  content: string,
): void;
