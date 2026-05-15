"use client";

import { useAuthStore, useHasHydrated } from "@/lib/stores/auth";
import type { TourId } from "./types";
import { useTourFor } from "./use-tour-for";

/**
 * Mountable client island that fires a tour once for the active user.
 * Wraps `useTourFor` with the auth-hydration gate so the start call
 * doesn't race the persisted-session probe (an authed user landing on
 * `/` should still get the tour even though Auth runs its Me probe
 * async). Server components can drop this in without going client
 * themselves.
 */
export function TourAutoFire({ tour }: { tour: TourId }) {
  const hasHydrated = useHasHydrated();
  const user = useAuthStore((s) => s.user);
  const ready = hasHydrated && user !== null;
  useTourFor(tour, ready);
  return null;
}
