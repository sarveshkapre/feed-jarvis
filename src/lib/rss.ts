import { XMLParser } from "fast-xml-parser";
import type { FeedItem } from "./posts.js";

type UnknownRecord = Record<string, unknown>;

export function parseFeedXml(xml: string, maxItems = 20): FeedItem[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });

  const parsed = parser.parse(xml) as UnknownRecord;
  const items = parseRss2(parsed) ?? parseAtom(parsed) ?? [];

  return items
    .map((item) => ({
      title: item.title.trim(),
      url: item.url.trim(),
    }))
    .filter((item) => item.title.length > 0 && item.url.length > 0)
    .slice(0, Math.max(0, maxItems));
}

type ParsedFeedItem = { title: string; url: string };

function parseRss2(root: UnknownRecord): ParsedFeedItem[] | undefined {
  const rss = getObject(root.rss);
  if (!rss) return undefined;
  const channel = getObject(rss.channel);
  if (!channel) return [];

  const rawItems = toArray(channel.item)
    .map(getObject)
    .filter(Boolean) as UnknownRecord[];
  return rawItems
    .map((item) => ({
      title: getText(item.title) ?? "",
      url: getText(item.link) ?? "",
    }))
    .filter((i) => i.title.trim().length > 0 && i.url.trim().length > 0);
}

function parseAtom(root: UnknownRecord): ParsedFeedItem[] | undefined {
  const feed = getObject(root.feed);
  if (!feed) return undefined;

  const entries = toArray(feed.entry)
    .map(getObject)
    .filter(Boolean) as UnknownRecord[];
  return entries
    .map((entry) => {
      const title = getText(entry.title) ?? "";
      const url = pickAtomLink(entry.link);
      return { title, url };
    })
    .filter((i) => i.title.trim().length > 0 && i.url.trim().length > 0);
}

function pickAtomLink(raw: unknown): string {
  const links = toArray(raw)
    .map((v) => (typeof v === "string" ? { "@_href": v } : getObject(v)))
    .filter(Boolean) as UnknownRecord[];

  const candidates = links
    .map((link) => ({
      href: getText(link["@_href"]) ?? getText(link.href) ?? "",
      rel: getText(link["@_rel"]) ?? getText(link.rel) ?? "",
      type: getText(link["@_type"]) ?? getText(link.type) ?? "",
    }))
    .filter((c) => c.href.trim().length > 0);

  const alternate = candidates.find(
    (c) => c.rel === "alternate" && (c.type === "" || c.type === "text/html"),
  );
  if (alternate) return alternate.href;

  const anyAlternate = candidates.find((c) => c.rel === "alternate");
  if (anyAlternate) return anyAlternate.href;

  return candidates[0]?.href ?? "";
}

function getObject(value: unknown): UnknownRecord | undefined {
  if (!value || typeof value !== "object") return undefined;
  return value as UnknownRecord;
}

function getText(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  const obj = getObject(value);
  if (!obj) return undefined;

  const text = obj["#text"];
  if (typeof text === "string") return text;
  return undefined;
}

function toArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return [];
  return [value];
}
