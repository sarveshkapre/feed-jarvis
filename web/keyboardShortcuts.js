const NON_TEXT_INPUT_TYPES = new Set([
  "button",
  "checkbox",
  "color",
  "file",
  "image",
  "radio",
  "range",
  "reset",
  "submit",
]);

const STUDIO_SHORTCUTS = [
  { action: "load-items", key: "enter", shift: false, allowInEditable: true },
  {
    action: "generate-posts",
    key: "enter",
    shift: true,
    allowInEditable: false,
  },
  { action: "copy-drafts", key: "c", shift: true, allowInEditable: false },
  {
    action: "download-drafts-jsonl",
    key: "e",
    shift: true,
    allowInEditable: false,
  },
  {
    action: "build-agent-feed",
    key: "b",
    shift: true,
    allowInEditable: false,
  },
  {
    action: "copy-agent-feed",
    key: "k",
    shift: true,
    allowInEditable: false,
  },
  {
    action: "download-agent-feed",
    key: "j",
    shift: true,
    allowInEditable: false,
  },
];

function normalizeKey(raw) {
  if (typeof raw !== "string") return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";
  return trimmed.toLowerCase();
}

export function isEditableShortcutTarget(target) {
  if (!target || typeof target !== "object") return false;
  if (target.isContentEditable === true) return true;

  const tagName =
    typeof target.tagName === "string" ? target.tagName.toLowerCase() : "";
  if (tagName === "textarea" || tagName === "select") return true;

  if (tagName === "input") {
    const type =
      typeof target.type === "string" ? target.type.toLowerCase() : "";
    return !NON_TEXT_INPUT_TYPES.has(type);
  }

  return false;
}

export function matchStudioShortcut(event) {
  if (!event || typeof event !== "object") return null;
  if (event.defaultPrevented || event.repeat) return null;

  if (!(event.metaKey || event.ctrlKey) || event.altKey) return null;

  const key = normalizeKey(event.key);
  if (!key) return null;

  const shiftKey = Boolean(event.shiftKey);
  for (const binding of STUDIO_SHORTCUTS) {
    if (binding.key !== key || binding.shift !== shiftKey) continue;
    if (
      isEditableShortcutTarget(event.target) &&
      binding.allowInEditable !== true
    ) {
      return null;
    }
    return binding.action;
  }

  return null;
}
