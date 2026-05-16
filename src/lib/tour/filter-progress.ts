import { TOURS } from "./registry";
import type { TourId, TourOutcome, TourProgress } from "./types";

/**
 * Narrow a raw `tourProgress` payload from the server to the FE-known
 * allowlist. Defensive against a tour added BE-side that this deployed
 * client doesn't know about yet - silently drop unknown keys and any
 * outcome string that isn't "completed" / "skipped".
 *
 * Shared by AuthProvider (Me probe) and the login flow (verifyOtp /
 * socialLogin) so multi-device progress syncs from the first session,
 * not only after the next cold load (Q-11).
 */
export function filterTourProgress(
  raw: Record<string, "completed" | "skipped"> | null | undefined
): TourProgress {
  if (!raw) return {};
  const knownIds = Object.keys(TOURS) as TourId[];
  const out: TourProgress = {};
  for (const id of knownIds) {
    const value = raw[id];
    if (value === "completed" || value === "skipped") {
      out[id] = value as TourOutcome;
    }
  }
  return out;
}
