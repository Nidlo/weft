"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function readInitial<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Best-effort.
    }
    return null;
  }
}

/**
 * Persist a form's draft state to `localStorage` so a session-expiry / refresh
 * doesn't make the user retype their work. The Zustand-backed wizard stores
 * already cover the long onboarding + blueprint flows; this hook fills the gap
 * for the smaller forms (profile edit, order edit sheet) referenced in the
 * failure-modes doc as "long forms that need autosave".
 *
 * Contract:
 *   const { restored, clear } = useAutosave("nidlo:draft:profile", value);
 *
 *   - On mount, reads `localStorage[key]` once and exposes it as `restored`
 *     (parent can choose whether to apply it via a "Resume?" prompt or
 *     replace state directly).
 *   - On each `value` change, debounce-writes the new value back to storage.
 *   - `clear()` removes the stored draft — call after a successful submit so
 *     the next page load doesn't offer a stale draft.
 *
 * Storage failures (private mode, quota) are non-fatal: best-effort.
 */
export function useAutosave<T>(
  key: string,
  value: T,
  options: { debounceMs?: number; enabled?: boolean } = {}
): { restored: T | null; clear: () => void } {
  const { debounceMs = 800, enabled = true } = options;
  // Lazy-initialize from localStorage so we never sync external state into
  // React state via an effect (React 19 cascading-render rule).
  const [restored, setRestored] = useState<T | null>(() => readInitial<T>(key));
  const writeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced write on value change.
  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;

    if (writeTimerRef.current) clearTimeout(writeTimerRef.current);
    writeTimerRef.current = setTimeout(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Storage may be unavailable (private mode, quota) — non-fatal.
      }
    }, debounceMs);

    return () => {
      if (writeTimerRef.current) clearTimeout(writeTimerRef.current);
    };
  }, [key, value, debounceMs, enabled]);

  const clear = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Best-effort.
    }
    setRestored(null);
  }, [key]);

  return { restored, clear };
}
