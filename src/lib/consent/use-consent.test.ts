import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import {
  CONSENT_VERSION,
  __resetConsentCacheForTests,
  getConsent,
  useConsent,
} from "./use-consent";

const STORAGE_KEY = "nidlo:consent:v1";

beforeEach(() => {
  window.localStorage.clear();
  __resetConsentCacheForTests();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useConsent", () => {
  it("starts as undecided when no record exists", () => {
    const { result } = renderHook(() => useConsent());
    expect(result.current.hasDecided).toBe(false);
    expect(result.current.analytics).toBe(false);
    expect(result.current.decidedAt).toBeNull();
    expect(getConsent()).toBeNull();
  });

  it("accept() persists analytics=true with a timestamp + current version", () => {
    const { result } = renderHook(() => useConsent());
    act(() => result.current.accept());

    expect(result.current.hasDecided).toBe(true);
    expect(result.current.analytics).toBe(true);
    expect(result.current.version).toBe(CONSENT_VERSION);
    expect(result.current.decidedAt).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
    );

    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
    expect(saved.analytics).toBe(true);
    expect(saved.version).toBe(CONSENT_VERSION);
  });

  it("decline() persists analytics=false but still records a decision", () => {
    const { result } = renderHook(() => useConsent());
    act(() => result.current.decline());

    expect(result.current.hasDecided).toBe(true);
    expect(result.current.analytics).toBe(false);

    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
    expect(saved.analytics).toBe(false);
  });

  it("reset() wipes the record so the banner can re-prompt", () => {
    const { result } = renderHook(() => useConsent());
    act(() => result.current.accept());
    expect(result.current.hasDecided).toBe(true);

    act(() => result.current.reset());
    expect(result.current.hasDecided).toBe(false);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("ignores records from an older policy version (re-prompts after a version bump)", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        analytics: true,
        decidedAt: "2026-01-01T00:00:00.000Z",
        version: CONSENT_VERSION - 1,
      })
    );

    const { result } = renderHook(() => useConsent());
    expect(result.current.hasDecided).toBe(false);
  });

  it("ignores malformed JSON in storage and treats the user as undecided", () => {
    window.localStorage.setItem(STORAGE_KEY, "not-json{");
    const { result } = renderHook(() => useConsent());
    expect(result.current.hasDecided).toBe(false);
  });

  it("ignores records missing required fields", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ analytics: "yes-please" })
    );
    const { result } = renderHook(() => useConsent());
    expect(result.current.hasDecided).toBe(false);
  });

  it("survives localStorage throwing (private mode / quota)", () => {
    // Spy on setItem and throw - emulates Safari private mode SecurityError.
    const setItemSpy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new DOMException("QuotaExceededError");
      });

    const { result } = renderHook(() => useConsent());
    expect(() => act(() => result.current.accept())).not.toThrow();
    setItemSpy.mockRestore();
  });

  it("multiple useConsent hooks stay synchronised after a write", () => {
    const a = renderHook(() => useConsent());
    const b = renderHook(() => useConsent());

    expect(a.result.current.hasDecided).toBe(false);
    expect(b.result.current.hasDecided).toBe(false);

    act(() => a.result.current.accept());

    expect(a.result.current.hasDecided).toBe(true);
    expect(b.result.current.hasDecided).toBe(true);
    expect(b.result.current.analytics).toBe(true);
  });
});

describe("getConsent", () => {
  it("returns null when no record is stored", () => {
    expect(getConsent()).toBeNull();
  });

  it("returns the parsed record when one is stored", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        analytics: true,
        decidedAt: "2026-05-15T12:00:00.000Z",
        version: CONSENT_VERSION,
      })
    );
    const record = getConsent();
    expect(record).toEqual({
      analytics: true,
      decidedAt: "2026-05-15T12:00:00.000Z",
      version: CONSENT_VERSION,
    });
  });
});
