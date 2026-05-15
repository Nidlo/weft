"use client";

import { NidloMark } from "@/components/brand/nidlo-mark";
import { StitchLoader } from "@/components/ui/stitch-loader";
import { useAuthStore } from "@/lib/stores/auth";

/**
 * Brand splash that renders for the duration of the Zustand hydration step.
 * The previous "MIN_VISIBLE_MS = 600" anti-flicker tax was removed — splash
 * unmounts the moment hasHydrated flips; the CSS fade smooths the
 * transition. Pointer-events gated so it stops blocking clicks once hidden.
 *
 * Renders the brand mark via <NidloMark> instead of the previous plain
 * "Nidlo" text + linear-bar combo. Single source of truth for the mark.
 */
export function AppSplash() {
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading Nidlo"
      className="bg-background fixed inset-0 z-[200] flex flex-col items-center justify-center gap-8 transition-opacity duration-300"
      style={{
        opacity: hasHydrated ? 0 : 1,
        pointerEvents: hasHydrated ? "none" : "auto",
      }}
      aria-hidden={hasHydrated ? "true" : "false"}
    >
      {/* `static` skips NidloMark's entrance animation. The splash is
          typically gone before that 0.55s+ delay finishes, so without
          this the user only saw the StitchLoader's dashes. */}
      <NidloMark variant="wordmark-tagline" size={56} static />
      <StitchLoader size={28} tone="copper" />
    </div>
  );
}
