"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/auth";

/**
 * Client island for the home-page hero CTAs. Branches on auth state so the
 * label switches from "Get Started" → "My Dashboard" once the user is
 * signed in. Hidden until hydration to avoid a label flash.
 */
export function HeroCta() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const user = useAuthStore((s) => s.user);

  // Reserve layout until hydrated so the buttons don't flicker swap.
  if (!hasHydrated) {
    return <div className="mt-8 h-11" aria-hidden />;
  }

  const authed = isAuthenticated && user;

  return (
    <div className="mt-8 flex gap-4">
      {authed ? (
        <>
          <Button size="lg" asChild>
            <Link href="/search">Browse Designers</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/dashboard">My Dashboard</Link>
          </Button>
        </>
      ) : (
        <>
          <Button size="lg" asChild>
            <Link href="/auth/phone">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/search">Browse Designers</Link>
          </Button>
        </>
      )}
    </div>
  );
}
