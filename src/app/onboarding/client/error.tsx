"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

export default function ClientOnboardingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Client onboarding error:", error);
  }, [error]);

  return (
    <div className="bg-thread-mesh flex min-h-dvh flex-col items-center justify-center p-6">
      <GlassCard variant="solid" className="w-full max-w-md p-8 text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-status-error-soft text-status-error">
          <AlertTriangle className="h-7 w-7" aria-hidden />
        </span>
        <h2 className="text-display mt-5 text-2xl font-semibold tracking-tight">
          Something went wrong.
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn&apos;t load this step. Your progress has been saved — try
          again or jump to your dashboard.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          <Button variant="luxe-outline" size="lg" asChild>
            <Link href="/dashboard">Skip for now</Link>
          </Button>
          <Button variant="luxe" size="lg" onClick={reset} className="gap-1.5">
            <RotateCw className="h-4 w-4" aria-hidden />
            Try again
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
