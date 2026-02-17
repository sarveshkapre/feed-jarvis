import { describe, expect, test } from "vitest";
import {
  isEditableShortcutTarget,
  matchStudioShortcut,
} from "../web/keyboardShortcuts.js";

function buildShortcutEvent(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    key: "",
    ctrlKey: true,
    metaKey: false,
    altKey: false,
    shiftKey: false,
    repeat: false,
    defaultPrevented: false,
    target: null,
    ...overrides,
  };
}

describe("keyboardShortcuts", () => {
  test("matches Studio shortcut actions", () => {
    expect(matchStudioShortcut(buildShortcutEvent({ key: "Enter" }))).toBe(
      "load-items",
    );
    expect(
      matchStudioShortcut(buildShortcutEvent({ key: "Enter", shiftKey: true })),
    ).toBe("generate-posts");
    expect(
      matchStudioShortcut(buildShortcutEvent({ key: "c", shiftKey: true })),
    ).toBe("copy-drafts");
    expect(
      matchStudioShortcut(buildShortcutEvent({ key: "E", shiftKey: true })),
    ).toBe("download-drafts-jsonl");
    expect(
      matchStudioShortcut(buildShortcutEvent({ key: "b", shiftKey: true })),
    ).toBe("build-agent-feed");
    expect(
      matchStudioShortcut(buildShortcutEvent({ key: "k", shiftKey: true })),
    ).toBe("copy-agent-feed");
    expect(
      matchStudioShortcut(buildShortcutEvent({ key: "j", shiftKey: true })),
    ).toBe("download-agent-feed");
  });

  test("ignores unsupported modifier states", () => {
    expect(
      matchStudioShortcut(buildShortcutEvent({ key: "Enter", altKey: true })),
    ).toBeNull();
    expect(
      matchStudioShortcut(
        buildShortcutEvent({ key: "Enter", ctrlKey: false, metaKey: false }),
      ),
    ).toBeNull();
    expect(
      matchStudioShortcut(buildShortcutEvent({ key: "Enter", repeat: true })),
    ).toBeNull();
    expect(
      matchStudioShortcut(
        buildShortcutEvent({ key: "Enter", defaultPrevented: true }),
      ),
    ).toBeNull();
  });

  test("blocks most shortcuts while typing in editable targets", () => {
    const textareaTarget = { tagName: "TEXTAREA" };
    expect(
      matchStudioShortcut(
        buildShortcutEvent({
          key: "Enter",
          shiftKey: true,
          target: textareaTarget,
        }),
      ),
    ).toBeNull();
    expect(
      matchStudioShortcut(
        buildShortcutEvent({
          key: "c",
          shiftKey: true,
          target: textareaTarget,
        }),
      ),
    ).toBeNull();
    expect(
      matchStudioShortcut(
        buildShortcutEvent({ key: "Enter", target: textareaTarget }),
      ),
    ).toBe("load-items");
  });

  test("detects editable targets safely", () => {
    expect(isEditableShortcutTarget({ tagName: "INPUT", type: "text" })).toBe(
      true,
    );
    expect(
      isEditableShortcutTarget({ tagName: "INPUT", type: "checkbox" }),
    ).toBe(false);
    expect(isEditableShortcutTarget({ tagName: "TEXTAREA" })).toBe(true);
    expect(isEditableShortcutTarget({ isContentEditable: true })).toBe(true);
    expect(isEditableShortcutTarget({ tagName: "BUTTON" })).toBe(false);
  });
});
