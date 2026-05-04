import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useAutosave } from "./use-autosave";

describe("useAutosave", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null `restored` when no draft exists", () => {
    const { result } = renderHook(() =>
      useAutosave("nidlo:draft:test", { name: "Kwame" })
    );
    expect(result.current.restored).toBeNull();
  });

  it("debounce-writes the value to localStorage after debounceMs", () => {
    renderHook(() =>
      useAutosave("nidlo:draft:test", { name: "Kwame" }, { debounceMs: 500 })
    );
    // Before the debounce elapses, nothing has been written.
    expect(localStorage.getItem("nidlo:draft:test")).toBeNull();
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(JSON.parse(localStorage.getItem("nidlo:draft:test")!)).toEqual({
      name: "Kwame",
    });
  });

  it("debounces — rapid changes only write once", () => {
    const { rerender } = renderHook(
      ({ value }) =>
        useAutosave("nidlo:draft:test", value, { debounceMs: 500 }),
      { initialProps: { value: { name: "K" } } }
    );

    rerender({ value: { name: "Kw" } });
    rerender({ value: { name: "Kwa" } });
    rerender({ value: { name: "Kwam" } });
    rerender({ value: { name: "Kwame" } });

    // Less than debounce — nothing yet.
    act(() => vi.advanceTimersByTime(400));
    expect(localStorage.getItem("nidlo:draft:test")).toBeNull();

    // After debounce settles — only the latest value.
    act(() => vi.advanceTimersByTime(200));
    expect(JSON.parse(localStorage.getItem("nidlo:draft:test")!)).toEqual({
      name: "Kwame",
    });
  });

  it("restores the previously-written draft on a fresh mount", () => {
    localStorage.setItem(
      "nidlo:draft:test",
      JSON.stringify({ name: "Akosua" })
    );
    const { result } = renderHook(() =>
      useAutosave("nidlo:draft:test", { name: "" })
    );
    expect(result.current.restored).toEqual({ name: "Akosua" });
  });

  it("`clear()` removes the stored draft", () => {
    localStorage.setItem(
      "nidlo:draft:test",
      JSON.stringify({ name: "Akosua" })
    );
    const { result } = renderHook(() =>
      useAutosave("nidlo:draft:test", { name: "" })
    );
    expect(localStorage.getItem("nidlo:draft:test")).not.toBeNull();
    act(() => result.current.clear());
    expect(localStorage.getItem("nidlo:draft:test")).toBeNull();
  });

  it("drops a corrupt draft and returns null", () => {
    localStorage.setItem("nidlo:draft:test", "{not json");
    const { result } = renderHook(() =>
      useAutosave("nidlo:draft:test", { name: "" })
    );
    expect(result.current.restored).toBeNull();
    // Helper purges the unreadable entry so it doesn't keep failing.
    expect(localStorage.getItem("nidlo:draft:test")).toBeNull();
  });

  it("respects `enabled: false` — does not write", () => {
    renderHook(() =>
      useAutosave(
        "nidlo:draft:test",
        { name: "Kwame" },
        { debounceMs: 500, enabled: false }
      )
    );
    act(() => vi.advanceTimersByTime(2000));
    expect(localStorage.getItem("nidlo:draft:test")).toBeNull();
  });
});
