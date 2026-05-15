"use client";

import { create } from "zustand";

import type { TourId, TourOutcome, TourProgress } from "./types";

interface TourState {
  /** Per-user progress mirror, hydrated once when the provider mounts. */
  progress: TourProgress;
  /** Currently-running tour, if any. */
  activeTour: TourId | null;
  /** 0-indexed step within the active tour. */
  step: number;

  /** Hydrate from the server's `me.tourProgress` (called by TourProvider). */
  hydrate: (progress: TourProgress) => void;
  /**
   * Try to fire a tour. Skips silently if it's already been completed
   * or skipped (callers don't need to check first). Force is a manual
   * replay from the help menu.
   */
  start: (tourId: TourId, options?: { force?: boolean }) => void;
  /** Advance to the next step, or end the tour if we're on the last one. */
  next: (totalSteps: number) => void;
  /** Step back one (used by the Back button). */
  back: () => void;
  /**
   * End the tour with an outcome. Updates local state immediately so
   * the popover unmounts; the mutation fires from TourProvider and
   * reconciles `progress` when the server response lands.
   */
  finish: (outcome: TourOutcome) => void;
  /** Server-side mark landed - reconcile the progress mirror. */
  markPersisted: (tourId: TourId, outcome: TourOutcome) => void;
}

export const useTourStore = create<TourState>((set) => ({
  progress: {},
  activeTour: null,
  step: 0,

  hydrate: (progress) => set({ progress }),

  start: (tourId, options) =>
    set((state) => {
      if (!options?.force && state.progress[tourId]) {
        return state;
      }
      return { activeTour: tourId, step: 0 };
    }),

  next: (totalSteps) =>
    set((state) => {
      if (state.activeTour === null) return state;
      if (state.step + 1 >= totalSteps) {
        return { activeTour: null, step: 0 };
      }
      return { step: state.step + 1 };
    }),

  back: () =>
    set((state) => ({
      step: Math.max(0, state.step - 1),
    })),

  // The outcome arg shapes the public hook surface (caller passes
  // "completed" or "skipped") so the mark-server-side dance in
  // TourProvider stays type-checked, even though the local state
  // transition itself is identical for both outcomes.
  finish: () => set({ activeTour: null, step: 0 }),

  markPersisted: (tourId, outcome) =>
    set((state) => ({
      progress: { ...state.progress, [tourId]: outcome },
    })),
}));

/** Public hook surface - every consumer should go through this. */
export function useTour() {
  return useTourStore();
}
