"use client";

import { usePathname } from "next/navigation";

import { useAuthStore, useHasHydrated } from "@/lib/stores/auth";
import { tourForPath } from "./registry";
import { useTourFor } from "./use-tour-for";

/**
 * One client island for the whole private area. Maps the current
 * pathname to a tour and fires it once per user (the store dedupes
 * against hydrated server progress). This replaces scattering
 * <TourAutoFire> on individual pages - the bug was that after signup a
 * user lands on /dashboard, which had no auto-fire, so the tour only
 * appeared if they later happened to hit a page that did.
 *
 * Gated on auth hydration + a real user so the start doesn't race the
 * persisted-session probe. Returns null when the route has no tour.
 */
export function TourRouter() {
  const pathname = usePathname();
  const hasHydrated = useHasHydrated();
  const user = useAuthStore((s) => s.user);

  const tour = tourForPath(pathname);
  const ready = hasHydrated && user !== null && tour !== null;

  // Hook order must stay stable: always call useTourFor. When there is
  // no tour for this route, pass a harmless id with ready=false so the
  // effect is a no-op.
  useTourFor(tour ?? "home", ready);
  return null;
}
