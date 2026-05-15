"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConsent } from "@/lib/consent/use-consent";

/**
 * Cookie / tracking consent banner.
 *
 * Mounted at the root layout so it appears on every route (including
 * unauthenticated landing / search / designer-profile pages). Hidden once
 * the user has either accepted or declined - controlled entirely by the
 * `useConsent` hook so there is no separate dismissal state to keep in
 * sync.
 *
 * Why ESC doesn't record consent: a user who hits ESC was actively trying
 * to close the prompt without choosing. We treat that as "no decision
 * yet" so we don't silently opt them in OR out - they'll be reprompted on
 * the next page load. This is the privacy-safer default.
 */
export function CookieConsentBanner() {
  const { hasDecided, accept, decline } = useConsent();
  const acceptButtonRef = useRef<HTMLButtonElement>(null);
  // Defer mount until after hydration so the server-rendered HTML and the
  // first client render agree. SSR sees `hasDecided=false` (no
  // localStorage), so a decided user would otherwise get the banner in
  // their SSR HTML then have it disappear on hydration - a textbook
  // hydration mismatch. There's no architecturally cleaner way to do this
  // without lazy-importing the whole banner with `ssr: false`, which is
  // heavier for a tiny widget.
  const [hydrated, setHydrated] = useState(false);
  const [dismissedThisSession, setDismissedThisSession] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional client-only mount flip
    setHydrated(true);
  }, []);

  const visible = hydrated && !hasDecided && !dismissedThisSession;

  useEffect(() => {
    if (!visible) return;
    // Move focus to the primary action so keyboard / screen-reader users
    // land on something actionable. Use a short delay so the focus shift
    // happens after the appearance animation paints.
    const id = window.setTimeout(() => {
      acceptButtonRef.current?.focus();
    }, 50);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDismissedThisSession(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie & tracking consent"
      aria-live="polite"
      // bottom-20 on mobile clears the 16px bottom-nav (h-16) plus a 16px
      // gap; on >=md the nav is hidden so we drop to bottom-4.
      className="bg-background/95 fixed inset-x-3 bottom-20 z-50 mx-auto flex max-w-2xl flex-col gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-sm sm:flex-row sm:items-center sm:gap-4 md:bottom-4"
      data-testid="cookie-consent-banner"
    >
      <div className="bg-copper/10 ring-copper/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-1">
        <Cookie className="text-copper h-5 w-5" aria-hidden />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm font-semibold">A quick word on cookies</p>
        <p className="text-muted-foreground text-xs leading-relaxed">
          We use cookies to keep you signed in and remember your preferences.
          With your okay, we&apos;d also like to use analytics cookies to
          understand how Nidlo is used so we can improve it.{" "}
          <Link
            href="/cookies"
            className="text-copper font-medium underline-offset-2 hover:underline"
          >
            Read our cookie policy
          </Link>
          .
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={decline}
          data-testid="cookie-consent-decline"
        >
          Decline
        </Button>
        <Button
          ref={acceptButtonRef}
          variant="luxe"
          size="sm"
          onClick={accept}
          data-testid="cookie-consent-accept"
        >
          Accept
        </Button>
      </div>
    </div>
  );
}
