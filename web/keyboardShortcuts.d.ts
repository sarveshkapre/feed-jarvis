export type StudioShortcutAction =
  | "load-items"
  | "generate-posts"
  | "copy-drafts"
  | "download-drafts-jsonl"
  | "build-agent-feed"
  | "copy-agent-feed"
  | "download-agent-feed";

export function isEditableShortcutTarget(target: unknown): boolean;

export function matchStudioShortcut(
  event:
    | {
        key?: string;
        ctrlKey?: boolean;
        metaKey?: boolean;
        altKey?: boolean;
        shiftKey?: boolean;
        repeat?: boolean;
        defaultPrevented?: boolean;
        target?: unknown;
      }
    | null
    | undefined,
): StudioShortcutAction | null;
