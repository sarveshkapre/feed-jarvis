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
  rules?: PostRules;
};

export type PostUtm = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
};

export type PostRules = {
  prepend?: string;
  append?: string;
  hashtags?: string;
  utm?: PostUtm;
};

function normalizeRuleText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeUtm(raw: unknown): PostUtm | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const source = normalizeRuleText(Reflect.get(raw, "source"));
  const medium = normalizeRuleText(Reflect.get(raw, "medium"));
  const campaign = normalizeRuleText(Reflect.get(raw, "campaign"));
  const content = normalizeRuleText(Reflect.get(raw, "content"));
  const term = normalizeRuleText(Reflect.get(raw, "term"));

  if (!source && !medium && !campaign && !content && !term) return undefined;
  return {
    source: source || undefined,
    medium: medium || undefined,
    campaign: campaign || undefined,
    content: content || undefined,
    term: term || undefined,
  };
}

function normalizeHashtags(raw: unknown): string {
  const text = normalizeRuleText(raw);
  if (!text) return "";

  const tokens = text
    .split(/[\s,]+/g)
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => {
      const normalized = token.startsWith("#") ? token : `#${token}`;
      return normalized.length === 1 ? "" : normalized;
    })
    .filter(Boolean);

  const seen = new Set<string>();
  const out: string[] = [];
  for (const token of tokens) {
    const key = token.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(token);
  }

  return out.join(" ");
}

function normalizeRules(raw: unknown): {
  prepend: string;
  append: string;
  hashtags: string;
  utm?: PostUtm;
} {
  if (!raw || typeof raw !== "object") {
    return { prepend: "", append: "", hashtags: "", utm: undefined };
  }

  return {
    prepend: normalizeRuleText(Reflect.get(raw, "prepend")),
    append: normalizeRuleText(Reflect.get(raw, "append")),
    hashtags: normalizeHashtags(Reflect.get(raw, "hashtags")),
    utm: normalizeUtm(Reflect.get(raw, "utm")),
  };
}

export function applyUtmToUrl(rawUrl: string, utm?: PostUtm): string {
  const trimmed = rawUrl.trim();
  if (!trimmed || !utm) return trimmed;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return trimmed;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return trimmed;
  }

  const mapping: Array<[keyof PostUtm, string]> = [
    ["source", "utm_source"],
    ["medium", "utm_medium"],
    ["campaign", "utm_campaign"],
    ["content", "utm_content"],
    ["term", "utm_term"],
  ];

  for (const [key, param] of mapping) {
    const value = utm[key];
    if (!value) continue;
    parsed.searchParams.set(param, value);
  }

  return parsed.toString();
}

function trimWithEllipsis(text: string, maxChars: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) return trimmed;
  if (maxChars <= 0) return "";
  if (maxChars === 1) return "…";
  return `${trimmed.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
}

export function generatePost(
  item: FeedItem,
  persona: Persona,
  maxChars = 280,
  options: PostOptions = {},
): string {
  const rules = normalizeRules(options.rules);
  const base = formatBase(item.title, persona, options.template);
  const head = [rules.prepend, base].filter(Boolean).join(" ").trim();
  const tail = [rules.append, rules.hashtags].filter(Boolean).join(" ").trim();

  const url = applyUtmToUrl(item.url, rules.utm);
  let urlSuffix = "";

  if (url) {
    const { separator, label, joiner } = getUrlFormat(options.channel);
    const labelText = label ? `${label}${joiner}` : "";
    const prefix = `${separator}${labelText}`;
    const full = `${prefix}${url}`;
    if (full.length <= maxChars) {
      urlSuffix = full;
    } else {
      const allowedUrlChars = Math.max(0, maxChars - prefix.length);
      if (allowedUrlChars > 0) {
        urlSuffix = `${prefix}${truncateMiddle(url, allowedUrlChars)}`;
      }
    }
  }

  const remainingAfterUrl = Math.max(0, maxChars - urlSuffix.length);
  let tailSuffix = "";
  if (tail && remainingAfterUrl > 1) {
    const allowedTailChars = remainingAfterUrl - 1;
    const trimmedTail =
      tail.length <= allowedTailChars
        ? tail
        : trimWithEllipsis(tail, allowedTailChars);
    tailSuffix = trimmedTail ? ` ${trimmedTail}` : "";
  }

  const availableForHead = Math.max(
    0,
    maxChars - urlSuffix.length - tailSuffix.length,
  );
  const trimmedHead =
    head.length <= availableForHead
      ? head
      : availableForHead <= 0
        ? ""
        : trimWithEllipsis(head, availableForHead);

  return `${trimmedHead}${tailSuffix}${urlSuffix}`.trim();
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
