"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth";

/**
 * Inverse of useAuthGuard — protects guest-only pages.
 * Redirects authenticated users to the correct destination:
 *   - Not onboarded → /auth/role
 *   - Onboarded     → /dashboard
 */
export function useGuestGuard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) return;

    if (!user?.isOnboarded) {
      router.replace("/auth/role");
    } else {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, user, router]);

  return {
    isGuest: !isLoading && !isAuthenticated,
    isLoading,
  };
}
