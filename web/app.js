import { applyItemFilters, normalizeItemFilters } from "./filters.js";

const STUDIO_SESSION_KEY = "feed-jarvis-studio:v1";

const state = {
  items: [],
  filteredItems: [],
  posts: [],
  personas: [],
  channel: "x",
  template: "straight",
  restoredPersonaName: "",
  filters: normalizeItemFilters(),
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
    elements.maxChars.value = String(channelDefaults[channel]);
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

  setSource(snapshot.source, { persist: false });
  setChannel(snapshot.channel, { persist: false });

  if (typeof snapshot.maxChars === "string" && snapshot.maxChars.trim()) {
    elements.maxChars.value = snapshot.maxChars;
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

function toCsv(posts, channel) {
  const header = "channel,post";
  const rows = posts.map((post) => {
    const safeChannel = String(channel).replace(/"/g, '""');
    const safePost = String(post).replace(/"/g, '""');
    return `"${safeChannel}","${safePost}"`;
  });
  return `${[header, ...rows].join("\\n")}\\n`;
}

async function loadPersonas() {
  try {
    const res = await fetch("/api/personas");
    if (!res.ok) throw new Error("Failed to load personas");
    const data = await res.json();
    state.personas = data.personas || [];
  } catch (_err) {
    setStatus(
      elements.itemsStatus,
      "Unable to load personas. Refresh to retry.",
      "error",
    );
    return;
  }

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

  updatePersonaCards();
  persistSessionSnapshot();
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

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch feed");
    }

    state.items = data.items || [];
    refreshFilteredItems();
    setStatus(
      elements.itemsStatus,
      `Loaded ${state.items.length} items from ${data.summary?.sources ?? urls.length} feed(s).`,
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

  const maxChars = Math.max(1, Number(elements.maxChars.value) || 280);
  const useCustom = elements.customPersonaToggle.checked;
  const payload = {
    items: state.filteredItems,
    maxChars,
    channel: state.channel,
    template: elements.templateSelect.value,
    personaName: useCustom ? undefined : elements.personaSelect.value,
    personaCustom: useCustom
      ? {
          name: elements.customPersonaName.value.trim() || "Custom",
          prefix: elements.customPersonaPrefix.value.trim() || "Custom:",
        }
      : undefined,
  };

  setButtonLoading(elements.generateBtn, true, "Generating...");

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Generation failed");
    state.posts = data.posts || [];
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
    persistSessionSnapshot();
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
    const jsonl = state.posts.map((post) => JSON.stringify(post)).join("\n");
    downloadFile(`feed-jarvis-${state.channel}-posts.jsonl`, `${jsonl}\n`);
  });

  elements.downloadCsvBtn.addEventListener("click", () => {
    downloadFile(
      `feed-jarvis-${state.channel}-posts.csv`,
      toCsv(state.posts, state.channel),
    );
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

restoreSessionSnapshot();
wireEvents();
loadPersonas();
refreshFilteredItems({ updateStatus: false });
persistSessionSnapshot();
