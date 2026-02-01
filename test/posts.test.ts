import { describe, expect, it } from "vitest";
import { generatePost, getPersona } from "../src/lib/posts.js";

describe("generatePost", () => {
  it("includes the url and stays within 280 chars", () => {
    const persona = getPersona("Analyst");
    const post = generatePost(
      {
        title: "A very long title ".repeat(50),
        url: "https://example.com/abc",
      },
      persona,
    );

    expect(post.includes("https://example.com/abc")).toBe(true);
    expect(post.length).toBeLessThanOrEqual(280);
  });

  it("never exceeds max chars even with an extremely long url", () => {
    const persona = getPersona("Analyst");
    const post = generatePost(
      {
        title: "Short title",
        url: `https://example.com/${"a".repeat(500)}`,
      },
      persona,
      64,
    );

    expect(post.length).toBeLessThanOrEqual(64);
    expect(post.includes("example.com")).toBe(true);
    expect(post.includes("…")).toBe(true);
  });
});
