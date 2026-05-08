"use client";

import { Header } from "./header";
import { MobileNav } from "./mobile-nav";
import { TermsReacceptDialog } from "@/components/legal/terms-reaccept-dialog";
import { useAuthStore } from "@/lib/stores/auth";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  /**
   * `bare` mode skips the `max-w-7xl px-4 py-4` constraint on `<main>`,
   * letting the page render full-bleed sections (hero, gallery, etc.).
   * The page is then responsible for its own internal padding.
   */
  bare?: boolean;
}

export function AppShell({ children, bare = false }: AppShellProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  const showMobileNav = hasHydrated && isAuthenticated;

  return (
    <div className="relative min-h-dvh">
      <Header />
      <main
        className={cn(
          bare ? "" : "mx-auto max-w-7xl px-4 py-4",
          showMobileNav && (bare ? "pb-20 md:pb-0" : "pb-20 md:pb-4")
        )}
      >
        {children}
      </main>
      {showMobileNav && <MobileNav />}
      {showMobileNav && <TermsReacceptDialog />}
    </div>
  );
}
