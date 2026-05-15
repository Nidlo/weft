"use client";

import { useEffect } from "react";

import type { TourId } from "./types";
import { useTourStore } from "./use-tour";

/**
 * Page-level hook: fires the named tour on first visit. Idempotent -
 * if the tour has already been seen (completed or skipped), this is a
 * no-op. Callers don't need to track first-visit themselves; the
 * Zustand store + hydrated server progress handle dedupe.
 *
 * Wait for `ready` (e.g. user authed, data loaded, anchor elements
 * mounted) before calling. Passing ready=false defers the start until
 * the next render where it flips true.
 */
export function useTourFor(tourId: TourId, ready: boolean = true): void {
  const start = useTourStore((s) => s.start);
  useEffect(() => {
    if (!ready) return;
    start(tourId);
  }, [ready, tourId, start]);
}
