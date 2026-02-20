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
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace(redirectTo);
      return;
    }

    if (requireOnboarded && user && !user.isOnboarded) {
      router.replace("/auth/role");
    }
  }, [isAuthenticated, isLoading, user, requireOnboarded, redirectTo, router]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isReady: !isLoading && isAuthenticated,
  };
}
