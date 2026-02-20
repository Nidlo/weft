"use client";

import { Header } from "./header";
import { MobileNav } from "./mobile-nav";
import { useAuthStore } from "@/lib/stores/auth";

export function AppShell({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <div className="relative min-h-dvh">
      <Header />
      <main className={`mx-auto max-w-7xl px-4 py-4 ${isAuthenticated ? "pb-20 md:pb-4" : ""}`}>
        {children}
      </main>
      {isAuthenticated && <MobileNav />}
    </div>
  );
}
