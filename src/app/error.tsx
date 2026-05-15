"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // The error boundary swallows the error from the console — log it so
    // the developer / Sentry can still see what blew up.
    console.error("App error:", error);
  }, [error]);

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
        <div className="bg-status-error-soft text-status-error ring-status-error/20 mx-auto flex size-16 items-center justify-center rounded-2xl ring-1">
          <AlertTriangle className="h-7 w-7" aria-hidden />
        </div>
        <p className="text-status-error mt-6 text-[11px] font-semibold tracking-[0.18em] uppercase">
          Unexpected error
        </p>
        <h1 className="text-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          Something went sideways.
        </h1>
        <p className="text-muted-foreground mt-3 text-sm">
          We hit a snag rendering this page. Try again, or head home and
          we&apos;ll pick up where you left off.
        </p>
        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="luxe"
            size="lg"
            onClick={reset}
            className="flex-1 gap-2"
          >
            <RotateCw className="h-4 w-4" aria-hidden />
            Try again
          </Button>
          <Button
            asChild
            variant="luxe-outline"
            size="lg"
            className="flex-1 gap-2"
          >
            <Link href="/">
              <Home className="h-4 w-4" aria-hidden />
              Home
            </Link>
          </Button>
        </div>
      </GlassCard>
    </main>
  );
}
