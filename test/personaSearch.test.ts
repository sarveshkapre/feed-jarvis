import { describe, expect, test } from "vitest";
import { filterPersonas } from "../web/personaSearch.js";

const personas = [
  {
    name: "Macro Hawk",
    prefix: "Macro:",
    role: "economy analyst",
    topics: ["rates", "inflation"],
  },
  {
    name: "AI Builder",
    prefix: "Build:",
    style: "practical",
    topics: ["llm", "agents"],
  },
  {
    name: "City Wire",
    prefix: "Metro:",
    voice: "local beat",
    topics: ["transit", "construction"],
  },
];

describe("personaSearch", () => {
  test("returns original personas when query is empty", () => {
    expect(filterPersonas(personas, "")).toEqual(personas);
    expect(filterPersonas(personas, "   ")).toEqual(personas);
  });

  test("matches personas by name, prefix, and metadata fields", () => {
    expect(filterPersonas(personas, "macro")).toEqual([personas[0]]);
    expect(filterPersonas(personas, "build")).toEqual([personas[1]]);
    expect(filterPersonas(personas, "construction")).toEqual([personas[2]]);
    expect(filterPersonas(personas, "local beat")).toEqual([personas[2]]);
  });

  test("supports multi-term matching across fields", () => {
    expect(filterPersonas(personas, "ai agents")).toEqual([personas[1]]);
    expect(filterPersonas(personas, "macro inflation")).toEqual([personas[0]]);
    expect(filterPersonas(personas, "metro llm")).toEqual([]);
  });

  test("handles invalid inputs safely", () => {
    expect(filterPersonas(null, "ai")).toEqual([]);
    expect(filterPersonas(personas, null)).toEqual(personas);
  });
});
