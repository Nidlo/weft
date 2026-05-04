"use client";

import { Header } from "./header";
import { MobileNav } from "./mobile-nav";
import { TermsReacceptDialog } from "@/components/legal/terms-reaccept-dialog";
import { useAuthStore } from "@/lib/stores/auth";

export function AppShell({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  // Show mobile nav if authenticated (or if hydrated and auth state is true)
  const showMobileNav = hasHydrated && isAuthenticated;

  return (
    <div className="relative min-h-dvh">
      <Header />
      <main
        className={`mx-auto max-w-7xl px-4 py-4 ${showMobileNav ? "pb-20 md:pb-4" : ""}`}
      >
        {children}
      </main>
      {showMobileNav && <MobileNav />}
      {showMobileNav && <TermsReacceptDialog />}
    </div>
  );
}
