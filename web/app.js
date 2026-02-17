import { filterAgentFeedByPersonaName } from "./agentFeedSearch.js";
import {
  parseFeedSetsOpml,
  removeFeedSet,
  serializeFeedSetsAsOpml,
  upsertFeedSet,
} from "./feedSets.js";
import {
  formatFetchFailureLine,
  normalizeFetchFailures,
  summarizeFetchFailures,
} from "./fetchDiagnostics.js";
import {
  mergeFilterPresets,
  parseFilterPresets,
  removeFilterPreset,
  serializeFilterPresets,
  upsertFilterPreset,
} from "./filterPresets.js";
import { applyItemFilters, normalizeItemFilters } from "./filters.js";
import { parseFilterTokens, removeFilterToken } from "./filterTokens.js";
import { matchStudioShortcut } from "./keyboardShortcuts.js";
import { filterPersonas } from "./personaSearch.js";
import { getPostLengthStatus, trimPostToMaxChars } from "./postEditing.js";
import { removeRulePreset, upsertRulePreset } from "./rulePresets.js";
import { buildSampleItemsJson } from "./sampleItems.js";
import {
  formatInvalidItemsSummary,
  normalizeUrls,
  parseItemsJsonPayload,
  safeHttpUrl,
  toItemsJson,
} from "./step1Ingestion.js";
import {
  requestAgentFeed,
  requestFeedFetch,
  requestGeneratePosts,
  requestPersonas,
} from "./studioApi.js";
import {
  formatFetchSummary,
  getMaxCharsForChannel,
  setMaxCharsForChannel,
} from "./studioPrefs.js";
import {
  clearPersonasOverrides,
  readChannelMaxCharsByChannel,
  readFeedSets,
  readFilterPresets,
  readPersonasOverrides,
  readRulePresets,
  readSessionSnapshot,
  writeChannelMaxCharsByChannel,
  writeFeedSets,
  writeFilterPresets,
  writePersonasOverrides,
  writeRulePresets,
  writeSessionSnapshot,
} from "./studioStorage.js";

const STUDIO_SESSION_KEY = "feed-jarvis-studio:v1";
const STUDIO_PERSONAS_KEY = "feed-jarvis-personas:v1";
const STUDIO_CHANNEL_MAXCHARS_KEY = "feed-jarvis-studio:channel-maxchars:v1";
const DEFAULT_LLM_MODEL = "gpt-4.1-mini";

const state = {
  items: [],
  filteredItems: [],
  posts: [],
  generatedItems: [],
  generatedMeta: null,
  agentFeed: [],
  agentFeedMeta: null,
  feedSets: [],
  filterPresets: [],
  rulePresets: [],
  personasBase: [],
  personasOverrides: [],
  personas: [],
  channel: "x",
  template: "straight",
  generationMode: "template",
  llmModel: DEFAULT_LLM_MODEL,
  restoredPersonaName: "",
  personaSearch: "",
  filters: normalizeItemFilters(),
  channelMaxCharsByChannel: {},
};

const elements = {
  sourceButtons: Array.from(document.querySelectorAll("button[data-source]")),
  feedPanel: document.querySelector("[data-panel='feed']"),
  jsonPanel: document.querySelector("[data-panel='json']"),
  feedUrls: document.getElementById("feedUrls"),
  feedSetSelect: document.getElementById("feedSetSelect"),
  feedSetsFile: document.getElementById("feedSetsFile"),
  loadFeedSetBtn: document.getElementById("loadFeedSetBtn"),
  saveFeedSetBtn: document.getElementById("saveFeedSetBtn"),
  importFeedSetsBtn: document.getElementById("importFeedSetsBtn"),
  exportFeedSetsBtn: document.getElementById("exportFeedSetsBtn"),
  deleteFeedSetBtn: document.getElementById("deleteFeedSetBtn"),
  feedSetStatus: document.getElementById("feedSetStatus"),
  maxItems: document.getElementById("maxItems"),
  fetchConcurrency: document.getElementById("fetchConcurrency"),
  dedupe: document.getElementById("dedupe"),
  fetchBtn: document.getElementById("fetchBtn"),
  loadJsonBtn: document.getElementById("loadJsonBtn"),
  insertSampleItemsBtn: document.getElementById("insertSampleItemsBtn"),
  jsonItems: document.getElementById("jsonItems"),
  itemsStatus: document.getElementById("itemsStatus"),
  itemsFailureDetails: document.getElementById("itemsFailureDetails"),
  itemsFailureSummary: document.getElementById("itemsFailureSummary"),
  itemsFailureList: document.getElementById("itemsFailureList"),
  jsonStatus: document.getElementById("jsonStatus"),
  downloadItemsBtn: document.getElementById("downloadItemsBtn"),
  copyItemsBtn: document.getElementById("copyItemsBtn"),
  itemsExportStatus: document.getElementById("itemsExportStatus"),
  filterInclude: document.getElementById("filterInclude"),
  filterExclude: document.getElementById("filterExclude"),
  filterMinTitleLength: document.getElementById("filterMinTitleLength"),
  filterPresetSelect: document.getElementById("filterPresetSelect"),
  filterPresetsFile: document.getElementById("filterPresetsFile"),
  importFilterPresetsBtn: document.getElementById("importFilterPresetsBtn"),
  exportFilterPresetsBtn: document.getElementById("exportFilterPresetsBtn"),
  loadFilterPresetBtn: document.getElementById("loadFilterPresetBtn"),
  saveFilterPresetBtn: document.getElementById("saveFilterPresetBtn"),
  deleteFilterPresetBtn: document.getElementById("deleteFilterPresetBtn"),
  filterPresetStatus: document.getElementById("filterPresetStatus"),
  filterStatus: document.getElementById("filterStatus"),
  filterTokens: document.getElementById("filterTokens"),
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
  personaSearch: document.getElementById("personaSearch"),
  personaSearchStatus: document.getElementById("personaSearchStatus"),
  personaCards: document.getElementById("personaCards"),
  channelButtons: Array.from(
    document.querySelectorAll("#channelToggle button"),
  ),
  templateSelect: document.getElementById("templateSelect"),
  generationModeSelect: document.getElementById("generationModeSelect"),
  llmModelInput: document.getElementById("llmModelInput"),
  maxChars: document.getElementById("maxChars"),
  rulePrepend: document.getElementById("rulePrepend"),
  ruleAppend: document.getElementById("ruleAppend"),
  ruleHashtags: document.getElementById("ruleHashtags"),
  rulePresetSelect: document.getElementById("rulePresetSelect"),
  loadRulePresetBtn: document.getElementById("loadRulePresetBtn"),
  saveRulePresetBtn: document.getElementById("saveRulePresetBtn"),
  deleteRulePresetBtn: document.getElementById("deleteRulePresetBtn"),
  rulePresetStatus: document.getElementById("rulePresetStatus"),
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
  agentPersonaLimit: document.getElementById("agentPersonaLimit"),
  agentPersonaNames: document.getElementById("agentPersonaNames"),
  agentPersonaMaxChars: document.getElementById("agentPersonaMaxChars"),
  agentPersonaSearch: document.getElementById("agentPersonaSearch"),
  agentLayoutSelect: document.getElementById("agentLayoutSelect"),
  buildAgentFeedBtn: document.getElementById("buildAgentFeedBtn"),
  copyAgentFeedBtn: document.getElementById("copyAgentFeedBtn"),
  downloadAgentFeedBtn: document.getElementById("downloadAgentFeedBtn"),
  agentFeedStatus: document.getElementById("agentFeedStatus"),
  agentPersonaSearchStatus: document.getElementById("agentPersonaSearchStatus"),
  agentFeedList: document.getElementById("agentFeedList"),
  agentFeedEmpty: document.getElementById("agentFeedEmpty"),
  openShortcutLegendBtn: document.getElementById("openShortcutLegendBtn"),
  closeShortcutLegendBtn: document.getElementById("closeShortcutLegendBtn"),
  shortcutLegendOverlay: document.getElementById("shortcutLegendOverlay"),
};

const channelDefaults = {
  x: 280,
  linkedin: 700,
  newsletter: 900,
};
const localStorageRef = window.localStorage;

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

function clearFetchFailureDetails() {
  if (elements.itemsFailureList) {
    elements.itemsFailureList.innerHTML = "";
  }
  if (elements.itemsFailureSummary) {
    elements.itemsFailureSummary.textContent = "Feed fetch details";
  }
  if (elements.itemsFailureDetails) {
    elements.itemsFailureDetails.hidden = true;
    elements.itemsFailureDetails.open = false;
  }
}

function renderFetchFailureDetails(failures, { open = false } = {}) {
  const list = elements.itemsFailureList;
  const summary = elements.itemsFailureSummary;
  const details = elements.itemsFailureDetails;
  if (!list || !summary || !details) return;

  const normalized = normalizeFetchFailures(failures);
  list.innerHTML = "";
  if (normalized.length === 0) {
    clearFetchFailureDetails();
    return;
  }

  for (const failure of normalized) {
    const line = formatFetchFailureLine(failure);
    if (!line) continue;
    const item = document.createElement("li");
    item.textContent = line;
    list.appendChild(item);
  }

  if (list.childElementCount === 0) {
    clearFetchFailureDetails();
    return;
  }

  const summaryText = summarizeFetchFailures(normalized);
  summary.textContent = summaryText || "Feed fetch details";
  details.hidden = false;
  details.open = Boolean(open);
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

function setShortcutLegendOpen(isOpen) {
  if (!elements.shortcutLegendOverlay) return;
  elements.shortcutLegendOverlay.hidden = !isOpen;
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
  updateFilterTokenChips();
  updateItemsPreview();
  if (updateStatus) updateFilterStatus();
}

function removeFilterChip(kind, token) {
  if (kind === "include") {
    elements.filterInclude.value = removeFilterToken(
      elements.filterInclude.value,
      token,
    );
  } else {
    elements.filterExclude.value = removeFilterToken(
      elements.filterExclude.value,
      token,
    );
  }

  refreshFilteredItems();
  resetAgentFeed();
  persistSessionSnapshot();
}

function updateFilterTokenChips() {
  if (!elements.filterTokens) return;
  elements.filterTokens.innerHTML = "";

  const tokens = parseFilterTokens({
    include: elements.filterInclude?.value ?? "",
    exclude: elements.filterExclude?.value ?? "",
  });

  const chips = [
    ...tokens.include.map((token) => ({ kind: "include", token })),
    ...tokens.exclude.map((token) => ({ kind: "exclude", token })),
  ];

  if (chips.length === 0) {
    elements.filterTokens.hidden = true;
    return;
  }
  elements.filterTokens.hidden = false;

  chips.forEach(({ kind, token }) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `filter-token ${kind}`;
    button.textContent = `${kind}: ${token}`;
    button.setAttribute("aria-label", `Remove ${kind} token ${token}`);
    button.addEventListener("click", () => removeFilterChip(kind, token));
    elements.filterTokens.appendChild(button);
  });
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

function persistSessionSnapshot() {
  const snapshot = {
    source: getActiveSource(),
    feedUrls: elements.feedUrls.value,
    feedSetName: elements.feedSetSelect?.value ?? "",
    maxItems: elements.maxItems.value,
    fetchConcurrency: elements.fetchConcurrency?.value ?? "",
    dedupe: elements.dedupe.checked,
    jsonItems: elements.jsonItems.value,
    filterInclude: elements.filterInclude.value,
    filterExclude: elements.filterExclude.value,
    filterMinTitleLength: elements.filterMinTitleLength.value,
    filterPresetName: elements.filterPresetSelect?.value ?? "",
    personaName: elements.personaSelect.value,
    useCustomPersona: elements.customPersonaToggle.checked,
    customPersonaName: elements.customPersonaName.value,
    customPersonaPrefix: elements.customPersonaPrefix.value,
    personaSearch: elements.personaSearch?.value ?? "",
    channel: state.channel,
    template: elements.templateSelect.value,
    generationMode: elements.generationModeSelect.value,
    llmModel: elements.llmModelInput.value,
    maxChars: elements.maxChars.value,
    agentPersonaLimit: elements.agentPersonaLimit.value,
    agentPersonaNames: elements.agentPersonaNames.value,
    agentPersonaMaxChars: elements.agentPersonaMaxChars?.value ?? "",
    agentPersonaSearch: elements.agentPersonaSearch?.value ?? "",
    agentLayout: elements.agentLayoutSelect.value,
    rulePresetName: elements.rulePresetSelect?.value ?? "",
    rulePrepend: elements.rulePrepend.value,
    ruleAppend: elements.ruleAppend.value,
    ruleHashtags: elements.ruleHashtags.value,
    utmEnabled: elements.utmToggle.checked,
    utmSource: elements.utmSource.value,
    utmMedium: elements.utmMedium.value,
    utmCampaign: elements.utmCampaign.value,
  };

  writeSessionSnapshot(localStorageRef, STUDIO_SESSION_KEY, snapshot);
}

function restoreSessionSnapshot() {
  const snapshot = readSessionSnapshot(localStorageRef, STUDIO_SESSION_KEY);
  if (!snapshot) {
    setSource("feed", { persist: false });
    setChannel("x", { persist: false });
    return;
  }

  if (typeof snapshot.feedUrls === "string") {
    elements.feedUrls.value = snapshot.feedUrls;
  }
  if (
    typeof snapshot.feedSetName === "string" &&
    elements.feedSetSelect &&
    snapshot.feedSetName.trim()
  ) {
    elements.feedSetSelect.value = snapshot.feedSetName;
  }
  if (typeof snapshot.maxItems === "string") {
    elements.maxItems.value = snapshot.maxItems;
  }
  if (
    typeof snapshot.fetchConcurrency === "string" &&
    elements.fetchConcurrency
  ) {
    elements.fetchConcurrency.value = snapshot.fetchConcurrency;
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
  if (
    typeof snapshot.filterPresetName === "string" &&
    elements.filterPresetSelect &&
    snapshot.filterPresetName.trim()
  ) {
    elements.filterPresetSelect.value = snapshot.filterPresetName;
  }
  if (typeof snapshot.template === "string") {
    elements.templateSelect.value = snapshot.template;
  }
  if (
    typeof snapshot.generationMode === "string" &&
    (snapshot.generationMode === "template" ||
      snapshot.generationMode === "llm")
  ) {
    elements.generationModeSelect.value = snapshot.generationMode;
    state.generationMode = snapshot.generationMode;
  }
  if (typeof snapshot.llmModel === "string" && snapshot.llmModel.trim()) {
    elements.llmModelInput.value = snapshot.llmModel;
    state.llmModel = snapshot.llmModel.trim();
  }
  if (
    typeof snapshot.rulePresetName === "string" &&
    elements.rulePresetSelect &&
    snapshot.rulePresetName.trim()
  ) {
    elements.rulePresetSelect.value = snapshot.rulePresetName;
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
    writeChannelMaxCharsByChannel(
      localStorageRef,
      STUDIO_CHANNEL_MAXCHARS_KEY,
      state.channelMaxCharsByChannel,
    );
  }
  if (typeof snapshot.agentPersonaLimit === "string") {
    elements.agentPersonaLimit.value = snapshot.agentPersonaLimit;
  }
  if (typeof snapshot.agentPersonaNames === "string") {
    elements.agentPersonaNames.value = snapshot.agentPersonaNames;
  }
  if (
    typeof snapshot.agentPersonaMaxChars === "string" &&
    elements.agentPersonaMaxChars
  ) {
    elements.agentPersonaMaxChars.value = snapshot.agentPersonaMaxChars;
  }
  if (
    typeof snapshot.agentPersonaSearch === "string" &&
    elements.agentPersonaSearch
  ) {
    elements.agentPersonaSearch.value = snapshot.agentPersonaSearch;
  }
  if (
    typeof snapshot.agentLayout === "string" &&
    (snapshot.agentLayout === "rotating" ||
      snapshot.agentLayout === "consensus")
  ) {
    elements.agentLayoutSelect.value = snapshot.agentLayout;
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
  if (typeof snapshot.personaSearch === "string") {
    state.personaSearch = snapshot.personaSearch;
    if (elements.personaSearch) {
      elements.personaSearch.value = snapshot.personaSearch;
    }
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

function refreshFilterPresetSelect() {
  if (!elements.filterPresetSelect) return;

  const selected = elements.filterPresetSelect.value;
  elements.filterPresetSelect.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Choose a saved preset…";
  elements.filterPresetSelect.appendChild(placeholder);

  for (const preset of state.filterPresets) {
    const option = document.createElement("option");
    option.value = preset.name;
    option.textContent = preset.name;
    elements.filterPresetSelect.appendChild(option);
  }

  if (
    selected &&
    state.filterPresets.some((preset) => preset.name === selected)
  ) {
    elements.filterPresetSelect.value = selected;
  }

  const hasSelection = Boolean(elements.filterPresetSelect.value);
  if (elements.loadFilterPresetBtn) {
    elements.loadFilterPresetBtn.disabled = !hasSelection;
  }
  if (elements.deleteFilterPresetBtn) {
    elements.deleteFilterPresetBtn.disabled = !hasSelection;
  }
}

function getSelectedFilterPreset() {
  const name = elements.filterPresetSelect?.value ?? "";
  if (!name) return null;
  return state.filterPresets.find((preset) => preset.name === name) ?? null;
}

function applyFiltersToForm(filters) {
  const next = normalizeItemFilters(filters);
  elements.filterInclude.value = next.include;
  elements.filterExclude.value = next.exclude;
  elements.filterMinTitleLength.value = String(next.minTitleLength);
}

function loadSelectedFilterPreset() {
  const preset = getSelectedFilterPreset();
  if (!preset) {
    setStatus(
      elements.filterPresetStatus,
      "Choose a saved filter preset first.",
      "error",
    );
    return;
  }

  applyFiltersToForm(preset.filters);
  refreshFilteredItems();
  resetAgentFeed();
  setStatus(elements.filterPresetStatus, `Loaded "${preset.name}".`);
  persistSessionSnapshot();
}

function saveFilterPreset() {
  const filters = currentFilters();
  const hasActiveFilters =
    Boolean(filters.include.trim()) ||
    Boolean(filters.exclude.trim()) ||
    filters.minTitleLength > 0;
  if (!hasActiveFilters) {
    setStatus(
      elements.filterPresetStatus,
      "Add at least one filter value before saving a preset.",
      "error",
    );
    return;
  }

  const defaultName =
    (elements.filterPresetSelect?.value ?? "").trim() || "Triage default";
  const nameRaw = window.prompt("Name this filter preset:", defaultName);
  const name = typeof nameRaw === "string" ? nameRaw.trim() : "";
  if (!name) {
    setStatus(elements.filterPresetStatus, "Cancelled filter preset save.");
    return;
  }

  state.filterPresets = upsertFilterPreset(state.filterPresets, {
    name,
    filters,
  });
  writeFilterPresets(localStorageRef, state.filterPresets);
  refreshFilterPresetSelect();
  if (elements.filterPresetSelect) elements.filterPresetSelect.value = name;
  refreshFilterPresetSelect();
  setStatus(elements.filterPresetStatus, `Saved "${name}".`);
  persistSessionSnapshot();
}

function deleteFilterPreset() {
  const preset = getSelectedFilterPreset();
  if (!preset) return;
  const ok = window.confirm(`Delete filter preset "${preset.name}"?`);
  if (!ok) return;

  state.filterPresets = removeFilterPreset(state.filterPresets, preset.name);
  writeFilterPresets(localStorageRef, state.filterPresets);
  if (elements.filterPresetSelect) elements.filterPresetSelect.value = "";
  refreshFilterPresetSelect();
  setStatus(elements.filterPresetStatus, `Deleted "${preset.name}".`);
  persistSessionSnapshot();
}

async function importFilterPresetsJson() {
  setStatus(elements.filterPresetStatus, "");
  const file = elements.filterPresetsFile?.files?.[0];
  if (!file) return;

  try {
    const raw = await file.text();
    const imported = parseFilterPresets(raw);
    if (imported.length === 0) {
      throw new Error("No valid filter presets found in JSON.");
    }

    state.filterPresets = mergeFilterPresets(state.filterPresets, imported);
    writeFilterPresets(localStorageRef, state.filterPresets);
    refreshFilterPresetSelect();
    persistSessionSnapshot();
    setStatus(
      elements.filterPresetStatus,
      `Imported ${imported.length} preset(s).`,
    );
  } catch (err) {
    setStatus(
      elements.filterPresetStatus,
      getErrorMessage(err, "Failed to import filter presets."),
      "error",
    );
  } finally {
    if (elements.filterPresetsFile) {
      elements.filterPresetsFile.value = "";
    }
  }
}

function exportFilterPresetsJson() {
  setStatus(elements.filterPresetStatus, "");
  if (!Array.isArray(state.filterPresets) || state.filterPresets.length === 0) {
    setStatus(
      elements.filterPresetStatus,
      "Save at least one filter preset first.",
      "error",
    );
    return;
  }

  downloadFile(
    "feed-jarvis-filter-presets.json",
    `${serializeFilterPresets(state.filterPresets)}\n`,
  );
  setStatus(
    elements.filterPresetStatus,
    `Exported ${state.filterPresets.length} preset(s).`,
  );
}

function refreshFeedSetSelect() {
  if (!elements.feedSetSelect) return;

  const selected = elements.feedSetSelect.value;
  elements.feedSetSelect.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Choose a saved set…";
  elements.feedSetSelect.appendChild(placeholder);

  for (const set of state.feedSets) {
    const option = document.createElement("option");
    option.value = set.name;
    option.textContent = set.name;
    elements.feedSetSelect.appendChild(option);
  }

  if (selected && state.feedSets.some((set) => set.name === selected)) {
    elements.feedSetSelect.value = selected;
  }

  const hasSelection = Boolean(elements.feedSetSelect.value);
  if (elements.loadFeedSetBtn) elements.loadFeedSetBtn.disabled = !hasSelection;
  if (elements.deleteFeedSetBtn)
    elements.deleteFeedSetBtn.disabled = !hasSelection;
}

function getSelectedFeedSet() {
  const name = elements.feedSetSelect?.value ?? "";
  if (!name) return null;
  return state.feedSets.find((set) => set.name === name) ?? null;
}

function loadSelectedFeedSet() {
  const set = getSelectedFeedSet();
  if (!set) {
    setStatus(
      elements.feedSetStatus,
      "Choose a saved feed set first.",
      "error",
    );
    return;
  }
  elements.feedUrls.value = set.urls.join("\n");
  setStatus(elements.feedSetStatus, `Loaded "${set.name}".`);
  persistSessionSnapshot();
}

function saveFeedSet() {
  const urls = normalizeUrls(elements.feedUrls.value);
  if (urls.length === 0) {
    setStatus(
      elements.feedSetStatus,
      "Add at least one feed URL before saving a set.",
      "error",
    );
    return;
  }

  let firstHost = "";
  try {
    firstHost = new URL(urls[0]).hostname;
  } catch {
    firstHost = "";
  }
  const defaultName =
    (elements.feedSetSelect?.value ?? "").trim() || firstHost || "My feeds";
  const nameRaw = window.prompt("Name this feed set:", defaultName);
  const name = typeof nameRaw === "string" ? nameRaw.trim() : "";
  if (!name) {
    setStatus(elements.feedSetStatus, "Cancelled feed set save.");
    return;
  }

  state.feedSets = upsertFeedSet(state.feedSets, { name, urls });
  writeFeedSets(localStorageRef, state.feedSets);
  refreshFeedSetSelect();
  if (elements.feedSetSelect) elements.feedSetSelect.value = name;
  refreshFeedSetSelect();
  setStatus(elements.feedSetStatus, `Saved "${name}".`);
  persistSessionSnapshot();
}

function deleteFeedSet() {
  const set = getSelectedFeedSet();
  if (!set) return;
  const ok = window.confirm(`Delete feed set "${set.name}"?`);
  if (!ok) return;
  state.feedSets = removeFeedSet(state.feedSets, set.name);
  writeFeedSets(localStorageRef, state.feedSets);
  if (elements.feedSetSelect) elements.feedSetSelect.value = "";
  refreshFeedSetSelect();
  setStatus(elements.feedSetStatus, `Deleted "${set.name}".`);
  persistSessionSnapshot();
}

function getCurrentMaxChars() {
  return Math.max(1, Number(elements.maxChars.value) || 280);
}

function nextUniqueFeedSetName(existingSets, baseName) {
  const existing = new Set(
    (Array.isArray(existingSets) ? existingSets : [])
      .map((entry) =>
        typeof entry?.name === "string" ? entry.name.trim().toLowerCase() : "",
      )
      .filter((value) => value.length > 0),
  );

  const base = baseName?.trim() || "Imported feeds";
  if (!existing.has(base.toLowerCase())) return base;

  for (let i = 2; i < 500; i++) {
    const candidate = `${base} (${i})`;
    if (!existing.has(candidate.toLowerCase())) return candidate;
  }

  return `${base} (${Date.now()})`;
}

function mergeImportedFeedSets(existingSets, importedSets) {
  let next = Array.isArray(existingSets) ? [...existingSets] : [];
  let added = 0;
  let skipped = 0;

  for (const entry of Array.isArray(importedSets) ? importedSets : []) {
    const nameRaw =
      typeof entry?.name === "string" ? entry.name.trim() : "Imported feeds";
    const urls = Array.isArray(entry?.urls)
      ? entry.urls
          .map((value) => (typeof value === "string" ? value.trim() : ""))
          .filter((value) => value.length > 0)
      : [];
    if (!nameRaw || urls.length === 0) {
      skipped += 1;
      continue;
    }

    const name = nextUniqueFeedSetName(next, nameRaw);
    const beforeCount = next.length;
    next = upsertFeedSet(next, { name, urls });
    if (next.length > beforeCount || next.some((set) => set.name === name)) {
      added += 1;
    } else {
      skipped += 1;
    }
  }

  return { sets: next, added, skipped };
}

function exportFeedSetsOpml() {
  setStatus(elements.feedSetStatus, "");
  if (!Array.isArray(state.feedSets) || state.feedSets.length === 0) {
    setStatus(
      elements.feedSetStatus,
      "Save at least one feed set first.",
      "error",
    );
    return;
  }

  const opml = serializeFeedSetsAsOpml(state.feedSets);
  downloadFile("feed-jarvis-feed-sets.opml", opml);
  setStatus(
    elements.feedSetStatus,
    `Exported ${state.feedSets.length} feed set(s) as OPML.`,
  );
}

async function importFeedSetsOpml() {
  setStatus(elements.feedSetStatus, "");
  const file = elements.feedSetsFile?.files?.[0];
  if (!file) return;

  try {
    const raw = await file.text();
    const imported = parseFeedSetsOpml(raw);
    if (imported.length === 0) {
      throw new Error("No valid feed sets found in OPML.");
    }

    const { sets, added } = mergeImportedFeedSets(state.feedSets, imported);
    if (added === 0) {
      throw new Error("No new feed sets were imported.");
    }

    state.feedSets = sets;
    writeFeedSets(localStorageRef, state.feedSets);
    refreshFeedSetSelect();
    persistSessionSnapshot();
    setStatus(
      elements.feedSetStatus,
      `Imported ${added} feed set(s) from OPML.`,
    );
  } catch (err) {
    setStatus(
      elements.feedSetStatus,
      getErrorMessage(err, "Failed to import OPML feed sets."),
      "error",
    );
  } finally {
    if (elements.feedSetsFile) {
      // Allow importing the same file repeatedly.
      elements.feedSetsFile.value = "";
    }
  }
}

function refreshRulePresetSelect() {
  if (!elements.rulePresetSelect) return;

  const selected = elements.rulePresetSelect.value;
  elements.rulePresetSelect.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Choose a saved preset…";
  elements.rulePresetSelect.appendChild(placeholder);

  for (const preset of state.rulePresets) {
    const option = document.createElement("option");
    option.value = preset.name;
    option.textContent = preset.name;
    elements.rulePresetSelect.appendChild(option);
  }

  if (
    selected &&
    state.rulePresets.some((preset) => preset.name === selected)
  ) {
    elements.rulePresetSelect.value = selected;
  }

  const hasSelection = Boolean(elements.rulePresetSelect.value);
  if (elements.loadRulePresetBtn)
    elements.loadRulePresetBtn.disabled = !hasSelection;
  if (elements.deleteRulePresetBtn)
    elements.deleteRulePresetBtn.disabled = !hasSelection;
}

function getSelectedRulePreset() {
  const name = elements.rulePresetSelect?.value ?? "";
  if (!name) return null;
  return state.rulePresets.find((preset) => preset.name === name) ?? null;
}

function applyRulesToForm(rules) {
  const safeRules = rules && typeof rules === "object" ? rules : {};
  const utmRaw = Reflect.get(safeRules, "utm");
  const utm = utmRaw && typeof utmRaw === "object" ? utmRaw : {};

  elements.rulePrepend.value =
    typeof Reflect.get(safeRules, "prepend") === "string"
      ? String(Reflect.get(safeRules, "prepend"))
      : "";
  elements.ruleAppend.value =
    typeof Reflect.get(safeRules, "append") === "string"
      ? String(Reflect.get(safeRules, "append"))
      : "";
  elements.ruleHashtags.value =
    typeof Reflect.get(safeRules, "hashtags") === "string"
      ? String(Reflect.get(safeRules, "hashtags"))
      : "";

  const utmSource =
    typeof Reflect.get(utm, "source") === "string"
      ? String(Reflect.get(utm, "source"))
      : "";
  const utmMedium =
    typeof Reflect.get(utm, "medium") === "string"
      ? String(Reflect.get(utm, "medium"))
      : "";
  const utmCampaign =
    typeof Reflect.get(utm, "campaign") === "string"
      ? String(Reflect.get(utm, "campaign"))
      : "";

  elements.utmSource.value = utmSource;
  elements.utmMedium.value = utmMedium;
  elements.utmCampaign.value = utmCampaign;

  const hasUtm = Boolean(utmSource || utmMedium || utmCampaign);
  elements.utmToggle.checked = hasUtm;
  elements.utmFields.hidden = !hasUtm;
}

function loadSelectedRulePreset() {
  const preset = getSelectedRulePreset();
  if (!preset) {
    setStatus(
      elements.rulePresetStatus,
      "Choose a saved rule preset first.",
      "error",
    );
    return;
  }

  applyRulesToForm(preset.rules);
  setStatus(elements.rulePresetStatus, `Loaded "${preset.name}".`);
  persistSessionSnapshot();
}

function saveRulePreset() {
  const rules = currentRules();
  if (!rules) {
    setStatus(
      elements.rulePresetStatus,
      "Add at least one text rule before saving a preset.",
      "error",
    );
    return;
  }

  const defaultName =
    (elements.rulePresetSelect?.value ?? "").trim() ||
    `${state.channel.toUpperCase()} default`;
  const nameRaw = window.prompt("Name this rule preset:", defaultName);
  const name = typeof nameRaw === "string" ? nameRaw.trim() : "";
  if (!name) {
    setStatus(elements.rulePresetStatus, "Cancelled rule preset save.");
    return;
  }

  state.rulePresets = upsertRulePreset(state.rulePresets, { name, rules });
  writeRulePresets(localStorageRef, state.rulePresets);
  refreshRulePresetSelect();
  if (elements.rulePresetSelect) elements.rulePresetSelect.value = name;
  refreshRulePresetSelect();
  setStatus(elements.rulePresetStatus, `Saved "${name}".`);
  persistSessionSnapshot();
}

function deleteRulePreset() {
  const preset = getSelectedRulePreset();
  if (!preset) return;
  const ok = window.confirm(`Delete rule preset "${preset.name}"?`);
  if (!ok) return;

  state.rulePresets = removeRulePreset(state.rulePresets, preset.name);
  writeRulePresets(localStorageRef, state.rulePresets);
  if (elements.rulePresetSelect) elements.rulePresetSelect.value = "";
  refreshRulePresetSelect();
  setStatus(elements.rulePresetStatus, `Deleted "${preset.name}".`);
  persistSessionSnapshot();
}

function parseFilterTerms(raw) {
  if (typeof raw !== "string") return [];
  return raw
    .split(/,|\n/)
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

function addMutedDomain(hostname) {
  if (!hostname) return;
  const token = `site:${hostname.toLowerCase()}`;
  const existing = parseFilterTerms(elements.filterExclude.value);
  const hasToken = existing.some((entry) => entry.toLowerCase() === token);
  if (!hasToken) {
    existing.push(token);
    elements.filterExclude.value = existing.join(", ");
  }

  refreshFilteredItems();
  resetAgentFeed();
  setStatus(elements.filterStatus, `Muted ${hostname}.`);
  persistSessionSnapshot();
}

function renderPreviewItem(item) {
  const li = document.createElement("li");
  li.className = "preview-item-row";

  const title = document.createElement("div");
  title.className = "preview-item-title";
  title.textContent = item.title;
  li.appendChild(title);

  const meta = document.createElement("div");
  meta.className = "preview-item-meta";

  const domain = document.createElement("span");
  domain.className = "preview-item-domain";

  const parsed = safeHttpUrl(String(item?.url ?? ""));
  if (parsed) {
    const hostname = parsed.hostname.toLowerCase();
    domain.textContent = hostname;

    const mute = document.createElement("button");
    mute.type = "button";
    mute.className = "preview-item-mute";
    mute.textContent = "Mute domain";
    mute.addEventListener("click", () => addMutedDomain(hostname));
    meta.appendChild(mute);
  } else {
    domain.textContent = "No domain";
  }

  meta.prepend(domain);
  li.appendChild(meta);
  return li;
}

function updateItemsPreview() {
  elements.itemsList.innerHTML = "";
  setStatus(elements.itemsExportStatus, "");

  if (state.items.length === 0) {
    elements.itemsEmpty.textContent =
      "No items yet. Add a feed to see results.";
    elements.itemsEmpty.style.display = "block";
    if (elements.downloadItemsBtn) elements.downloadItemsBtn.disabled = true;
    if (elements.copyItemsBtn) elements.copyItemsBtn.disabled = true;
    updateFilterStatus();
    return;
  }

  if (state.filteredItems.length === 0) {
    elements.itemsEmpty.textContent =
      "No items match your filters. Adjust the filter inputs to continue.";
    elements.itemsEmpty.style.display = "block";
    if (elements.downloadItemsBtn) elements.downloadItemsBtn.disabled = true;
    if (elements.copyItemsBtn) elements.copyItemsBtn.disabled = true;
    updateFilterStatus();
    return;
  }

  elements.itemsEmpty.style.display = "none";
  if (elements.downloadItemsBtn) elements.downloadItemsBtn.disabled = false;
  if (elements.copyItemsBtn) elements.copyItemsBtn.disabled = false;
  const previewItems = state.filteredItems.slice(0, 8);
  for (const item of previewItems) {
    elements.itemsList.appendChild(renderPreviewItem(item));
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
  const query = (elements.personaSearch?.value ?? "").trim();
  const matches = filterPersonas(state.personas, query);
  const featured = matches.slice(0, 8);

  if (elements.personaSearchStatus) {
    if (query && matches.length === 0) {
      setStatus(
        elements.personaSearchStatus,
        `No personas match "${query}".`,
        "error",
      );
    } else if (query) {
      const shown = Math.min(featured.length, matches.length);
      setStatus(
        elements.personaSearchStatus,
        `Showing ${shown} of ${matches.length} matching persona(s).`,
      );
    } else if (state.personas.length > featured.length) {
      setStatus(
        elements.personaSearchStatus,
        `Showing ${featured.length} of ${state.personas.length} persona(s). Search to narrow.`,
      );
    } else {
      setStatus(elements.personaSearchStatus, "");
    }
  }

  if (featured.length === 0) {
    const empty = document.createElement("div");
    empty.className = "persona-card";
    empty.textContent = "No matching personas.";
    elements.personaCards.appendChild(empty);
    return;
  }

  for (const persona of featured) {
    const card = document.createElement("button");
    card.className = "persona-card";
    card.type = "button";
    card.classList.toggle(
      "active",
      elements.personaSelect.value === persona.name,
    );
    card.setAttribute("aria-label", `Use persona ${persona.name}`);

    const name = document.createElement("strong");
    name.textContent = persona.name;

    const prefix = document.createElement("span");
    prefix.textContent = persona.prefix;

    card.addEventListener("click", () => {
      elements.customPersonaToggle.checked = false;
      elements.customPersonaFields.hidden = true;
      elements.personaSelect.disabled = false;
      elements.personaSelect.value = persona.name;
      updatePersonaCards();
      persistSessionSnapshot();
    });

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
    length.className = "tag";

    const warning = document.createElement("span");
    warning.className = "post-over-limit";
    warning.hidden = true;

    const copyBtn = document.createElement("button");
    copyBtn.className = "secondary";
    copyBtn.type = "button";
    copyBtn.textContent = "Copy";
    copyBtn.addEventListener("click", () => copyText(textarea.value));

    const trimBtn = document.createElement("button");
    trimBtn.className = "ghost";
    trimBtn.type = "button";
    trimBtn.textContent = "Trim to max";
    trimBtn.hidden = true;
    trimBtn.addEventListener("click", () => {
      const trimmed = trimPostToMaxChars(textarea.value, getCurrentMaxChars());
      textarea.value = trimmed;
      state.posts[index] = trimmed;
      updateLengthMeta();
    });

    const actions = document.createElement("div");
    actions.className = "post-meta-actions";
    actions.appendChild(copyBtn);
    actions.appendChild(trimBtn);

    function updateLengthMeta() {
      const status = getPostLengthStatus(textarea.value, getCurrentMaxChars());
      length.textContent = `${status.length}/${status.maxChars} chars`;
      length.classList.toggle("warning", status.isOver);
      warning.hidden = !status.isOver;
      warning.textContent = status.isOver
        ? `Over by ${status.overBy} chars.`
        : "";
      trimBtn.hidden = !status.isOver;
    }

    updateLengthMeta();
    meta.appendChild(length);
    meta.appendChild(warning);
    meta.appendChild(actions);

    textarea.addEventListener("input", () => {
      state.posts[index] = textarea.value;
      updateLengthMeta();
    });

    wrapper.appendChild(textarea);
    wrapper.appendChild(meta);
    elements.postsList.appendChild(wrapper);
  });
}

function updateAgentFeedPreview() {
  elements.agentFeedList.innerHTML = "";

  const query = elements.agentPersonaSearch?.value?.trim?.() ?? "";
  const visibleFeed = filterAgentFeedByPersonaName(state.agentFeed, query);
  if (!Array.isArray(state.agentFeed) || state.agentFeed.length === 0) {
    elements.agentFeedEmpty.style.display = "block";
    elements.copyAgentFeedBtn.disabled = true;
    elements.downloadAgentFeedBtn.disabled = true;
    setStatus(elements.agentPersonaSearchStatus, "");
    return;
  }

  elements.agentFeedEmpty.style.display = "none";
  elements.copyAgentFeedBtn.disabled = false;
  elements.downloadAgentFeedBtn.disabled = false;

  if (query && visibleFeed.length === 0) {
    elements.agentFeedEmpty.style.display = "block";
    elements.agentFeedEmpty.textContent =
      "No feed posts match that persona filter.";
    setStatus(
      elements.agentPersonaSearchStatus,
      `No agent feed entries match "${query}".`,
      "error",
    );
    return;
  }

  elements.agentFeedEmpty.textContent =
    "Build the agent feed to see the timeline.";
  if (query) {
    setStatus(
      elements.agentPersonaSearchStatus,
      `Showing ${visibleFeed.length} of ${state.agentFeed.length} feed post(s).`,
    );
  } else {
    setStatus(elements.agentPersonaSearchStatus, "");
  }

  visibleFeed.forEach((entry) => {
    const wrapper = document.createElement("div");
    wrapper.className = "post-card";

    const source = document.createElement("div");
    source.className = "post-source";

    const title = document.createElement("div");
    title.className = "post-source-title";
    title.textContent = `${entry.personaName ?? "Agent"} · ${entry.itemTitle ?? ""}`;
    source.appendChild(title);

    const parsed = safeHttpUrl(String(entry.itemUrl ?? ""));
    if (parsed) {
      const link = document.createElement("a");
      link.className = "post-source-link";
      link.href = parsed.toString();
      link.target = "_blank";
      link.rel = "noreferrer noopener";
      link.textContent = parsed.hostname;
      source.appendChild(link);
    }

    const body = document.createElement("div");
    body.textContent = String(entry.post ?? "");

    wrapper.appendChild(source);
    wrapper.appendChild(body);
    elements.agentFeedList.appendChild(wrapper);
  });
}

function copyText(text, statusElement = elements.postsStatus) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(
    () => setStatus(statusElement, "Copied to clipboard."),
    () =>
      setStatus(
        statusElement,
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

function resetDrafts() {
  state.posts = [];
  state.generatedItems = [];
  state.generatedMeta = null;
  updatePostsPreview();
  setStatus(elements.postsStatus, "");
}

function resetAgentFeed() {
  state.agentFeed = [];
  state.agentFeedMeta = null;
  updateAgentFeedPreview();
  setStatus(elements.agentFeedStatus, "");
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
      mode: state.generatedMeta.mode ?? "template",
      llmModel: state.generatedMeta.llmModel ?? "",
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

  const lines = rows.map((row) => {
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

function toAgentFeedJson() {
  return `${JSON.stringify(
    {
      meta: state.agentFeedMeta ?? {},
      feed: state.agentFeed ?? [],
    },
    null,
    2,
  )}\n`;
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
    const data = await requestPersonas(fetch);
    const personas =
      data && typeof data === "object" ? Reflect.get(data, "personas") : [];
    const basePersonas = Array.isArray(personas) ? personas : [];
    const overrides = readPersonasOverrides(
      localStorageRef,
      STUDIO_PERSONAS_KEY,
      parsePersonasJson,
    );
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
  clearFetchFailureDetails();
  const urls = normalizeUrls(elements.feedUrls.value);
  if (urls.length === 0) {
    setStatus(elements.itemsStatus, "Add at least one feed URL.", "error");
    return;
  }

  const maxItems = Math.max(1, Number(elements.maxItems.value) || 20);
  const fetchConcurrency = Math.min(
    20,
    Math.max(1, Number(elements.fetchConcurrency?.value) || 4),
  );
  if (elements.fetchConcurrency) {
    elements.fetchConcurrency.value = String(fetchConcurrency);
  }
  const dedupe = elements.dedupe.checked;

  setButtonLoading(elements.fetchBtn, true, "Fetching...");

  try {
    const data = await requestFeedFetch(fetch, {
      urls,
      maxItems,
      dedupe,
      fetchConcurrency,
    });

    const items =
      data && typeof data === "object" ? Reflect.get(data, "items") : [];
    state.items = Array.isArray(items) ? items : [];
    refreshFilteredItems();
    resetDrafts();
    resetAgentFeed();

    const summary =
      data && typeof data === "object" ? Reflect.get(data, "summary") : null;
    const failures =
      data && typeof data === "object" ? Reflect.get(data, "failures") : null;
    const normalizedFailures = normalizeFetchFailures(failures);
    const summaryMessage = formatFetchSummary(
      summary,
      state.items.length,
      urls.length,
    );
    const failureMessage = summarizeFetchFailures(normalizedFailures);
    const message = failureMessage
      ? `${summaryMessage} ${failureMessage}`
      : summaryMessage;
    setStatus(
      elements.itemsStatus,
      message,
      normalizedFailures.length > 0 ? "error" : "info",
    );
    renderFetchFailureDetails(normalizedFailures);
  } catch (err) {
    const details =
      err && typeof err === "object" ? Reflect.get(err, "details") : null;
    const normalizedFailures = normalizeFetchFailures(details);
    const failureMessage = summarizeFetchFailures(normalizedFailures);
    const message = getErrorMessage(err, "Feed fetch failed.");
    setStatus(
      elements.itemsStatus,
      failureMessage ? `${message} ${failureMessage}` : message,
      "error",
    );
    renderFetchFailureDetails(normalizedFailures, { open: true });
  } finally {
    setButtonLoading(elements.fetchBtn, false);
  }
}

function loadItemsFromJson() {
  setStatus(elements.jsonStatus, "");
  clearFetchFailureDetails();
  const raw = elements.jsonItems.value.trim();
  if (!raw) {
    setStatus(elements.jsonStatus, "Paste a JSON array to continue.", "error");
    return;
  }
  try {
    const parsed = JSON.parse(raw);
    const { items, invalid } = parseItemsJsonPayload(parsed);
    if (items.length === 0) {
      throw new Error(
        invalid.length > 0
          ? `No valid items found. ${formatInvalidItemsSummary(invalid)}`
          : "No valid items found.",
      );
    }
    state.items = items;
    refreshFilteredItems();
    resetDrafts();
    resetAgentFeed();
    if (invalid.length > 0) {
      setStatus(
        elements.jsonStatus,
        `Loaded ${items.length} item(s). Skipped ${invalid.length} invalid item(s). ${formatInvalidItemsSummary(invalid)}`,
        "error",
      );
      return;
    }
    setStatus(elements.jsonStatus, `Loaded ${items.length} items.`);
  } catch (err) {
    setStatus(
      elements.jsonStatus,
      getErrorMessage(err, "Invalid JSON."),
      "error",
    );
  }
}

function insertSampleItemsPayload() {
  const existing = elements.jsonItems.value.trim();
  if (existing) {
    const ok = window.confirm(
      "Replace the current JSON input with a sample items payload?",
    );
    if (!ok) return;
  }

  elements.jsonItems.value = buildSampleItemsJson();
  setStatus(elements.jsonStatus, "Inserted sample items JSON.");
  persistSessionSnapshot();
}

function runShortcutAction(action) {
  if (!action) return;

  if (action === "load-items") {
    const activeSource = getActiveSource();
    if (activeSource === "feed") {
      fetchItems();
      return;
    }
    if (activeSource === "json") {
      loadItemsFromJson();
    }
    return;
  }

  if (action === "generate-posts") {
    generatePosts();
    return;
  }

  if (action === "copy-drafts") {
    if (elements.copyAllBtn.disabled) {
      setStatus(elements.postsStatus, "Generate drafts first.", "error");
      return;
    }
    elements.copyAllBtn.click();
    return;
  }

  if (action === "download-drafts-jsonl") {
    if (elements.downloadJsonBtn.disabled) {
      setStatus(elements.postsStatus, "Generate drafts to export.", "error");
      return;
    }
    elements.downloadJsonBtn.click();
    return;
  }

  if (action === "build-agent-feed") {
    if (elements.buildAgentFeedBtn.disabled) return;
    buildAgentFeed();
    return;
  }

  if (action === "copy-agent-feed") {
    if (elements.copyAgentFeedBtn.disabled) {
      setStatus(
        elements.agentFeedStatus,
        "Build the agent feed first.",
        "error",
      );
      return;
    }
    elements.copyAgentFeedBtn.click();
    return;
  }

  if (action === "download-agent-feed") {
    if (elements.downloadAgentFeedBtn.disabled) {
      setStatus(
        elements.agentFeedStatus,
        "Build the agent feed first.",
        "error",
      );
      return;
    }
    elements.downloadAgentFeedBtn.click();
    return;
  }

  if (action === "toggle-shortcut-legend") {
    const open = elements.shortcutLegendOverlay?.hidden === false;
    setShortcutLegendOpen(!open);
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
  const generationMode =
    elements.generationModeSelect.value === "llm" ? "llm" : "template";
  const llmModel = elements.llmModelInput.value.trim() || DEFAULT_LLM_MODEL;
  const rules = currentRules();

  const payload = {
    mode: generationMode,
    llmModel,
    items: generationItems,
    maxChars,
    channel: state.channel,
    template,
    personaName: useCustom ? undefined : selectedPersona.name,
    personaCustom: useCustom ? personaUsed : undefined,
    rules,
  };

  setButtonLoading(elements.generateBtn, true, "Generating...");

  try {
    const data = await requestGeneratePosts(fetch, payload);
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
      mode: generationMode,
      llmModel: generationMode === "llm" ? llmModel : null,
      persona: personaUsed,
      maxChars,
      rules,
    };
    updatePostsPreview();
    const modeLabel =
      generationMode === "llm"
        ? `via GPT (${llmModel})`
        : "via template engine";
    setStatus(
      elements.postsStatus,
      `Generated ${state.posts.length} drafts ${modeLabel}.`,
    );
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

function parsePersonaNames(raw) {
  if (typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

function parsePersonaMaxCharsInput(raw) {
  if (typeof raw !== "string" || !raw.trim()) return {};

  const overrides = {};
  const rows = raw
    .split(/\r?\n|,/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  for (const row of rows) {
    const splitAt = row.lastIndexOf(":");
    if (splitAt <= 0) continue;
    const name = row.slice(0, splitAt).trim();
    const maxCharsRaw = row.slice(splitAt + 1).trim();
    const maxChars = Number(maxCharsRaw);
    if (!name || !Number.isFinite(maxChars) || maxChars <= 0) continue;
    overrides[name] = Math.floor(maxChars);
  }

  return overrides;
}

async function buildAgentFeed() {
  setStatus(elements.agentFeedStatus, "");
  if (state.items.length === 0) {
    setStatus(elements.agentFeedStatus, "Load items first.", "error");
    return;
  }
  if (state.filteredItems.length === 0) {
    setStatus(
      elements.agentFeedStatus,
      "No items match your filters. Adjust filters, then try again.",
      "error",
    );
    return;
  }

  const generationMode =
    elements.generationModeSelect.value === "llm" ? "llm" : "template";
  const llmModel = elements.llmModelInput.value.trim() || DEFAULT_LLM_MODEL;
  const personaLimit = Math.max(
    1,
    Math.min(100, Number(elements.agentPersonaLimit.value) || 12),
  );
  const personaNames = parsePersonaNames(elements.agentPersonaNames.value);
  const personaMaxChars = parsePersonaMaxCharsInput(
    elements.agentPersonaMaxChars?.value ?? "",
  );
  const layout =
    elements.agentLayoutSelect.value === "consensus" ? "consensus" : "rotating";
  const rules = currentRules();
  const maxChars = Math.max(1, Number(elements.maxChars.value) || 280);
  const template = elements.templateSelect.value;

  const payload = {
    mode: generationMode,
    llmModel,
    items: state.filteredItems,
    personaLimit,
    personaNames,
    personaMaxChars,
    layout,
    maxChars,
    channel: state.channel,
    template,
    rules,
  };

  setButtonLoading(elements.buildAgentFeedBtn, true, "Building...");

  try {
    const data = await requestAgentFeed(fetch, payload);
    const feed =
      data && typeof data === "object" ? Reflect.get(data, "feed") : [];
    state.agentFeed = Array.isArray(feed) ? feed : [];
    state.agentFeedMeta = {
      mode: generationMode,
      llmModel: generationMode === "llm" ? llmModel : null,
      personaLimit,
      personaNames,
      layout,
    };
    updateAgentFeedPreview();
    setStatus(
      elements.agentFeedStatus,
      `Built ${state.agentFeed.length} feed post(s) (${layout}).`,
    );
  } catch (err) {
    setStatus(
      elements.agentFeedStatus,
      getErrorMessage(err, "Agent feed failed."),
      "error",
    );
  } finally {
    setButtonLoading(elements.buildAgentFeedBtn, false);
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
    updatePersonaCards();
    persistSessionSnapshot();
  });

  elements.personaSearch?.addEventListener("input", () => {
    state.personaSearch = elements.personaSearch?.value ?? "";
    updatePersonaCards();
    persistSessionSnapshot();
  });

  elements.utmToggle.addEventListener("change", () => {
    elements.utmFields.hidden = !elements.utmToggle.checked;
    persistSessionSnapshot();
  });

  elements.agentPersonaSearch?.addEventListener("input", () => {
    updateAgentFeedPreview();
    persistSessionSnapshot();
  });

  elements.openShortcutLegendBtn?.addEventListener("click", () => {
    setShortcutLegendOpen(true);
  });

  elements.closeShortcutLegendBtn?.addEventListener("click", () => {
    setShortcutLegendOpen(false);
  });

  elements.shortcutLegendOverlay?.addEventListener("click", (event) => {
    if (event.target === elements.shortcutLegendOverlay) {
      setShortcutLegendOpen(false);
    }
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
      writePersonasOverrides(localStorageRef, STUDIO_PERSONAS_KEY, personas);
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
    clearPersonasOverrides(localStorageRef, STUDIO_PERSONAS_KEY);
    applyPersonas(state.personasBase, []);
    setStatus(elements.personasStatus, "Cleared imported personas.");
  });

  elements.feedSetSelect?.addEventListener("change", () => {
    refreshFeedSetSelect();
    persistSessionSnapshot();
  });
  elements.loadFeedSetBtn?.addEventListener("click", loadSelectedFeedSet);
  elements.saveFeedSetBtn?.addEventListener("click", saveFeedSet);
  elements.importFeedSetsBtn?.addEventListener("click", () => {
    setStatus(elements.feedSetStatus, "");
    elements.feedSetsFile?.click();
  });
  elements.feedSetsFile?.addEventListener("change", () => {
    importFeedSetsOpml();
  });
  elements.exportFeedSetsBtn?.addEventListener("click", exportFeedSetsOpml);
  elements.deleteFeedSetBtn?.addEventListener("click", deleteFeedSet);
  elements.filterPresetSelect?.addEventListener("change", () => {
    refreshFilterPresetSelect();
    persistSessionSnapshot();
  });
  elements.loadFilterPresetBtn?.addEventListener(
    "click",
    loadSelectedFilterPreset,
  );
  elements.saveFilterPresetBtn?.addEventListener("click", saveFilterPreset);
  elements.deleteFilterPresetBtn?.addEventListener("click", deleteFilterPreset);
  elements.importFilterPresetsBtn?.addEventListener("click", () => {
    setStatus(elements.filterPresetStatus, "");
    elements.filterPresetsFile?.click();
  });
  elements.filterPresetsFile?.addEventListener("change", () => {
    importFilterPresetsJson();
  });
  elements.exportFilterPresetsBtn?.addEventListener(
    "click",
    exportFilterPresetsJson,
  );
  elements.rulePresetSelect?.addEventListener("change", () => {
    refreshRulePresetSelect();
    persistSessionSnapshot();
  });
  elements.loadRulePresetBtn?.addEventListener("click", loadSelectedRulePreset);
  elements.saveRulePresetBtn?.addEventListener("click", saveRulePreset);
  elements.deleteRulePresetBtn?.addEventListener("click", deleteRulePreset);

  elements.fetchBtn.addEventListener("click", fetchItems);
  elements.loadJsonBtn.addEventListener("click", loadItemsFromJson);
  elements.insertSampleItemsBtn?.addEventListener(
    "click",
    insertSampleItemsPayload,
  );
  elements.generateBtn.addEventListener("click", generatePosts);
  elements.buildAgentFeedBtn.addEventListener("click", buildAgentFeed);

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

  elements.copyAgentFeedBtn.addEventListener("click", () => {
    if (!Array.isArray(state.agentFeed) || state.agentFeed.length === 0) {
      setStatus(
        elements.agentFeedStatus,
        "Build the agent feed first.",
        "error",
      );
      return;
    }
    copyText(
      state.agentFeed
        .map((entry) => `${entry.personaName}: ${entry.post}`)
        .join("\n"),
      elements.agentFeedStatus,
    );
  });

  elements.downloadAgentFeedBtn.addEventListener("click", () => {
    if (!Array.isArray(state.agentFeed) || state.agentFeed.length === 0) {
      setStatus(
        elements.agentFeedStatus,
        "Build the agent feed first.",
        "error",
      );
      return;
    }
    downloadFile("feed-jarvis-agent-feed.json", toAgentFeedJson());
    setStatus(elements.agentFeedStatus, "Downloaded feed JSON.");
  });

  elements.downloadItemsBtn?.addEventListener("click", () => {
    if (state.filteredItems.length === 0) {
      setStatus(elements.itemsExportStatus, "Load items to export.", "error");
      return;
    }
    downloadFile("feed-jarvis-items.json", toItemsJson(state.filteredItems));
    setStatus(elements.itemsExportStatus, "Downloaded items.json.");
  });

  elements.copyItemsBtn?.addEventListener("click", () => {
    if (state.filteredItems.length === 0) {
      setStatus(elements.itemsExportStatus, "Load items to copy.", "error");
      return;
    }
    const payload = toItemsJson(state.filteredItems);
    navigator.clipboard.writeText(payload).then(
      () => setStatus(elements.itemsExportStatus, "Copied items JSON."),
      () =>
        setStatus(
          elements.itemsExportStatus,
          "Copy failed. Download items.json instead.",
          "error",
        ),
    );
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.shortcutLegendOverlay?.hidden) {
      setShortcutLegendOpen(false);
      return;
    }
    const action = matchStudioShortcut(event);
    if (!action) return;
    event.preventDefault();
    runShortcutAction(action);
  });

  elements.channelButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setChannel(button.dataset.channel);
    });
  });

  elements.generationModeSelect?.addEventListener("change", () => {
    state.generationMode =
      elements.generationModeSelect.value === "llm" ? "llm" : "template";
    persistSessionSnapshot();
  });

  elements.llmModelInput?.addEventListener("input", () => {
    state.llmModel = elements.llmModelInput.value.trim() || DEFAULT_LLM_MODEL;
    persistSessionSnapshot();
  });

  elements.maxChars.addEventListener("input", () => {
    const next = setMaxCharsForChannel(
      state.channelMaxCharsByChannel,
      state.channel,
      elements.maxChars.value,
    );
    if (next !== state.channelMaxCharsByChannel) {
      state.channelMaxCharsByChannel = next;
      writeChannelMaxCharsByChannel(
        localStorageRef,
        STUDIO_CHANNEL_MAXCHARS_KEY,
        next,
      );
    }
    if (state.posts.length > 0) {
      updatePostsPreview();
    }
  });

  [
    elements.feedUrls,
    elements.feedSetSelect,
    elements.maxItems,
    elements.fetchConcurrency,
    elements.dedupe,
    elements.jsonItems,
    elements.filterInclude,
    elements.filterExclude,
    elements.filterMinTitleLength,
    elements.filterPresetSelect,
    elements.personaSelect,
    elements.customPersonaName,
    elements.customPersonaPrefix,
    elements.templateSelect,
    elements.generationModeSelect,
    elements.llmModelInput,
    elements.maxChars,
    elements.agentPersonaLimit,
    elements.agentPersonaNames,
    elements.agentPersonaMaxChars,
    elements.agentLayoutSelect,
    elements.rulePresetSelect,
    elements.rulePrepend,
    elements.ruleAppend,
    elements.ruleHashtags,
    elements.utmToggle,
    elements.utmSource,
    elements.utmMedium,
    elements.utmCampaign,
  ].forEach((element) => {
    if (!element) return;
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
      resetAgentFeed();
      persistSessionSnapshot();
    });
  });
}

state.channelMaxCharsByChannel = readChannelMaxCharsByChannel(
  localStorageRef,
  STUDIO_CHANNEL_MAXCHARS_KEY,
);
state.feedSets = readFeedSets(localStorageRef);
state.filterPresets = readFilterPresets(localStorageRef);
state.rulePresets = readRulePresets(localStorageRef);
refreshFeedSetSelect();
refreshFilterPresetSelect();
refreshRulePresetSelect();
restoreSessionSnapshot();
refreshFeedSetSelect();
refreshFilterPresetSelect();
refreshRulePresetSelect();
wireEvents();
loadPersonas();
refreshFilteredItems({ updateStatus: false });
updateAgentFeedPreview();
persistSessionSnapshot();
