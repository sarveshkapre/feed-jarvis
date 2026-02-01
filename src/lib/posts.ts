export type FeedItem = {
  title: string;
  url: string;
};

export type Persona = {
  name: string;
  prefix: string;
};

export const DEFAULT_PERSONAS: Persona[] = [
  { name: "Analyst", prefix: "Analysis:" },
  { name: "Builder", prefix: "Build note:" },
];

export function getPersona(name: string): Persona {
  const found = DEFAULT_PERSONAS.find(
    (p) => p.name.toLowerCase() === name.toLowerCase(),
  );
  return found ?? { name, prefix: `${name}:` };
}

export function generatePost(
  item: FeedItem,
  persona: Persona,
  maxChars = 280,
): string {
  const base = `${persona.prefix} ${item.title}`.trim();

  const url = item.url.trim();
  let suffix = url ? ` ${url}` : "";

  if (suffix.length > maxChars) {
    const allowedUrlChars = Math.max(0, maxChars - 1);
    suffix =
      allowedUrlChars > 0 ? ` ${truncateMiddle(url, allowedUrlChars)}` : "";
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
): string[] {
  return items.map((item) => generatePost(item, persona, maxChars));
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
