function escapeCsv(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export function buildDraftRows({ generatedMeta, posts, generatedItems }) {
  if (!generatedMeta || typeof generatedMeta !== "object") return [];

  const safePosts = Array.isArray(posts) ? posts : [];
  const safeItems = Array.isArray(generatedItems) ? generatedItems : [];
  const max = Math.min(safePosts.length, safeItems.length);
  const rows = [];
  const rules =
    generatedMeta.rules && typeof generatedMeta.rules === "object"
      ? generatedMeta.rules
      : {};
  const utm = rules.utm && typeof rules.utm === "object" ? rules.utm : {};

  for (let i = 0; i < max; i++) {
    const item = safeItems[i] ?? {};
    rows.push({
      channel: generatedMeta.channel ?? "",
      mode: generatedMeta.mode ?? "template",
      llmModel: generatedMeta.llmModel ?? "",
      template: generatedMeta.template ?? "",
      personaName: generatedMeta.persona?.name ?? "",
      personaPrefix: generatedMeta.persona?.prefix ?? "",
      rulePrepend: rules.prepend ?? "",
      ruleAppend: rules.append ?? "",
      ruleHashtags: rules.hashtags ?? "",
      utmSource: utm.source ?? "",
      utmMedium: utm.medium ?? "",
      utmCampaign: utm.campaign ?? "",
      title: item.title ?? "",
      url: item.url ?? "",
      post: safePosts[i] ?? "",
    });
  }

  return rows;
}

export function toDraftsJsonl(rows) {
  const safeRows = Array.isArray(rows) ? rows : [];
  return `${safeRows.map((row) => JSON.stringify(row)).join("\n")}\n`;
}

export function toDraftsCsv(rows) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const header = [
    "channel",
    "mode",
    "llm_model",
    "template",
    "persona_name",
    "persona_prefix",
    "rule_prepend",
    "rule_append",
    "rule_hashtags",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "title",
    "url",
    "post",
  ].join(",");

  const lines = safeRows.map((row) => {
    return [
      escapeCsv(row.channel),
      escapeCsv(row.mode),
      escapeCsv(row.llmModel),
      escapeCsv(row.template),
      escapeCsv(row.personaName),
      escapeCsv(row.personaPrefix),
      escapeCsv(row.rulePrepend),
      escapeCsv(row.ruleAppend),
      escapeCsv(row.ruleHashtags),
      escapeCsv(row.utmSource),
      escapeCsv(row.utmMedium),
      escapeCsv(row.utmCampaign),
      escapeCsv(row.title),
      escapeCsv(row.url),
      escapeCsv(row.post),
    ].join(",");
  });

  return `${[header, ...lines].join("\n")}\n`;
}

export function toAgentFeedJson(meta, feed) {
  const safeFeed = Array.isArray(feed) ? feed : [];
  const safeMeta = meta && typeof meta === "object" ? meta : {};
  return `${JSON.stringify({ meta: safeMeta, feed: safeFeed }, null, 2)}\n`;
}

export function copyText(clipboard, text) {
  if (!clipboard || typeof clipboard.writeText !== "function") {
    return Promise.reject(new Error("Clipboard is unavailable."));
  }
  return clipboard.writeText(String(text ?? ""));
}

export function downloadFile(documentRef, urlRef, filename, content) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = urlRef.createObjectURL(blob);
  const link = documentRef.createElement("a");
  link.href = url;
  link.download = filename;
  documentRef.body.appendChild(link);
  link.click();
  documentRef.body.removeChild(link);
  urlRef.revokeObjectURL(url);
}
