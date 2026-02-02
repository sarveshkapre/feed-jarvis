const state = {
  items: [],
  posts: [],
  personas: [],
};

const elements = {
  sourceButtons: Array.from(document.querySelectorAll(".toggle button")),
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
  itemsList: document.getElementById("itemsList"),
  itemsEmpty: document.getElementById("itemsEmpty"),
  personaSelect: document.getElementById("personaSelect"),
  customPersonaToggle: document.getElementById("customPersonaToggle"),
  customPersonaFields: document.getElementById("customPersonaFields"),
  customPersonaName: document.getElementById("customPersonaName"),
  customPersonaPrefix: document.getElementById("customPersonaPrefix"),
  personaCards: document.getElementById("personaCards"),
  maxChars: document.getElementById("maxChars"),
  generateBtn: document.getElementById("generateBtn"),
  postsStatus: document.getElementById("postsStatus"),
  postsList: document.getElementById("postsList"),
  postsEmpty: document.getElementById("postsEmpty"),
  copyAllBtn: document.getElementById("copyAllBtn"),
  downloadTxtBtn: document.getElementById("downloadTxtBtn"),
  downloadJsonBtn: document.getElementById("downloadJsonBtn"),
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
    button.dataset.originalText = button.dataset.originalText || button.textContent;
    button.textContent = isLoading ? text : button.dataset.originalText;
  }
}

function normalizeUrls(raw) {
  return raw
    .split(/\n|,/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function updateItemsPreview() {
  elements.itemsList.innerHTML = "";
  if (state.items.length === 0) {
    elements.itemsEmpty.style.display = "block";
    return;
  }
  elements.itemsEmpty.style.display = "none";
  const previewItems = state.items.slice(0, 8);
  for (const item of previewItems) {
    const li = document.createElement("li");
    li.textContent = item.title;
    elements.itemsList.appendChild(li);
  }
  if (state.items.length > previewItems.length) {
    const li = document.createElement("li");
    li.textContent = `+${state.items.length - previewItems.length} more items loaded`;
    elements.itemsList.appendChild(li);
  }
}

function updatePersonaCards() {
  elements.personaCards.innerHTML = "";
  const featured = state.personas.slice(0, 4);
  for (const persona of featured) {
    const card = document.createElement("div");
    card.className = "persona-card";
    card.innerHTML = `<strong>${persona.name}</strong><span>${persona.prefix}</span>`;
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
    return;
  }
  elements.postsEmpty.style.display = "none";
  elements.copyAllBtn.disabled = false;
  elements.downloadTxtBtn.disabled = false;
  elements.downloadJsonBtn.disabled = false;

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
    () => setStatus(elements.postsStatus, "Copy failed. Select the text manually.", "error"),
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

async function loadPersonas() {
  try {
    const res = await fetch("/api/personas");
    if (!res.ok) throw new Error("Failed to load personas");
    const data = await res.json();
    state.personas = data.personas || [];
  } catch (err) {
    setStatus(elements.itemsStatus, "Unable to load personas. Refresh to retry.", "error");
    return;
  }

  elements.personaSelect.innerHTML = "";
  state.personas.forEach((persona) => {
    const option = document.createElement("option");
    option.value = persona.name;
    option.textContent = `${persona.name} · ${persona.prefix}`;
    elements.personaSelect.appendChild(option);
  });

  const defaultPersona = state.personas.find((persona) => persona.name === "Analyst");
  if (defaultPersona) {
    elements.personaSelect.value = defaultPersona.name;
  }
  updatePersonaCards();
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
    updateItemsPreview();
    setStatus(
      elements.itemsStatus,
      `Loaded ${state.items.length} items from ${data.summary?.sources ?? urls.length} feed(s).`,
    );
  } catch (err) {
    setStatus(elements.itemsStatus, err.message || "Feed fetch failed.", "error");
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
    updateItemsPreview();
    setStatus(elements.jsonStatus, `Loaded ${items.length} items.`);
  } catch (err) {
    setStatus(elements.jsonStatus, err.message || "Invalid JSON.", "error");
  }
}

async function generatePosts() {
  setStatus(elements.postsStatus, "");
  if (state.items.length === 0) {
    setStatus(elements.postsStatus, "Load items first.", "error");
    return;
  }

  const maxChars = Math.max(1, Number(elements.maxChars.value) || 280);
  const useCustom = elements.customPersonaToggle.checked;
  const payload = {
    items: state.items,
    maxChars,
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
    setStatus(elements.postsStatus, err.message || "Generation failed.", "error");
  } finally {
    setButtonLoading(elements.generateBtn, false);
  }
}

function wireEvents() {
  elements.sourceButtons.forEach((button) => {
    button.addEventListener("click", () => {
      elements.sourceButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      const source = button.dataset.source;
      elements.feedPanel.hidden = source !== "feed";
      elements.jsonPanel.hidden = source !== "json";
    });
  });

  elements.customPersonaToggle.addEventListener("change", () => {
    elements.customPersonaFields.hidden = !elements.customPersonaToggle.checked;
  });

  elements.fetchBtn.addEventListener("click", fetchItems);
  elements.loadJsonBtn.addEventListener("click", loadItemsFromJson);
  elements.generateBtn.addEventListener("click", generatePosts);

  elements.copyAllBtn.addEventListener("click", () => {
    copyText(state.posts.join("\n"));
  });

  elements.downloadTxtBtn.addEventListener("click", () => {
    downloadFile("feed-jarvis-posts.txt", state.posts.join("\n"));
  });

  elements.downloadJsonBtn.addEventListener("click", () => {
    const jsonl = state.posts.map((post) => JSON.stringify(post)).join("\n");
    downloadFile("feed-jarvis-posts.jsonl", `${jsonl}\n`);
  });

  document.addEventListener("keydown", (event) => {
    if (!(event.ctrlKey || event.metaKey) || event.key !== "Enter") return;
    const activeSource = document.querySelector(".toggle button.active")?.dataset.source;
    if (activeSource === "feed") {
      fetchItems();
      return;
    }
    if (activeSource === "json") {
      loadItemsFromJson();
    }
  });
}

wireEvents();
loadPersonas();
