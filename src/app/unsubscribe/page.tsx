import type { Metadata } from "next";
import Link from "next/link";
import { BellOff, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

export const metadata: Metadata = {
  title: "Unsubscribe",
  description: "Manage your Nidlo email preferences.",
  robots: { index: false, follow: false },
};

interface UnsubscribePageProps {
  searchParams: Promise<{ token?: string | string[] }>;
}

export default async function UnsubscribePage({
  searchParams,
}: UnsubscribePageProps) {
  const params = await searchParams;
  const tokenRaw = params.token;
  const token = Array.isArray(tokenRaw) ? tokenRaw[0] : tokenRaw;
  const hasToken = Boolean(token && token.trim());

  return (
    <main className="relative flex min-h-[80vh] flex-col items-center justify-center bg-thread-mesh px-4 py-16">
      <GlassCard
        variant="solid"
        className="relative w-full max-w-md overflow-hidden p-8 text-center sm:p-10"
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-copper/40 to-transparent"
          aria-hidden
        />
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-copper/15 text-copper-soft ring-1 ring-copper/30">
          <BellOff className="h-7 w-7" aria-hidden />
        </div>
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">
          Email preferences
        </p>
        {hasToken ? (
          <>
            <h1 className="text-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              You&apos;re unsubscribing
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              We&apos;ve received your request. While we finish the one-click
              flow, sign in to fine-tune which emails you receive — including
              the option to turn them all off.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Manage email preferences
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              We didn&apos;t find an unsubscribe token in this link. Sign in
              and adjust which emails you receive from Nidlo on the preferences
              page.
            </p>
          </>
        )}
        <Button asChild variant="luxe" size="lg" className="mt-8 w-full gap-2">
          <Link href="/notifications/preferences">
            <Settings className="h-4 w-4" aria-hidden />
            Manage all preferences
          </Link>
        </Button>
      </GlassCard>
    </main>
  );
}
