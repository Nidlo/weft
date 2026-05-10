"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/stores/auth";

/**
 * Brand splash that renders for the duration of the Zustand hydration step.
 * The previous "MIN_VISIBLE_MS = 600" anti-flicker tax meant every cold
 * load waited 600ms even if hydration was already done — too expensive
 * for the mobile-first audience. Now the splash unmounts the moment
 * hydration flips; the CSS fade still smooths the visual transition.
 */
export function AppSplash() {
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return;
    setVisible(false);
  }, [hasHydrated]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading Nidlo"
      className="bg-background fixed inset-0 z-[200] flex flex-col items-center justify-center transition-opacity duration-300"
      style={{ opacity: hasHydrated ? 0 : 1 }}
    >
      <div className="text-foreground text-3xl font-bold tracking-tight">
        Nidlo
      </div>
      <p className="text-primary mt-2 text-sm tracking-widest uppercase">
        Where every stitch begins
      </p>
      <div className="bg-muted mt-8 h-1 w-32 overflow-hidden rounded-full">
        <div className="bg-primary h-full w-1/3 animate-[splash-bar_1.2s_ease-in-out_infinite] rounded-full" />
      </div>
    </div>
  );
}
