import { describe, expect, test } from "vitest";
import { parseFilterTokens, removeFilterToken } from "../web/filterTokens.js";

describe("filterTokens", () => {
  test("parses include/exclude tokens with dedupe", () => {
    expect(
      parseFilterTokens({
        include: "launch, release, Launch",
        exclude: "hiring\npodcast, hiring",
      }),
    ).toEqual({
      include: ["launch", "release"],
      exclude: ["hiring", "podcast"],
    });
  });

  test("removes a matching token case-insensitively", () => {
    expect(removeFilterToken("launch, release, podcast", "Release")).toBe(
      "launch, podcast",
    );
    expect(
      removeFilterToken("site:example.com, hiring", "site:example.com"),
    ).toBe("hiring");
  });

  test("handles empty and invalid inputs safely", () => {
    expect(removeFilterToken("", "x")).toBe("");
    expect(removeFilterToken(null, "x")).toBe("");
    expect(parseFilterTokens(null)).toEqual({ include: [], exclude: [] });
  });
});
