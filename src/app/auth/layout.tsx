"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated || isLoading) return;

    if (isAuthenticated) {
      // Authenticated users should NOT be on /auth/phone or /auth/verify
      if (pathname === "/auth/phone" || pathname === "/auth/verify") {
        router.replace(user?.isOnboarded ? "/dashboard" : "/auth/role");
        return;
      }

      // Authenticated users on /auth/role who are already onboarded → dashboard
      if (pathname === "/auth/role" && user?.isOnboarded) {
        router.replace("/dashboard");
        return;
      }
    } else {
      // Unauthenticated users should NOT be on /auth/role (need to log in first)
      if (pathname === "/auth/role") {
        router.replace("/auth/phone");
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, pathname, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            StitchHub
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Custom fashion, connected
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
