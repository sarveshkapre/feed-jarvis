import { describe, expect, it } from "vitest";
import { getPersona } from "../src/lib/personas.js";
import { generatePost } from "../src/lib/posts.js";

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

  it("supports channel formatting with labeled urls", () => {
    const persona = getPersona("Analyst");
    const post = generatePost(
      { title: "New release notes", url: "https://example.com/release" },
      persona,
      280,
      { channel: "linkedin" },
    );

    expect(post.includes("Read more:")).toBe(true);
    expect(post.includes("\n")).toBe(true);
  });

  it("supports optional text rules and still honors maxChars", () => {
    const persona = getPersona("Analyst");
    const post = generatePost(
      {
        title: "A very long title ".repeat(50),
        url: "https://example.com/abc",
      },
      persona,
      120,
      {
        rules: {
          prepend: "New:",
          append: "Share with your team.",
          hashtags: "ai,AI,#Product",
        },
      },
    );

    expect(post.includes("New:")).toBe(true);
    expect(post.includes("Share with your team.")).toBe(true);
    expect(post.includes("#ai")).toBe(true);
    expect(post.includes("#Product")).toBe(true);
    expect(post.length).toBeLessThanOrEqual(120);
  });

  it("applies UTM tags to urls when configured", () => {
    const persona = getPersona("Analyst");
    const post = generatePost(
      { title: "Release notes", url: "https://example.com/r1" },
      persona,
      280,
      { rules: { utm: { source: "feed-jarvis", medium: "social" } } },
    );

    expect(post.includes("utm_source=feed-jarvis")).toBe(true);
    expect(post.includes("utm_medium=social")).toBe(true);
  });
});
