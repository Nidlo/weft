"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth";

interface UseAuthGuardOptions {
  redirectTo?: string;
  requireOnboarded?: boolean;
}

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const { redirectTo = "/auth/phone", requireOnboarded = false } = options;
  const router = useRouter();
  const { user, isAuthenticated, isLoading, _hasHydrated } = useAuthStore();

  useEffect(() => {
    // Wait for both hydration AND auth validation before redirecting
    if (!_hasHydrated || isLoading) return;

    if (!isAuthenticated) {
      router.replace(redirectTo);
      return;
    }

    if (requireOnboarded && user && !user.isOnboarded) {
      router.replace("/auth/role");
    }
  }, [_hasHydrated, isAuthenticated, isLoading, user, requireOnboarded, redirectTo, router]);

  return {
    user,
    isAuthenticated,
    isLoading: !_hasHydrated || isLoading,
    isReady: _hasHydrated && !isLoading && isAuthenticated,
  };
}
