import type { Persona } from "./personas.js";

export type FeedItem = {
  title: string;
  url: string;
};

export type PostChannel = "x" | "linkedin" | "newsletter";
export type PostTemplate = "straight" | "takeaway" | "cta";

export type PostOptions = {
  channel?: PostChannel;
  template?: PostTemplate;
};

export function generatePost(
  item: FeedItem,
  persona: Persona,
  maxChars = 280,
  options: PostOptions = {},
): string {
  const base = formatBase(item.title, persona, options.template);
  const url = item.url.trim();
  let suffix = "";

  if (url) {
    const { separator, label, joiner } = getUrlFormat(options.channel);
    const labelText = label ? `${label}${joiner}` : "";
    const prefix = `${separator}${labelText}`;
    const full = `${prefix}${url}`;
    if (full.length <= maxChars) {
      suffix = full;
    } else {
      const allowedUrlChars = Math.max(0, maxChars - prefix.length);
      if (allowedUrlChars > 0) {
        suffix = `${prefix}${truncateMiddle(url, allowedUrlChars)}`;
      }
    }
  }

  const available = Math.max(0, maxChars - suffix.length);
  const trimmed =
    base.length <= available
      ? base
      : available <= 0
        ? ""
        : available === 1
          ? "…"
          : `${base.slice(0, Math.max(0, available - 1)).trimEnd()}…`;

  return `${trimmed}${suffix}`.trim();
}

export function generatePosts(
  items: FeedItem[],
  persona: Persona,
  maxChars = 280,
  options: PostOptions = {},
): string[] {
  return items.map((item) => generatePost(item, persona, maxChars, options));
}

function formatBase(
  title: string,
  persona: Persona,
  template?: PostTemplate,
): string {
  const trimmedTitle = title.trim();
  const prefix = persona.prefix.trim();
  const frame = getTemplateFrame(template);

  const framed = frame
    ? frame.replace("{title}", trimmedTitle || "Update")
    : trimmedTitle;

  return `${prefix} ${framed}`.trim();
}

function getTemplateFrame(template?: PostTemplate): string | undefined {
  switch (template) {
    case "takeaway":
      return "Takeaway: {title}";
    case "cta":
      return "{title} — Get the details";
    default:
      return undefined;
  }
}

function getUrlFormat(channel?: PostChannel): {
  separator: string;
  label: string;
  joiner: string;
} {
  switch (channel) {
    case "linkedin":
      return { separator: "\n", label: "Read more:", joiner: " " };
    case "newsletter":
      return { separator: "\n", label: "Source:", joiner: " " };
    default:
      return { separator: " ", label: "", joiner: "" };
  }
}

function truncateMiddle(text: string, maxChars: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) return trimmed;
  if (maxChars <= 1) return "…".slice(0, maxChars);

  const headLen = Math.ceil((maxChars - 1) / 2);
  const tailLen = Math.floor((maxChars - 1) / 2);
  const head = trimmed.slice(0, headLen);
  const tail = trimmed.slice(trimmed.length - tailLen);
  return `${head}…${tail}`;
}
