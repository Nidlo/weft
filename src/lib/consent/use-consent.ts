"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

/**
 * Cookie / tracking consent state.
 *
 * Stored in localStorage under a versioned key. Bumping `CONSENT_VERSION`
 * invalidates every existing record so the banner re-prompts after a
 * material policy change. `decidedAt` is captured so Settings → Privacy
 * can show the user when they made the choice (and it gives us a
 * timestamped audit trail if anyone disputes consent later).
 *
 * v1 is intentionally a single binary (analytics on/off). The `/cookies`
 * policy only enumerates one non-essential category (analytics);
 * preferences + necessary are always-on per the policy. The storage
 * shape leaves room to add more flags without a version bump as long as
 * the meaning of `analytics` doesn't change.
 */
export interface ConsentRecord {
  /** User opted in to analytics cookies. */
  analytics: boolean;
  /** ISO 8601 timestamp when the decision was recorded. */
  decidedAt: string;
  /** Policy version this decision is bound to. */
  version: number;
}

const STORAGE_KEY = "nidlo:consent:v1";
export const CONSENT_VERSION = 1;

const READING_LISTENERS = new Set<() => void>();

// Snapshot cache. `useSyncExternalStore` requires `getSnapshot` to return a
// stable reference between renders when state hasn't changed - otherwise
// React's strict-mode bail-out fails and we infinite-loop. The cache is
// invalidated only by `bustCache()`, which `writeRecord` and the storage
// event listener call.
let cachedSnapshot: ConsentRecord | null | undefined = undefined;

function bustCache(): void {
  cachedSnapshot = undefined;
}

function parseRecord(raw: string | null): ConsentRecord | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ConsentRecord>;
    if (
      typeof parsed.analytics !== "boolean" ||
      typeof parsed.decidedAt !== "string" ||
      typeof parsed.version !== "number"
    ) {
      return null;
    }
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed as ConsentRecord;
  } catch {
    return null;
  }
}

function readRecord(): ConsentRecord | null {
  if (typeof window === "undefined") return null;
  if (cachedSnapshot !== undefined) return cachedSnapshot;
  try {
    cachedSnapshot = parseRecord(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    // Quota / SecurityError in some private-mode browsers.
    cachedSnapshot = null;
  }
  return cachedSnapshot;
}

function writeRecord(record: ConsentRecord | null): void {
  try {
    if (record === null) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    }
  } catch {
    // Best-effort: if storage is unavailable the user can still operate
    // in-session, they'll just be prompted again on next visit. That's the
    // privacy-safe failure mode.
  }
  bustCache();
  for (const listener of READING_LISTENERS) listener();
}

/**
 * Non-React read path. Use this from analytics SDK init code, server
 * components (where it returns null), or any code outside the React tree
 * that needs to gate behaviour on the user's choice.
 */
export function getConsent(): ConsentRecord | null {
  return readRecord();
}

/**
 * Test-only escape hatch. The module-level snapshot cache survives across
 * test cases in the same vitest worker, so a test that pre-seeds
 * localStorage in `beforeEach` would still see a stale cached null from a
 * previous case. Tests call this in `beforeEach` after clearing storage.
 */
export function __resetConsentCacheForTests(): void {
  bustCache();
}

function subscribe(listener: () => void): () => void {
  READING_LISTENERS.add(listener);
  // Cross-tab sync: another tab writing the consent key fires `storage`
  // here. We MUST bust the cache before notifying - `readRecord` would
  // otherwise return our stale snapshot and ignore the new tab's write.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      bustCache();
      listener();
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    READING_LISTENERS.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

export interface UseConsentResult {
  /** True when the user has either accepted or declined analytics. */
  hasDecided: boolean;
  /** Whether analytics cookies are allowed. Defaults to false when undecided. */
  analytics: boolean;
  decidedAt: string | null;
  version: number | null;
  /** Record an opt-in to analytics. */
  accept: () => void;
  /** Record an opt-out from analytics (still records consent, just negative). */
  decline: () => void;
  /** Wipe the stored record - re-shows the banner on next render. */
  reset: () => void;
}

/**
 * React hook that wraps the consent record + mutations.
 *
 * Uses `useSyncExternalStore` so multiple banner/Settings mounts stay in
 * sync without a Provider, and so cross-tab `storage` events propagate.
 */
export function useConsent(): UseConsentResult {
  // SSR: returns null on the server; the first client render will hydrate
  // with the real localStorage value via useSyncExternalStore.
  const record = useSyncExternalStore(subscribe, readRecord, () => null);

  const accept = useCallback(() => {
    writeRecord({
      analytics: true,
      decidedAt: new Date().toISOString(),
      version: CONSENT_VERSION,
    });
  }, []);

  const decline = useCallback(() => {
    writeRecord({
      analytics: false,
      decidedAt: new Date().toISOString(),
      version: CONSENT_VERSION,
    });
  }, []);

  const reset = useCallback(() => {
    writeRecord(null);
  }, []);

  // Notify listeners after mount in case another component mounted us first
  // without a write happening yet - keeps consumers synced on first paint.
  useEffect(() => {
    for (const listener of READING_LISTENERS) listener();
  }, []);

  return {
    hasDecided: record !== null,
    analytics: record?.analytics ?? false,
    decidedAt: record?.decidedAt ?? null,
    version: record?.version ?? null,
    accept,
    decline,
    reset,
  };
}
