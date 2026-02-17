import { describe, expect, test } from "vitest";
import {
  buildNamedSelectSnapshot,
  collectNamedEntryNames,
  findNamedEntryByName,
  resolveNamedSelection,
  syncNamedSelectControl,
} from "../web/namedSelectBindings.js";

function createFakeSelect(initialValue = "") {
  const state = {
    inner: "",
    options: [] as Array<{ value: string; textContent: string }>,
    value: initialValue,
  };

  return {
    get innerHTML() {
      return state.inner;
    },
    set innerHTML(next: string) {
      state.inner = next;
      state.options = [];
    },
    get value() {
      return state.value;
    },
    set value(next: string) {
      state.value = next;
    },
    appendChild(option: { value: string; textContent: string }) {
      state.options.push({
        value: option.value,
        textContent: option.textContent,
      });
    },
    get options() {
      return state.options;
    },
  };
}

function createFakeOption() {
  return { value: "", textContent: "" };
}

describe("namedSelectBindings", () => {
  test("collects only valid names", () => {
    expect(
      collectNamedEntryNames([
        { name: "Alpha" },
        { name: "" },
        { name: "Beta" },
        { nope: true },
      ]),
    ).toEqual(["Alpha", "Beta"]);
  });

  test("resolves selected value only when present", () => {
    expect(resolveNamedSelection(["One", "Two"], "Two")).toBe("Two");
    expect(resolveNamedSelection(["One", "Two"], "Missing")).toBe("");
    expect(resolveNamedSelection(["One", "Two"], 42)).toBe("");
  });

  test("builds placeholder + options snapshot", () => {
    const snapshot = buildNamedSelectSnapshot(
      [{ name: "Morning" }, { name: "Evening" }],
      { selectedName: "Morning", placeholderLabel: "Choose preset…" },
    );

    expect(snapshot.options).toEqual([
      { value: "", label: "Choose preset…" },
      { value: "Morning", label: "Morning" },
      { value: "Evening", label: "Evening" },
    ]);
    expect(snapshot.selectedValue).toBe("Morning");
    expect(snapshot.hasSelection).toBe(true);
  });

  test("syncs select options and button disabled state", () => {
    const select = createFakeSelect();
    const loadButton = { disabled: true };
    const deleteButton = { disabled: true };

    const result = syncNamedSelectControl({
      select,
      entries: [{ name: "Daily" }, { name: "Weekly" }],
      placeholderLabel: "Choose set…",
      selectedName: "Weekly",
      loadButton,
      deleteButton,
      createOptionElement: createFakeOption,
    });

    expect(result).toEqual({ selectedValue: "Weekly", hasSelection: true });
    expect(select.options).toEqual([
      { value: "", textContent: "Choose set…" },
      { value: "Daily", textContent: "Daily" },
      { value: "Weekly", textContent: "Weekly" },
    ]);
    expect(loadButton.disabled).toBe(false);
    expect(deleteButton.disabled).toBe(false);
  });

  test("falls back to no selection when selected value is invalid", () => {
    const select = createFakeSelect("Missing");
    const loadButton = { disabled: false };
    const deleteButton = { disabled: false };

    const result = syncNamedSelectControl({
      select,
      entries: [{ name: "Only" }],
      placeholderLabel: "Choose one…",
      loadButton,
      deleteButton,
      createOptionElement: createFakeOption,
    });

    expect(result).toEqual({ selectedValue: "", hasSelection: false });
    expect(select.value).toBe("");
    expect(loadButton.disabled).toBe(true);
    expect(deleteButton.disabled).toBe(true);
  });

  test("finds selected entry by exact name", () => {
    const entries = [
      { name: "A", urls: ["a"] },
      { name: "B", urls: ["b"] },
    ];
    expect(findNamedEntryByName(entries, "B")).toEqual({
      name: "B",
      urls: ["b"],
    });
    expect(findNamedEntryByName(entries, "b")).toBeNull();
    expect(findNamedEntryByName(entries, "")).toBeNull();
  });
});
