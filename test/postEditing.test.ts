import { describe, expect, test } from "vitest";
import { getPostLengthStatus, trimPostToMaxChars } from "../web/postEditing.js";

describe("postEditing", () => {
  test("reports post-length status with over-limit values", () => {
    expect(getPostLengthStatus("hello", 10)).toEqual({
      length: 5,
      maxChars: 10,
      overBy: 0,
      isOver: false,
    });

    expect(getPostLengthStatus("123456", 5)).toEqual({
      length: 6,
      maxChars: 5,
      overBy: 1,
      isOver: true,
    });
  });

  test("trims long posts near word boundaries when possible", () => {
    const text = "Alpha beta gamma delta epsilon zeta eta theta";
    const trimmed = trimPostToMaxChars(text, 24);
    expect(trimmed.length).toBeLessThanOrEqual(24);
    expect(trimmed).toBe("Alpha beta gamma delta");
  });

  test("falls back to hard cutoff for long unbroken text", () => {
    const trimmed = trimPostToMaxChars("abcdefghij", 6);
    expect(trimmed).toBe("abcdef");
  });

  test("normalizes whitespace during trim", () => {
    const trimmed = trimPostToMaxChars("Alpha   beta\n\n gamma   delta", 16);
    expect(trimmed.length).toBeLessThanOrEqual(16);
    expect(trimmed).toBe("Alpha beta gamma");
  });
});
