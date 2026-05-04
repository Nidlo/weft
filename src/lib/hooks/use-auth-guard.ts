"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth";

interface UseAuthGuardOptions {
  redirectTo?: string;
  requireOnboarded?: boolean;
  requireDesigner?: boolean;
  designerRedirectTo?: string;
  /**
   * Bounce already-onboarded users AWAY from this page (e.g. `/auth/role`
   * is only useful for authed-but-not-onboarded users; if you reach it
   * after onboarding you belong on `/dashboard`). Audit FE-NIDLO-AUTH-18
   * consolidates the inline `useEffect` previously rolled by `/auth/role`.
   */
  redirectOnboardedTo?: string;
}

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const {
    redirectTo = "/auth/phone",
    requireOnboarded = false,
    requireDesigner = false,
    designerRedirectTo = "/profile",
    redirectOnboardedTo,
  } = options;
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);

  useEffect(() => {
    // Wait for both hydration AND auth validation before redirecting
    if (!_hasHydrated || isLoading) return;

    if (!isAuthenticated) {
      router.replace(redirectTo);
      return;
    }

    if (requireOnboarded && user && !user.isOnboarded) {
      router.replace("/auth/role");
      return;
    }

    if (redirectOnboardedTo && user?.isOnboarded) {
      router.replace(redirectOnboardedTo);
      return;
    }

    if (requireDesigner && user && !user.isDesigner) {
      router.replace(designerRedirectTo);
    }
  }, [
    _hasHydrated,
    isAuthenticated,
    isLoading,
    user,
    requireOnboarded,
    requireDesigner,
    redirectTo,
    redirectOnboardedTo,
    designerRedirectTo,
    router,
  ]);

  const meetsDesignerRequirement = !requireDesigner || !!user?.isDesigner;
  const meetsOnboardedRequirement =
    !redirectOnboardedTo || !user?.isOnboarded;

  return {
    user,
    isAuthenticated,
    isLoading: !_hasHydrated || isLoading,
    isReady:
      _hasHydrated &&
      !isLoading &&
      isAuthenticated &&
      meetsDesignerRequirement &&
      meetsOnboardedRequirement,
  };
}
