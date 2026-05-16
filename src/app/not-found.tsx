import Link from "next/link";
import { Compass, Home, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

export default function NotFound() {
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
          <Compass className="h-7 w-7" aria-hidden />
        </div>
        <p className="text-copper mt-6 text-[11px] font-semibold tracking-[0.18em] uppercase tabular-nums">
          404
        </p>
        <h1 className="text-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          We can&apos;t find that page.
        </h1>
        <p className="text-muted-foreground mt-3 text-sm">
          The link may be broken or the page has moved. Pick a path below to get
          back on track.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="luxe" size="lg" className="flex-1 gap-2">
            <Link href="/">
              <Home className="h-4 w-4" aria-hidden />
              Home
            </Link>
          </Button>
          <Button
            asChild
            variant="luxe-outline"
            size="lg"
            className="flex-1 gap-2"
          >
            <Link href="/search">
              <Search className="h-4 w-4" aria-hidden />
              Browse designers
            </Link>
          </Button>
        </div>
      </GlassCard>
    </main>
  );
}
