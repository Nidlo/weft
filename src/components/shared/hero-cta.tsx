"use client";

import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/auth";

/**
 * Home-page hero CTA pair. Branches on auth state - "Get started" pre-auth,
 * "My dashboard" once signed in. Hidden until hydration to avoid label
 * flash, but the wrapper still reserves vertical space.
 */
export function HeroCta() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const user = useAuthStore((s) => s.user);

  if (!hasHydrated) {
    return <div className="mt-10 h-13" aria-hidden />;
  }

  const authed = isAuthenticated && user;

  return (
    <div
      data-tour-id="home.hero-cta"
      className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4"
    >
      {authed ? (
        <>
          <Button variant="luxe" size="xl" asChild>
            <Link href="/search">
              Browse designers <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="luxe-outline" size="xl" asChild>
            <Link href="/dashboard">
              <Compass className="mr-1 h-4 w-4" />
              My dashboard
            </Link>
          </Button>
        </>
      ) : (
        <>
          <Button variant="luxe" size="xl" asChild>
            <Link href="/auth/phone">
              Get started <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="luxe-outline" size="xl" asChild>
            <Link href="/search">
              <Compass className="mr-1 h-4 w-4" />
              Browse designers
            </Link>
          </Button>
        </>
      )}
    </div>
  );
}
