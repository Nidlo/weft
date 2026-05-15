"use client";

import Link from "next/link";
import { ArrowLeft, Check, Cookie, ShieldCheck, X } from "lucide-react";

import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { useConsent } from "@/lib/consent/use-consent";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PrivacySettingsPage() {
  // requireOnboarded=false: a partially-onboarded user should still be able
  // to manage tracking choices, since the banner shows on unauthenticated
  // routes too.
  const { user, isReady } = useAuthGuard({ requireOnboarded: false });
  const { hasDecided, analytics, decidedAt, reset } = useConsent();

  if (!isReady || !user) {
    return (
      <AppShell>
        <div className="mx-auto max-w-xl space-y-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  const decidedAtPretty = decidedAt
    ? new Date(decidedAt).toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <AppShell>
      <div className="mx-auto max-w-xl space-y-7">
        <div>
          <Link
            href="/settings"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to settings
          </Link>
          <header className="mt-4">
            <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
              Privacy
            </p>
            <h1 className="text-display mt-2 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
              Privacy &amp; data choices
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Control what Nidlo can track and how we handle your data.
            </p>
          </header>
        </div>

        {/* Current cookie / analytics decision */}
        <GlassCard variant="solid" className="space-y-5 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="bg-copper/10 ring-copper/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-1">
              <Cookie className="text-copper h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-display text-base font-semibold tracking-tight">
                Cookies &amp; analytics
              </p>
              <p
                className="text-muted-foreground mt-1 text-sm"
                data-testid="consent-state-copy"
              >
                <ConsentStateCopy
                  hasDecided={hasDecided}
                  analytics={analytics}
                  decidedAtPretty={decidedAtPretty}
                />
              </p>
            </div>
          </div>

          <ul className="space-y-3 text-sm">
            <CategoryRow
              allowed
              title="Strictly necessary"
              detail="Sign-in session, CSRF protection, language preference. Always on."
            />
            <CategoryRow
              allowed
              title="Preferences"
              detail="Theme (light/dark) and similar low-risk settings. Always on."
            />
            <CategoryRow
              allowed={hasDecided ? analytics : null}
              title="Analytics"
              detail="Anonymised usage so we can improve Nidlo. Off until you opt in."
            />
            <CategoryRow
              allowed={false}
              title="Advertising / remarketing"
              detail="Nidlo doesn't use these and isn't planning to."
            />
          </ul>

          <div className="border-border/60 -mx-5 -mb-5 flex items-center justify-between gap-3 border-t px-5 py-4 sm:-mx-6 sm:-mb-6 sm:px-6">
            <p className="text-muted-foreground text-xs">
              Re-opening the banner lets you change your choices.
            </p>
            <Button
              variant="luxe-outline"
              size="sm"
              onClick={reset}
              data-testid="consent-reset"
            >
              Change my choices
            </Button>
          </div>
        </GlassCard>

        {/* Policy links */}
        <GlassCard variant="solid" className="space-y-2 p-5 sm:p-6">
          <p className="flex items-start gap-2 text-sm">
            <ShieldCheck
              className="text-copper mt-0.5 h-4 w-4 shrink-0"
              aria-hidden
            />
            <span>
              Read{" "}
              <Link
                href="/privacy"
                className="text-copper font-medium underline-offset-2 hover:underline"
              >
                our privacy policy
              </Link>{" "}
              for the full picture of what we collect and why, and{" "}
              <Link
                href="/cookies"
                className="text-copper font-medium underline-offset-2 hover:underline"
              >
                our cookie policy
              </Link>{" "}
              for the specifics on cookies and storage.
            </span>
          </p>
        </GlassCard>
      </div>
    </AppShell>
  );
}

function ConsentStateCopy({
  hasDecided,
  analytics,
  decidedAtPretty,
}: {
  hasDecided: boolean;
  analytics: boolean;
  decidedAtPretty: string | null;
}) {
  if (!hasDecided) {
    return (
      <>
        You haven&apos;t decided yet. The banner will appear next time you load
        Nidlo.
      </>
    );
  }
  if (analytics) {
    return (
      <>
        You accepted analytics cookies
        {decidedAtPretty ? ` on ${decidedAtPretty}` : ""}. Thank you — it helps
        us improve Nidlo.
      </>
    );
  }
  return (
    <>
      You declined analytics cookies
      {decidedAtPretty ? ` on ${decidedAtPretty}` : ""}. We won&apos;t track
      product analytics from this device.
    </>
  );
}

function CategoryRow({
  allowed,
  title,
  detail,
}: {
  /** true = always on, false = always off, null = waiting for user decision. */
  allowed: boolean | null;
  title: string;
  detail: string;
}) {
  const Icon = allowed === false ? X : Check;
  const tone =
    allowed === true
      ? "bg-status-success/15 text-status-success"
      : allowed === false
        ? "bg-muted text-muted-foreground"
        : "bg-copper/15 text-copper";
  const stateLabel =
    allowed === true ? "On" : allowed === false ? "Off" : "Pending";
  return (
    <li className="flex items-start gap-3">
      <span
        className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${tone}`}
        aria-label={stateLabel}
      >
        <Icon className="h-3.5 w-3.5" aria-hidden />
      </span>
      <span className="flex-1">
        <span className="text-foreground font-medium">{title}</span>
        <span className="text-muted-foreground mt-0.5 block text-xs">
          {detail}
        </span>
      </span>
    </li>
  );
}
