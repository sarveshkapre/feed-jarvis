import { describe, expect, it } from "vitest";
import { generatePostsWithLlm } from "../src/lib/llm.js";
import type { Persona } from "../src/lib/personas.js";

const persona: Persona = {
  name: "Macro Hawk",
  prefix: "Macro Hawk:",
  style: "skeptical",
  voice: "blunt",
  prompt: "Keep it high-signal.",
};

describe("llm generation", () => {
  it("generates posts and composes rules/url consistently", async () => {
    const fetchFn: typeof fetch = async () => {
      return new Response(
        JSON.stringify({
          output: [
            {
              type: "message",
              content: [
                {
                  type: "output_text",
                  text: "Rates look softer this week (confidence: 82/100) https://example.com/r1",
                },
              ],
            },
          ],
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      );
    };

    const posts = await generatePostsWithLlm(
      [{ title: "Rates are changing", url: "https://example.com/r1" }],
      persona,
      {
        apiKey: "test-key",
        model: "gpt-4.1-mini",
        maxChars: 220,
        channel: "x",
        template: "straight",
        fetchFn,
        rules: {
          prepend: "New:",
          hashtags: "macro,#Rates",
        },
      },
    );

    expect(posts).toHaveLength(1);
    expect(posts[0]).toMatch(/New:/);
    expect(posts[0]).toMatch(/#macro/i);
    expect(posts[0]).toMatch(/\(confidence:\s*\d{2}\/100\)/i);
    expect(posts[0]?.match(/https:\/\/example\.com\/r1/g)?.length).toBe(1);
  });

  it("surfaces API failures with a readable error", async () => {
    const fetchFn: typeof fetch = async () => {
      return new Response(
        JSON.stringify({ error: { message: "Model overloaded" } }),
        {
          status: 429,
          headers: { "content-type": "application/json" },
        },
      );
    };

    await expect(
      generatePostsWithLlm(
        [{ title: "Rates are changing", url: "https://example.com/r1" }],
        persona,
        {
          apiKey: "test-key",
          model: "gpt-4.1-mini",
          maxChars: 220,
          channel: "x",
          template: "straight",
          fetchFn,
        },
      ),
    ).rejects.toThrow(/Model overloaded/);
  });
});
