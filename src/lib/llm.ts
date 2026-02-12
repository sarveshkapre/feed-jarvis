import type { Persona } from "./personas.js";
import {
  composePost,
  type FeedItem,
  type PostChannel,
  type PostRules,
  type PostTemplate,
} from "./posts.js";

const DEFAULT_LLM_MODEL = "gpt-4.1-mini";
const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_TIMEOUT_MS = 30_000;

export type LlmGenerateOptions = {
  apiKey: string;
  model?: string;
  maxChars: number;
  channel: PostChannel;
  template: PostTemplate;
  rules?: PostRules;
  fetchFn?: typeof fetch;
  apiBaseUrl?: string;
  timeoutMs?: number;
};

export async function generatePostsWithLlm(
  items: FeedItem[],
  persona: Persona,
  options: LlmGenerateOptions,
): Promise<string[]> {
  const apiKey = options.apiKey.trim();
  if (!apiKey) {
    throw new Error("Missing OpenAI API key.");
  }

  const model = options.model?.trim() || DEFAULT_LLM_MODEL;
  const fetchFn = options.fetchFn ?? fetch;
  const baseUrl = options.apiBaseUrl?.trim() || DEFAULT_OPENAI_BASE_URL;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const out: string[] = [];

  for (const item of items) {
    const bodyBudget = getBodyBudget(item, options);
    const prompt = buildPostPrompt(item, persona, bodyBudget, options.template);
    const draft = await requestSinglePost({
      apiKey,
      baseUrl,
      fetchFn,
      model,
      prompt,
      timeoutMs,
    });
    const cleanDraft = stripUrls(draft).trim() || item.title;
    out.push(
      composePost(cleanDraft, item.url, options.maxChars, {
        channel: options.channel,
        rules: options.rules,
      }),
    );
  }

  return out;
}

type SinglePostRequest = {
  apiKey: string;
  baseUrl: string;
  fetchFn: typeof fetch;
  model: string;
  prompt: string;
  timeoutMs: number;
};

async function requestSinglePost(params: SinglePostRequest): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), params.timeoutMs);
  try {
    const res = await params.fetchFn(`${params.baseUrl}/responses`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${params.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: params.model,
        input: params.prompt,
        instructions:
          "Write a single high-signal social feed post. Output only post text.",
        store: false,
        text: { format: { type: "text" } },
      }),
      signal: controller.signal,
    });

    const payload = await parseJsonResponse(res);
    if (!res.ok) {
      throw new Error(getApiError(payload, res.status));
    }

    const text = extractOutputText(payload);
    if (!text) {
      throw new Error("OpenAI returned no output text.");
    }
    return text;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("OpenAI request timed out.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

function buildPostPrompt(
  item: FeedItem,
  persona: Persona,
  bodyBudget: number,
  template: PostTemplate,
): string {
  return [
    "Task: write exactly one post for an LLM-agent feed.",
    "Style: like Twitter posts, but not limited to 140 chars.",
    "Constraints:",
    "- Output plain text only. No markdown. No quotes.",
    "- Keep it concise and high-signal.",
    `- Max ${bodyBudget} characters for the body.`,
    "- Include what changed and why it matters.",
    "- Include a confidence score like '(confidence: 78/100)'.",
    "",
    "Persona contract:",
    `- Name: ${persona.name}`,
    `- Prefix: ${persona.prefix}`,
    persona.role ? `- Role: ${persona.role}` : undefined,
    persona.style ? `- Style: ${persona.style}` : undefined,
    persona.voice ? `- Voice: ${persona.voice}` : undefined,
    persona.topics?.length
      ? `- Topics: ${persona.topics.join(", ")}`
      : undefined,
    persona.prompt ? `- Persona prompt: ${persona.prompt}` : undefined,
    "",
    "Event:",
    `- Title: ${item.title}`,
    `- Source URL: ${item.url}`,
    `- Template hint: ${template}`,
    "",
    "Return only the post body. Do not include the source URL.",
  ]
    .filter(Boolean)
    .join("\n");
}

function getBodyBudget(item: FeedItem, options: LlmGenerateOptions): number {
  const reserved = composePost("", item.url, options.maxChars, {
    channel: options.channel,
    rules: options.rules,
  }).length;
  const budget = options.maxChars - reserved;
  return Math.max(48, budget);
}

async function parseJsonResponse(res: Response): Promise<unknown> {
  const raw = await res.text().catch(() => "");
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return { error: { message: raw } };
  }
}

function getApiError(payload: unknown, status: number): string {
  if (payload && typeof payload === "object") {
    const maybeError = Reflect.get(payload, "error");
    if (maybeError && typeof maybeError === "object") {
      const message = Reflect.get(maybeError, "message");
      if (typeof message === "string" && message.trim()) return message.trim();
    }
    if (typeof maybeError === "string" && maybeError.trim()) {
      return maybeError.trim();
    }
  }
  return `OpenAI API request failed with status ${status}.`;
}

function extractOutputText(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";

  const direct = Reflect.get(payload, "output_text");
  if (typeof direct === "string" && direct.trim()) return direct.trim();

  const output = Reflect.get(payload, "output");
  if (!Array.isArray(output)) return "";

  const chunks: string[] = [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = Reflect.get(item, "content");
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (!part || typeof part !== "object") continue;
      if (Reflect.get(part, "type") !== "output_text") continue;
      const text = Reflect.get(part, "text");
      if (typeof text !== "string" || !text.trim()) continue;
      chunks.push(text.trim());
    }
  }

  return chunks.join("\n").trim();
}

function stripUrls(text: string): string {
  return text
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
