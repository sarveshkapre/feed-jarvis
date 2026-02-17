import { describe, expect, test } from "vitest";
import { filterAgentFeedByPersonaName } from "../web/agentFeedSearch.js";

const feed = [
  { personaName: "Macro Hawk", post: "Rates likely hold." },
  { personaName: "AI Builder", post: "New agent stack shipped." },
  { personaName: "News Wire", post: "Top stories in 60s." },
  { personaName: "AI Researcher", post: "Benchmarks moved this week." },
];

describe("agentFeedSearch", () => {
  test("returns original feed when query is empty", () => {
    expect(filterAgentFeedByPersonaName(feed, "")).toEqual(feed);
    expect(filterAgentFeedByPersonaName(feed, "   ")).toEqual(feed);
  });

  test("filters by persona name terms", () => {
    expect(filterAgentFeedByPersonaName(feed, "ai")).toEqual([
      feed[1],
      feed[3],
    ]);
    expect(filterAgentFeedByPersonaName(feed, "macro hawk")).toEqual([feed[0]]);
    expect(filterAgentFeedByPersonaName(feed, "wire")).toEqual([feed[2]]);
  });

  test("handles invalid inputs safely", () => {
    expect(filterAgentFeedByPersonaName(null, "ai")).toEqual([]);
    expect(filterAgentFeedByPersonaName(feed, null)).toEqual(feed);
  });
});
