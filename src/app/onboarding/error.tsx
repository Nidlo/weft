"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function OnboardingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Onboarding error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-status-error-soft">
        <XCircle className="h-10 w-10 text-status-error" />
      </div>
      <h2 className="mt-6 text-xl font-bold">Something went wrong</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        We couldn&apos;t load this step. Your progress has been saved — try again or
        go back to the start.
      </p>
      <div className="mt-6 flex gap-3">
        <Button variant="outline" asChild>
          <Link href="/dashboard">Skip for now</Link>
        </Button>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}
