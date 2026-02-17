function normalizeName(value) {
  return typeof value === "string" ? value : "";
}

export function collectNamedEntryNames(entries) {
  const list = Array.isArray(entries) ? entries : [];
  const names = [];
  for (const entry of list) {
    const name = normalizeName(entry?.name);
    if (!name) continue;
    names.push(name);
  }
  return names;
}

export function resolveNamedSelection(entryNames, selectedName) {
  const names = Array.isArray(entryNames) ? entryNames : [];
  const next = normalizeName(selectedName);
  return names.includes(next) ? next : "";
}

export function buildNamedSelectSnapshot(
  entries,
  { selectedName = "", placeholderLabel = "Choose an option…" } = {},
) {
  const entryNames = collectNamedEntryNames(entries);
  const selectedValue = resolveNamedSelection(entryNames, selectedName);
  return {
    options: [
      { value: "", label: placeholderLabel },
      ...entryNames.map((name) => ({ value: name, label: name })),
    ],
    selectedValue,
    hasSelection: Boolean(selectedValue),
  };
}

function defaultCreateOptionElement() {
  return document.createElement("option");
}

export function applyNamedSelectSnapshot(
  select,
  snapshot,
  { createOptionElement = defaultCreateOptionElement } = {},
) {
  if (!select || !snapshot) return;
  select.innerHTML = "";

  for (const optionSnapshot of snapshot.options ?? []) {
    const option = createOptionElement();
    option.value = optionSnapshot.value;
    option.textContent = optionSnapshot.label;
    select.appendChild(option);
  }

  select.value = snapshot.selectedValue ?? "";
}

export function syncNamedSelectControl({
  select,
  entries,
  placeholderLabel,
  selectedName,
  loadButton,
  deleteButton,
  createOptionElement,
}) {
  if (!select) return { selectedValue: "", hasSelection: false };
  const snapshot = buildNamedSelectSnapshot(entries, {
    selectedName: normalizeName(selectedName) || select.value,
    placeholderLabel,
  });
  applyNamedSelectSnapshot(select, snapshot, { createOptionElement });
  if (loadButton) loadButton.disabled = !snapshot.hasSelection;
  if (deleteButton) deleteButton.disabled = !snapshot.hasSelection;
  return {
    selectedValue: snapshot.selectedValue,
    hasSelection: snapshot.hasSelection,
  };
}

export function findNamedEntryByName(entries, selectedName) {
  const name = normalizeName(selectedName);
  if (!name) return null;
  const list = Array.isArray(entries) ? entries : [];
  return list.find((entry) => normalizeName(entry?.name) === name) ?? null;
}
