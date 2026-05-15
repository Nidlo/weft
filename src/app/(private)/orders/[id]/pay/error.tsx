"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function PaymentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Payment page error:", error);
  }, [error]);

  const router = useRouter();

  return (
    <AppShell>
      <div className="mx-auto max-w-md">
        <div className="flex flex-col items-center space-y-6 py-12 text-center">
          <div className="bg-status-error-soft flex h-20 w-20 items-center justify-center rounded-full">
            <XCircle className="text-status-error h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Something went wrong</h2>
            <p className="text-muted-foreground text-sm">
              We couldn&apos;t load the payment page. Your card has not been
              charged.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
            <Button onClick={reset}>Try Again</Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
