import { applyItemFilters, normalizeItemFilters } from "./filters.js";
import {
  formatFetchSummary,
  getMaxCharsForChannel,
  parseChannelMaxChars,
  serializeChannelMaxChars,
  setMaxCharsForChannel,
} from "./studioPrefs.js";

const STUDIO_SESSION_KEY = "feed-jarvis-studio:v1";
const STUDIO_PERSONAS_KEY = "feed-jarvis-personas:v1";
const STUDIO_CHANNEL_MAXCHARS_KEY = "feed-jarvis-studio:channel-maxchars:v1";

const state = {
  items: [],
  filteredItems: [],
  posts: [],
  generatedItems: [],
  generatedMeta: null,
  personasBase: [],
  personasOverrides: [],
  personas: [],
  channel: "x",
  template: "straight",
  restoredPersonaName: "",
  filters: normalizeItemFilters(),
  channelMaxCharsByChannel: {},
};

const elements = {
  sourceButtons: Array.from(document.querySelectorAll("button[data-source]")),
  feedPanel: document.querySelector("[data-panel='feed']"),
  jsonPanel: document.querySelector("[data-panel='json']"),
  feedUrls: document.getElementById("feedUrls"),
  maxItems: document.getElementById("maxItems"),
  dedupe: document.getElementById("dedupe"),
  fetchBtn: document.getElementById("fetchBtn"),
  loadJsonBtn: document.getElementById("loadJsonBtn"),
  jsonItems: document.getElementById("jsonItems"),
  itemsStatus: document.getElementById("itemsStatus"),
  jsonStatus: document.getElementById("jsonStatus"),
  filterInclude: document.getElementById("filterInclude"),
  filterExclude: document.getElementById("filterExclude"),
  filterMinTitleLength: document.getElementById("filterMinTitleLength"),
  filterStatus: document.getElementById("filterStatus"),
  itemsList: document.getElementById("itemsList"),
  itemsEmpty: document.getElementById("itemsEmpty"),
  personaSelect: document.getElementById("personaSelect"),
  personasFile: document.getElementById("personasFile"),
  importPersonasBtn: document.getElementById("importPersonasBtn"),
  exportPersonasBtn: document.getElementById("exportPersonasBtn"),
  clearPersonasBtn: document.getElementById("clearPersonasBtn"),
  personasStatus: document.getElementById("personasStatus"),
  customPersonaToggle: document.getElementById("customPersonaToggle"),
  customPersonaFields: document.getElementById("customPersonaFields"),
  customPersonaName: document.getElementById("customPersonaName"),
  customPersonaPrefix: document.getElementById("customPersonaPrefix"),
  personaCards: document.getElementById("personaCards"),
  channelButtons: Array.from(
    document.querySelectorAll("#channelToggle button"),
  ),
  templateSelect: document.getElementById("templateSelect"),
  maxChars: document.getElementById("maxChars"),
  rulePrepend: document.getElementById("rulePrepend"),
  ruleAppend: document.getElementById("ruleAppend"),
  ruleHashtags: document.getElementById("ruleHashtags"),
  utmToggle: document.getElementById("utmToggle"),
  utmFields: document.getElementById("utmFields"),
  utmSource: document.getElementById("utmSource"),
  utmMedium: document.getElementById("utmMedium"),
  utmCampaign: document.getElementById("utmCampaign"),
  generateBtn: document.getElementById("generateBtn"),
  postsStatus: document.getElementById("postsStatus"),
  postsList: document.getElementById("postsList"),
  postsEmpty: document.getElementById("postsEmpty"),
  copyAllBtn: document.getElementById("copyAllBtn"),
  downloadTxtBtn: document.getElementById("downloadTxtBtn"),
  downloadJsonBtn: document.getElementById("downloadJsonBtn"),
  downloadCsvBtn: document.getElementById("downloadCsvBtn"),
};

const channelDefaults = {
  x: 280,
  linkedin: 700,
  newsletter: 900,
};

function readChannelMaxCharsByChannel() {
  try {
    const raw = window.localStorage.getItem(STUDIO_CHANNEL_MAXCHARS_KEY);
    return parseChannelMaxChars(raw);
  } catch {
    return {};
  }
}

function writeChannelMaxCharsByChannel(map) {
  try {
    window.localStorage.setItem(
      STUDIO_CHANNEL_MAXCHARS_KEY,
      serializeChannelMaxChars(map),
    );
  } catch {
    // Ignore quota/privacy mode errors.
  }
}

function setStatus(element, message, tone = "info") {
  if (!element) return;
  if (!message) {
    element.classList.remove("visible", "error");
    element.textContent = "";
    return;
  }
  element.textContent = message;
  element.classList.add("visible");
  element.classList.toggle("error", tone === "error");
}

function setButtonLoading(button, isLoading, text) {
  if (!button) return;
  button.disabled = isLoading;
  if (text) {
    button.dataset.originalText =
      button.dataset.originalText || button.textContent;
    button.textContent = isLoading ? text : button.dataset.originalText;
  }
}

function normalizeUrls(raw) {
  return raw
    .split(/\n|,/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function getErrorMessage(err, fallback) {
  if (err instanceof Error && typeof err.message === "string" && err.message) {
    return err.message;
  }
  if (typeof err === "string" && err.trim()) return err.trim();
  if (err && typeof err === "object") {
    const message = Reflect.get(err, "message");
    if (typeof message === "string" && message.trim()) return message.trim();
  }
  return fallback;
}

async function readApiPayload(res) {
  const contentType = res.headers.get("content-type") ?? "";
  const text = await res.text().catch(() => "");
  const trimmed = text.trim();
  const probablyJson =
    contentType.includes("application/json") ||
    trimmed.startsWith("{") ||
    trimmed.startsWith("[");

  if (probablyJson) {
    try {
      return { kind: "json", value: JSON.parse(text) };
    } catch {
      // Fall back to text for non-JSON payloads.
    }
  }

  return { kind: "text", value: text };
}

function getApiError(res, payload, fallback) {
  if (payload?.kind === "json") {
    const value = payload.value;
    if (value && typeof value === "object") {
      const error = Reflect.get(value, "error");
      if (typeof error === "string" && error.trim()) return error.trim();
    }
  }

  if (payload?.kind === "text") {
    const text = typeof payload.value === "string" ? payload.value.trim() : "";
    if (text) {
      const snippet = text.length > 240 ? `${text.slice(0, 240)}…` : text;
      return `${fallback}: ${snippet}`;
    }
  }

  const statusText = `${res.status} ${res.statusText}`.trim();
  return statusText ? `${fallback} (${statusText})` : fallback;
}

function getActiveSource() {
  const activeButton = elements.sourceButtons.find((button) =>
    button.classList.contains("active"),
  );
  return activeButton?.dataset.source === "json" ? "json" : "feed";
}

function currentFilters() {
  return normalizeItemFilters({
    include: elements.filterInclude?.value ?? "",
    exclude: elements.filterExclude?.value ?? "",
    minTitleLength: elements.filterMinTitleLength?.value ?? 0,
  });
}

function currentRules() {
  const prepend = elements.rulePrepend?.value?.trim?.() ?? "";
  const append = elements.ruleAppend?.value?.trim?.() ?? "";
  const hashtags = elements.ruleHashtags?.value?.trim?.() ?? "";

  const utmEnabled = Boolean(elements.utmToggle?.checked);
  const source = utmEnabled ? (elements.utmSource?.value?.trim?.() ?? "") : "";
  const medium = utmEnabled ? (elements.utmMedium?.value?.trim?.() ?? "") : "";
  const campaign = utmEnabled
    ? (elements.utmCampaign?.value?.trim?.() ?? "")
    : "";

  const utm =
    source || medium || campaign
      ? {
          source: source || undefined,
          medium: medium || undefined,
          campaign: campaign || undefined,
        }
      : undefined;

  if (!prepend && !append && !hashtags && !utm) return undefined;
  return {
    prepend: prepend || undefined,
    append: append || undefined,
    hashtags: hashtags || undefined,
    utm,
  };
}

function refreshFilteredItems({ updateStatus = true } = {}) {
  state.filters = currentFilters();
  state.filteredItems = applyItemFilters(state.items, state.filters);
  updateItemsPreview();
  if (updateStatus) updateFilterStatus();
}

function setSource(source, { persist = true } = {}) {
  const nextSource = source === "json" ? "json" : "feed";
  elements.sourceButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.source === nextSource);
  });
  elements.feedPanel.hidden = nextSource !== "feed";
  elements.jsonPanel.hidden = nextSource !== "json";

  if (persist) {
    persistSessionSnapshot();
  }
}

function setChannel(channel, { syncMaxChars = true, persist = true } = {}) {
  if (!channelDefaults[channel]) return;
  state.channel = channel;
  elements.channelButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.channel === channel);
  });
  if (syncMaxChars) {
    elements.maxChars.value = String(
      getMaxCharsForChannel(
        channel,
        state.channelMaxCharsByChannel,
        channelDefaults,
      ),
    );
  }

  if (persist) {
    persistSessionSnapshot();
  }
}

function readSessionSnapshot() {
  try {
    const raw = window.localStorage.getItem(STUDIO_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function persistSessionSnapshot() {
  const snapshot = {
    source: getActiveSource(),
    feedUrls: elements.feedUrls.value,
    maxItems: elements.maxItems.value,
    dedupe: elements.dedupe.checked,
    jsonItems: elements.jsonItems.value,
    filterInclude: elements.filterInclude.value,
    filterExclude: elements.filterExclude.value,
    filterMinTitleLength: elements.filterMinTitleLength.value,
    personaName: elements.personaSelect.value,
    useCustomPersona: elements.customPersonaToggle.checked,
    customPersonaName: elements.customPersonaName.value,
    customPersonaPrefix: elements.customPersonaPrefix.value,
    channel: state.channel,
    template: elements.templateSelect.value,
    maxChars: elements.maxChars.value,
    rulePrepend: elements.rulePrepend.value,
    ruleAppend: elements.ruleAppend.value,
    ruleHashtags: elements.ruleHashtags.value,
    utmEnabled: elements.utmToggle.checked,
    utmSource: elements.utmSource.value,
    utmMedium: elements.utmMedium.value,
    utmCampaign: elements.utmCampaign.value,
  };

  try {
    window.localStorage.setItem(STUDIO_SESSION_KEY, JSON.stringify(snapshot));
  } catch {
    // Ignore quota/privacy mode errors.
  }
}

function restoreSessionSnapshot() {
  const snapshot = readSessionSnapshot();
  if (!snapshot) {
    setSource("feed", { persist: false });
    setChannel("x", { persist: false });
    return;
  }

  if (typeof snapshot.feedUrls === "string") {
    elements.feedUrls.value = snapshot.feedUrls;
  }
  if (typeof snapshot.maxItems === "string") {
    elements.maxItems.value = snapshot.maxItems;
  }
  if (typeof snapshot.dedupe === "boolean") {
    elements.dedupe.checked = snapshot.dedupe;
  }
  if (typeof snapshot.jsonItems === "string") {
    elements.jsonItems.value = snapshot.jsonItems;
  }
  if (typeof snapshot.filterInclude === "string") {
    elements.filterInclude.value = snapshot.filterInclude;
  }
  if (typeof snapshot.filterExclude === "string") {
    elements.filterExclude.value = snapshot.filterExclude;
  }
  if (typeof snapshot.filterMinTitleLength === "string") {
    elements.filterMinTitleLength.value = snapshot.filterMinTitleLength;
  }
  if (typeof snapshot.template === "string") {
    elements.templateSelect.value = snapshot.template;
  }
  if (typeof snapshot.rulePrepend === "string") {
    elements.rulePrepend.value = snapshot.rulePrepend;
  }
  if (typeof snapshot.ruleAppend === "string") {
    elements.ruleAppend.value = snapshot.ruleAppend;
  }
  if (typeof snapshot.ruleHashtags === "string") {
    elements.ruleHashtags.value = snapshot.ruleHashtags;
  }
  if (typeof snapshot.utmEnabled === "boolean") {
    elements.utmToggle.checked = snapshot.utmEnabled;
  }
  if (typeof snapshot.utmSource === "string") {
    elements.utmSource.value = snapshot.utmSource;
  }
  if (typeof snapshot.utmMedium === "string") {
    elements.utmMedium.value = snapshot.utmMedium;
  }
  if (typeof snapshot.utmCampaign === "string") {
    elements.utmCampaign.value = snapshot.utmCampaign;
  }

  setSource(snapshot.source, { persist: false });
  setChannel(snapshot.channel, { persist: false });

  if (typeof snapshot.maxChars === "string" && snapshot.maxChars.trim()) {
    elements.maxChars.value = snapshot.maxChars;
    state.channelMaxCharsByChannel = setMaxCharsForChannel(
      state.channelMaxCharsByChannel,
      state.channel,
      snapshot.maxChars,
    );
    writeChannelMaxCharsByChannel(state.channelMaxCharsByChannel);
  }

  if (typeof snapshot.personaName === "string") {
    state.restoredPersonaName = snapshot.personaName;
  }
  if (typeof snapshot.useCustomPersona === "boolean") {
    elements.customPersonaToggle.checked = snapshot.useCustomPersona;
  }
  if (typeof snapshot.customPersonaName === "string") {
    elements.customPersonaName.value = snapshot.customPersonaName;
  }
  if (typeof snapshot.customPersonaPrefix === "string") {
    elements.customPersonaPrefix.value = snapshot.customPersonaPrefix;
  }

  elements.customPersonaFields.hidden = !elements.customPersonaToggle.checked;
  elements.utmFields.hidden = !elements.utmToggle.checked;
}

function updateFilterStatus() {
  if (state.items.length === 0) {
    setStatus(elements.filterStatus, "");
    return;
  }

  const { include, exclude, minTitleLength } = state.filters;
  const active =
    Boolean(include.trim()) ||
    Boolean(exclude.trim()) ||
    (minTitleLength ?? 0) > 0;
  if (!active) {
    setStatus(elements.filterStatus, "");
    return;
  }

  const filtered = state.filteredItems.length;
  const total = state.items.length;
  setStatus(
    elements.filterStatus,
    `Filters: ${filtered} of ${total} item(s) match.`,
  );
}

function updateItemsPreview() {
  elements.itemsList.innerHTML = "";
  if (state.items.length === 0) {
    elements.itemsEmpty.textContent =
      "No items yet. Add a feed to see results.";
    elements.itemsEmpty.style.display = "block";
    updateFilterStatus();
    return;
  }

  if (state.filteredItems.length === 0) {
    elements.itemsEmpty.textContent =
      "No items match your filters. Adjust the filter inputs to continue.";
    elements.itemsEmpty.style.display = "block";
    updateFilterStatus();
    return;
  }

  elements.itemsEmpty.style.display = "none";
  const previewItems = state.filteredItems.slice(0, 8);
  for (const item of previewItems) {
    const li = document.createElement("li");
    li.textContent = item.title;
    elements.itemsList.appendChild(li);
  }
  if (state.filteredItems.length > previewItems.length) {
    const li = document.createElement("li");
    li.textContent = `+${state.filteredItems.length - previewItems.length} more items loaded`;
    elements.itemsList.appendChild(li);
  }

  if (state.filteredItems.length !== state.items.length) {
    const li = document.createElement("li");
    li.textContent = `Showing ${state.filteredItems.length} of ${state.items.length} item(s) after filters`;
    elements.itemsList.appendChild(li);
  }

  updateFilterStatus();
}

function updatePersonaCards() {
  elements.personaCards.innerHTML = "";
  const featured = state.personas.slice(0, 4);
  for (const persona of featured) {
    const card = document.createElement("div");
    card.className = "persona-card";

    const name = document.createElement("strong");
    name.textContent = persona.name;

    const prefix = document.createElement("span");
    prefix.textContent = persona.prefix;

    card.appendChild(name);
    card.appendChild(prefix);
    elements.personaCards.appendChild(card);
  }
}

function updatePostsPreview() {
  elements.postsList.innerHTML = "";
  if (state.posts.length === 0) {
    elements.postsEmpty.style.display = "block";
    elements.copyAllBtn.disabled = true;
    elements.downloadTxtBtn.disabled = true;
    elements.downloadJsonBtn.disabled = true;
    elements.downloadCsvBtn.disabled = true;
    return;
  }
  elements.postsEmpty.style.display = "none";
  elements.copyAllBtn.disabled = false;
  elements.downloadTxtBtn.disabled = false;
  elements.downloadJsonBtn.disabled = false;
  elements.downloadCsvBtn.disabled = false;

  state.posts.forEach((post, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "post-card";

    const item = state.generatedItems[index];
    if (item && typeof item === "object") {
      const source = document.createElement("div");
      source.className = "post-source";

      const title = document.createElement("div");
      title.className = "post-source-title";
      title.textContent = typeof item.title === "string" ? item.title : "";

      const rawUrl = typeof item.url === "string" ? item.url : "";
      const parsed = rawUrl ? safeHttpUrl(rawUrl) : null;
      if (parsed) {
        const link = document.createElement("a");
        link.className = "post-source-link";
        link.href = parsed.toString();
        link.target = "_blank";
        link.rel = "noreferrer noopener";
        link.textContent = parsed.hostname;
        source.appendChild(title);
        source.appendChild(link);
      } else {
        source.appendChild(title);
      }

      wrapper.appendChild(source);
    }

    const textarea = document.createElement("textarea");
    textarea.value = post;
    textarea.dataset.index = String(index);

    const meta = document.createElement("div");
    meta.className = "post-meta";

    const length = document.createElement("span");
    length.textContent = `${post.length} chars`;
    length.className = "tag";

    const copyBtn = document.createElement("button");
    copyBtn.className = "secondary";
    copyBtn.type = "button";
    copyBtn.textContent = "Copy";
    copyBtn.addEventListener("click", () => copyText(textarea.value));

    meta.appendChild(length);
    meta.appendChild(copyBtn);

    textarea.addEventListener("input", () => {
      length.textContent = `${textarea.value.length} chars`;
      state.posts[index] = textarea.value;
    });

    wrapper.appendChild(textarea);
    wrapper.appendChild(meta);
    elements.postsList.appendChild(wrapper);
  });
}

function copyText(text) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(
    () => setStatus(elements.postsStatus, "Copied to clipboard."),
    () =>
      setStatus(
        elements.postsStatus,
        "Copy failed. Select the text manually.",
        "error",
      ),
  );
}

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function safeHttpUrl(raw) {
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:")
      return null;
    return parsed;
  } catch {
    return null;
  }
}

function resetDrafts() {
  state.posts = [];
  state.generatedItems = [];
  state.generatedMeta = null;
  updatePostsPreview();
  setStatus(elements.postsStatus, "");
}

function escapeCsv(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function buildDraftRows() {
  if (!state.generatedMeta) return [];
  const max = Math.min(state.posts.length, state.generatedItems.length);
  const rows = [];
  const rules = state.generatedMeta.rules ?? {};
  const utm = rules.utm ?? {};

  for (let i = 0; i < max; i++) {
    const item = state.generatedItems[i] ?? {};
    rows.push({
      channel: state.generatedMeta.channel,
      template: state.generatedMeta.template,
      personaName: state.generatedMeta.persona?.name ?? "",
      personaPrefix: state.generatedMeta.persona?.prefix ?? "",
      rulePrepend: rules.prepend ?? "",
      ruleAppend: rules.append ?? "",
      ruleHashtags: rules.hashtags ?? "",
      utmSource: utm.source ?? "",
      utmMedium: utm.medium ?? "",
      utmCampaign: utm.campaign ?? "",
      title: item.title ?? "",
      url: item.url ?? "",
      post: state.posts[i] ?? "",
    });
  }

  return rows;
}

function toDraftsJsonl() {
  const rows = buildDraftRows();
  return `${rows.map((row) => JSON.stringify(row)).join("\n")}\n`;
}

function toDraftsCsv() {
  const rows = buildDraftRows();
  const header = [
    "channel",
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

  const lines = rows.map((row) => {
    return [
      escapeCsv(row.channel),
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

function mergePersonas(base, overrides) {
  const merged = base.map((p) => ({ ...p }));

  for (const override of overrides) {
    const needle =
      override &&
      typeof override === "object" &&
      typeof override.name === "string"
        ? override.name.toLowerCase()
        : "";
    if (!needle) continue;

    const index = merged.findIndex((p) => p.name.toLowerCase() === needle);
    if (index === -1) {
      merged.push({ ...override });
    } else {
      merged[index] = { ...override };
    }
  }

  return merged;
}

function parsePersonasJson(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Invalid JSON: ${String(err)}`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Expected a JSON array of personas.");
  }

  const personas = [];
  for (let i = 0; i < parsed.length; i++) {
    const value = parsed[i];
    if (!value || typeof value !== "object") {
      throw new Error(`Invalid persona at index ${i}: expected an object.`);
    }

    const name = Reflect.get(value, "name");
    const prefix = Reflect.get(value, "prefix");
    if (typeof name !== "string" || typeof prefix !== "string") {
      throw new Error(
        `Invalid persona at index ${i}: expected string 'name' and 'prefix'.`,
      );
    }
    if (name.trim().length === 0 || prefix.trim().length === 0) {
      throw new Error(
        `Invalid persona at index ${i}: 'name' and 'prefix' must be non-empty.`,
      );
    }

    personas.push({ name: name.trim(), prefix: prefix.trim() });
  }

  return personas;
}

function readPersonasOverrides() {
  try {
    const raw = window.localStorage.getItem(STUDIO_PERSONAS_KEY);
    if (!raw) return [];
    return parsePersonasJson(raw);
  } catch {
    return [];
  }
}

function writePersonasOverrides(personas) {
  try {
    window.localStorage.setItem(STUDIO_PERSONAS_KEY, JSON.stringify(personas));
  } catch {
    // Ignore quota/privacy mode errors.
  }
}

function clearPersonasOverrides() {
  try {
    window.localStorage.removeItem(STUDIO_PERSONAS_KEY);
  } catch {
    // Ignore quota/privacy mode errors.
  }
}

function renderPersonas() {
  elements.personaSelect.innerHTML = "";
  state.personas.forEach((persona) => {
    const option = document.createElement("option");
    option.value = persona.name;
    option.textContent = `${persona.name} · ${persona.prefix}`;
    elements.personaSelect.appendChild(option);
  });

  const restored = state.personas.find(
    (persona) => persona.name === state.restoredPersonaName,
  );
  if (restored) {
    elements.personaSelect.value = restored.name;
  } else {
    const defaultPersona = state.personas.find(
      (persona) => persona.name === "Analyst",
    );
    if (defaultPersona) {
      elements.personaSelect.value = defaultPersona.name;
    }
  }

  elements.personaSelect.disabled = elements.customPersonaToggle.checked;
  updatePersonaCards();
  persistSessionSnapshot();
}

function applyPersonas(base, overrides) {
  state.personasBase = Array.isArray(base) ? base : [];
  state.personasOverrides = Array.isArray(overrides) ? overrides : [];
  state.personas = mergePersonas(state.personasBase, state.personasOverrides);
  renderPersonas();
}

async function loadPersonas() {
  try {
    const res = await fetch("/api/personas");
    const payload = await readApiPayload(res);
    if (!res.ok) {
      throw new Error(getApiError(res, payload, "Failed to load personas"));
    }
    if (payload.kind !== "json") {
      throw new Error("Unexpected response while loading personas.");
    }
    const data = payload.value;
    const personas =
      data && typeof data === "object" ? Reflect.get(data, "personas") : [];
    const basePersonas = Array.isArray(personas) ? personas : [];
    const overrides = readPersonasOverrides();
    applyPersonas(basePersonas, overrides);
  } catch (_err) {
    setStatus(
      elements.itemsStatus,
      "Unable to load personas. Refresh to retry.",
      "error",
    );
    return;
  }
}

async function fetchItems() {
  setStatus(elements.itemsStatus, "");
  const urls = normalizeUrls(elements.feedUrls.value);
  if (urls.length === 0) {
    setStatus(elements.itemsStatus, "Add at least one feed URL.", "error");
    return;
  }

  const maxItems = Math.max(1, Number(elements.maxItems.value) || 20);
  const dedupe = elements.dedupe.checked;

  setButtonLoading(elements.fetchBtn, true, "Fetching...");

  try {
    const res = await fetch("/api/fetch", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ urls, maxItems, dedupe }),
    });

    const payload = await readApiPayload(res);
    if (!res.ok) {
      throw new Error(getApiError(res, payload, "Failed to fetch feed"));
    }
    if (payload.kind !== "json") {
      throw new Error("Unexpected response while fetching feed.");
    }
    const data = payload.value;

    const items =
      data && typeof data === "object" ? Reflect.get(data, "items") : [];
    state.items = Array.isArray(items) ? items : [];
    refreshFilteredItems();
    resetDrafts();

    const summary =
      data && typeof data === "object" ? Reflect.get(data, "summary") : null;
    setStatus(
      elements.itemsStatus,
      formatFetchSummary(summary, state.items.length, urls.length),
    );
  } catch (err) {
    setStatus(
      elements.itemsStatus,
      getErrorMessage(err, "Feed fetch failed."),
      "error",
    );
  } finally {
    setButtonLoading(elements.fetchBtn, false);
  }
}

function loadItemsFromJson() {
  setStatus(elements.jsonStatus, "");
  const raw = elements.jsonItems.value.trim();
  if (!raw) {
    setStatus(elements.jsonStatus, "Paste a JSON array to continue.", "error");
    return;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Expected a JSON array.");
    const items = parsed
      .map((item) => ({
        title: typeof item.title === "string" ? item.title.trim() : "",
        url: typeof item.url === "string" ? item.url.trim() : "",
      }))
      .filter((item) => item.title && item.url);

    if (items.length === 0) throw new Error("No valid items found.");
    state.items = items;
    refreshFilteredItems();
    resetDrafts();
    setStatus(elements.jsonStatus, `Loaded ${items.length} items.`);
  } catch (err) {
    setStatus(
      elements.jsonStatus,
      getErrorMessage(err, "Invalid JSON."),
      "error",
    );
  }
}

async function generatePosts() {
  setStatus(elements.postsStatus, "");
  if (state.items.length === 0) {
    setStatus(elements.postsStatus, "Load items first.", "error");
    return;
  }
  if (state.filteredItems.length === 0) {
    setStatus(
      elements.postsStatus,
      "No items match your filters. Adjust filters, then try again.",
      "error",
    );
    return;
  }

  const generationItems = state.filteredItems.slice();
  const maxChars = Math.max(1, Number(elements.maxChars.value) || 280);
  const useCustom = elements.customPersonaToggle.checked;
  const selectedName = elements.personaSelect.value;
  const selectedPersona = state.personas.find(
    (persona) => persona.name === selectedName,
  ) ?? {
    name: selectedName || "Custom",
    prefix: `${selectedName || "Custom"}:`,
  };
  const personaUsed = useCustom
    ? {
        name: elements.customPersonaName.value.trim() || "Custom",
        prefix: elements.customPersonaPrefix.value.trim() || "Custom:",
      }
    : selectedPersona;
  const template = elements.templateSelect.value;
  const rules = currentRules();

  const payload = {
    items: generationItems,
    maxChars,
    channel: state.channel,
    template,
    personaCustom: personaUsed,
    rules,
  };

  setButtonLoading(elements.generateBtn, true, "Generating...");

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const payloadResult = await readApiPayload(res);
    if (!res.ok) {
      throw new Error(getApiError(res, payloadResult, "Generation failed"));
    }
    if (payloadResult.kind !== "json") {
      throw new Error("Unexpected response while generating drafts.");
    }
    const data = payloadResult.value;
    const posts =
      data && typeof data === "object" ? Reflect.get(data, "posts") : [];
    state.posts = Array.isArray(posts) ? posts : [];
    const returnedItems =
      data && typeof data === "object" ? Reflect.get(data, "items") : null;
    state.generatedItems = Array.isArray(returnedItems)
      ? returnedItems
      : generationItems;
    state.generatedMeta = {
      channel: state.channel,
      template,
      persona: personaUsed,
      maxChars,
      rules,
    };
    updatePostsPreview();
    setStatus(elements.postsStatus, `Generated ${state.posts.length} drafts.`);
  } catch (err) {
    setStatus(
      elements.postsStatus,
      getErrorMessage(err, "Generation failed."),
      "error",
    );
  } finally {
    setButtonLoading(elements.generateBtn, false);
  }
}

function wireEvents() {
  elements.sourceButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setSource(button.dataset.source);
    });
  });

  elements.customPersonaToggle.addEventListener("change", () => {
    elements.customPersonaFields.hidden = !elements.customPersonaToggle.checked;
    elements.personaSelect.disabled = elements.customPersonaToggle.checked;
    persistSessionSnapshot();
  });

  elements.utmToggle.addEventListener("change", () => {
    elements.utmFields.hidden = !elements.utmToggle.checked;
    persistSessionSnapshot();
  });

  elements.importPersonasBtn.addEventListener("click", () => {
    setStatus(elements.personasStatus, "");
    elements.personasFile.click();
  });

  elements.personasFile.addEventListener("change", async () => {
    setStatus(elements.personasStatus, "");
    const file = elements.personasFile.files?.[0];
    if (!file) return;

    try {
      const raw = await file.text();
      const personas = parsePersonasJson(raw);
      writePersonasOverrides(personas);
      applyPersonas(state.personasBase, personas);
      setStatus(
        elements.personasStatus,
        `Imported ${personas.length} persona(s).`,
      );
    } catch (err) {
      setStatus(
        elements.personasStatus,
        getErrorMessage(err, "Failed to import personas."),
        "error",
      );
    } finally {
      // Allow re-importing the same file.
      elements.personasFile.value = "";
    }
  });

  elements.exportPersonasBtn.addEventListener("click", () => {
    setStatus(elements.personasStatus, "");
    downloadFile(
      "feed-jarvis-personas.json",
      `${JSON.stringify(state.personas, null, 2)}\n`,
    );
    setStatus(elements.personasStatus, "Exported personas JSON.");
  });

  elements.clearPersonasBtn.addEventListener("click", () => {
    clearPersonasOverrides();
    applyPersonas(state.personasBase, []);
    setStatus(elements.personasStatus, "Cleared imported personas.");
  });

  elements.fetchBtn.addEventListener("click", fetchItems);
  elements.loadJsonBtn.addEventListener("click", loadItemsFromJson);
  elements.generateBtn.addEventListener("click", generatePosts);

  elements.copyAllBtn.addEventListener("click", () => {
    copyText(state.posts.join("\n"));
  });

  elements.downloadTxtBtn.addEventListener("click", () => {
    downloadFile(
      `feed-jarvis-${state.channel}-posts.txt`,
      state.posts.join("\n"),
    );
  });

  elements.downloadJsonBtn.addEventListener("click", () => {
    if (!state.generatedMeta) {
      setStatus(elements.postsStatus, "Generate drafts to export.", "error");
      return;
    }
    downloadFile(`feed-jarvis-${state.channel}-drafts.jsonl`, toDraftsJsonl());
  });

  elements.downloadCsvBtn.addEventListener("click", () => {
    if (!state.generatedMeta) {
      setStatus(elements.postsStatus, "Generate drafts to export.", "error");
      return;
    }
    downloadFile(`feed-jarvis-${state.channel}-drafts.csv`, toDraftsCsv());
  });

  document.addEventListener("keydown", (event) => {
    if (!(event.ctrlKey || event.metaKey) || event.key !== "Enter") return;
    const activeSource = getActiveSource();
    if (activeSource === "feed") {
      fetchItems();
      return;
    }
    if (activeSource === "json") {
      loadItemsFromJson();
    }
  });

  elements.channelButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setChannel(button.dataset.channel);
    });
  });

  elements.maxChars.addEventListener("input", () => {
    const next = setMaxCharsForChannel(
      state.channelMaxCharsByChannel,
      state.channel,
      elements.maxChars.value,
    );
    if (next !== state.channelMaxCharsByChannel) {
      state.channelMaxCharsByChannel = next;
      writeChannelMaxCharsByChannel(next);
    }
  });

  [
    elements.feedUrls,
    elements.maxItems,
    elements.dedupe,
    elements.jsonItems,
    elements.filterInclude,
    elements.filterExclude,
    elements.filterMinTitleLength,
    elements.personaSelect,
    elements.customPersonaName,
    elements.customPersonaPrefix,
    elements.templateSelect,
    elements.maxChars,
    elements.rulePrepend,
    elements.ruleAppend,
    elements.ruleHashtags,
    elements.utmToggle,
    elements.utmSource,
    elements.utmMedium,
    elements.utmCampaign,
  ].forEach((element) => {
    const eventName =
      element.type === "checkbox" || element.tagName === "SELECT"
        ? "change"
        : "input";
    element.addEventListener(eventName, persistSessionSnapshot);
  });

  [
    elements.filterInclude,
    elements.filterExclude,
    elements.filterMinTitleLength,
  ].forEach((element) => {
    element.addEventListener("input", () => {
      refreshFilteredItems();
      persistSessionSnapshot();
    });
  });
}

state.channelMaxCharsByChannel = readChannelMaxCharsByChannel();
restoreSessionSnapshot();
wireEvents();
loadPersonas();
refreshFilteredItems({ updateStatus: false });
persistSessionSnapshot();
