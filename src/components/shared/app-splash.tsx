"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/stores/auth";

// Minimum visible duration so a fast hydration doesn't show a one-frame flash.
const MIN_VISIBLE_MS = 600;

/**
 * Brand splash that renders for the duration of the Zustand hydration step
 * (and until `MIN_VISIBLE_MS` has elapsed). Without this, PWA cold-starts
 * showed a flash of un-styled / unhydrated content before `AuthProvider`
 * settled. After hydration the splash fades out.
 */
export function AppSplash() {
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const [mountedAt] = useState(() => Date.now());
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return;
    const elapsed = Date.now() - mountedAt;
    const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);
    const id = setTimeout(() => setVisible(false), remaining);
    return () => clearTimeout(id);
  }, [hasHydrated, mountedAt]);

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
