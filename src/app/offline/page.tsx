import type { Metadata } from "next";
import Link from "next/link";
import { Home, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

export const metadata: Metadata = {
  title: "You're offline",
  description: "Nidlo can't reach the network right now.",
};

export default function OfflinePage() {
  return (
    <main className="bg-thread-mesh relative flex min-h-[80vh] flex-col items-center justify-center px-4 py-16">
      <GlassCard
        variant="solid"
        className="relative w-full max-w-md overflow-hidden p-8 text-center sm:p-10"
      >
        <div
          className="via-copper/40 pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent to-transparent"
          aria-hidden
        />
        <div className="bg-copper/15 text-copper-soft ring-copper/30 mx-auto flex size-16 items-center justify-center rounded-2xl ring-1">
          <WifiOff className="h-7 w-7" aria-hidden />
        </div>
        <p className="text-copper mt-6 text-[11px] font-semibold tracking-[0.18em] uppercase">
          Connection lost
        </p>
        <h1 className="text-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          You&apos;re offline
        </h1>
        <p className="text-muted-foreground mt-3 text-sm">
          Nidlo can&apos;t reach the network right now. Once your connection is
          back, you&apos;ll be able to browse designers and place orders again.
        </p>
        <Button asChild variant="luxe" size="lg" className="mt-8 w-full gap-2">
          <Link href="/">
            <Home className="h-4 w-4" aria-hidden />
            Try the home page
          </Link>
        </Button>
      </GlassCard>
    </main>
  );
}
