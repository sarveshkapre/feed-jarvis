import { describe, expect, it, vi } from "vitest";

import {
  buildDraftRows,
  copyText,
  downloadFile,
  toAgentFeedJson,
  toDraftsCsv,
  toDraftsJsonl,
} from "../web/studioExports.js";

describe("studioExports", () => {
  it("builds draft rows from generated metadata and items", () => {
    const rows = buildDraftRows({
      generatedMeta: {
        channel: "x",
        mode: "template",
        template: "straight",
        persona: { name: "Analyst", prefix: "Analyst:" },
        rules: {
          prepend: "Note",
          append: "Thanks",
          hashtags: "#ai",
          utm: { source: "rss", medium: "social", campaign: "daily" },
        },
      },
      posts: ["Post 1", "Post 2"],
      generatedItems: [
        { title: "Story 1", url: "https://example.com/1" },
        { title: "Story 2", url: "https://example.com/2" },
      ],
    });

    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({
      channel: "x",
      mode: "template",
      llmModel: "",
      template: "straight",
      personaName: "Analyst",
      personaPrefix: "Analyst:",
      rulePrepend: "Note",
      ruleAppend: "Thanks",
      ruleHashtags: "#ai",
      utmSource: "rss",
      utmMedium: "social",
      utmCampaign: "daily",
      title: "Story 1",
      url: "https://example.com/1",
      post: "Post 1",
    });
  });

  it("returns empty draft rows when generated metadata is missing", () => {
    const rows = buildDraftRows({
      generatedMeta: null,
      posts: ["Post 1"],
      generatedItems: [{ title: "Story 1", url: "https://example.com/1" }],
    });

    expect(rows).toEqual([]);
  });

  it("serializes rows as JSONL and CSV", () => {
    const rows = [
      {
        channel: "x",
        mode: "template",
        llmModel: "",
        template: "straight",
        personaName: "Analyst",
        personaPrefix: "Analyst:",
        rulePrepend: "",
        ruleAppend: "",
        ruleHashtags: "",
        utmSource: "",
        utmMedium: "",
        utmCampaign: "",
        title: 'Story "One"',
        url: "https://example.com/1",
        post: 'Post "One"',
      },
    ];

    expect(toDraftsJsonl(rows)).toContain('"title":"Story \\"One\\""');
    expect(toDraftsCsv(rows)).toContain('"Story ""One"""');
    expect(toDraftsCsv(rows).split("\n")[0]).toContain("llm_model");
  });

  it("serializes agent feed export payload", () => {
    const payload = toAgentFeedJson({ layout: "rotating" }, [
      { personaName: "Analyst", post: "Hi", itemTitle: "Story", itemUrl: "#" },
    ]);

    expect(payload).toContain('"layout": "rotating"');
    expect(payload).toContain('"personaName": "Analyst"');
  });

  it("copies text through provided clipboard", async () => {
    const clipboard = {
      writeText: vi.fn(async () => {}),
    };
    await copyText(clipboard, "hello");
    expect(clipboard.writeText).toHaveBeenCalledWith("hello");
  });

  it("downloads files through provided document/url refs", () => {
    const click = vi.fn();
    const appendChild = vi.fn();
    const removeChild = vi.fn();
    const createObjectURL = vi.fn(() => "blob:demo");
    const revokeObjectURL = vi.fn();
    const link = { href: "", download: "", click };
    const documentRef = {
      createElement: vi.fn(() => link),
      body: { appendChild, removeChild },
    };

    downloadFile(
      documentRef,
      { createObjectURL, revokeObjectURL },
      "demo.txt",
      "demo",
    );

    expect(documentRef.createElement).toHaveBeenCalledWith("a");
    expect(link.download).toBe("demo.txt");
    expect(appendChild).toHaveBeenCalledWith(link);
    expect(click).toHaveBeenCalledTimes(1);
    expect(removeChild).toHaveBeenCalledWith(link);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:demo");
  });
});
