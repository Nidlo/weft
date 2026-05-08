"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { LOGOUT, SIGN_OUT_ALL_DEVICES } from "@/lib/graphql/mutations/auth";
import { useAuthStore } from "@/lib/stores/auth";
import { useOnboardingStore } from "@/lib/stores/onboarding";
import { useClientOnboardingStore } from "@/lib/stores/client-onboarding";
import { useBlueprintStore } from "@/lib/stores/blueprint";
import { apolloClient } from "@/lib/graphql/client";
import { toast } from "sonner";

/**
 * Clear every persisted Zustand store that holds user-scoped form data.
 * On a shared device, signing out and signing in as someone else must
 * NOT pre-fill the new user's wizards with the previous user's drafts.
 */
function clearUserScopedStores(): void {
  useOnboardingStore.getState().reset();
  useClientOnboardingStore.getState().reset();
  useBlueprintStore.getState().reset();
}

export function useLogout() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const [logoutMutation, { loading }] = useMutation(LOGOUT);

  const handleLogout = useCallback(async () => {
    try {
      // Backend invalidates session + revokes all tokens
      await logoutMutation();
    } catch {
      // Server logout failed - still clear local state
    }

    logout(); // Clears Zustand user + resets CSRF state
    clearUserScopedStores();
    await apolloClient.clearStore();
    router.replace("/auth/phone");
    toast.success("Signed out");
  }, [logoutMutation, logout, router]);

  return { logout: handleLogout, loading };
}

/**
 * Sign out of every device the user is logged in on. Revokes all Sanctum
 * tokens AND deletes every session row server-side, then clears local state
 * the same way `useLogout` does.
 */
export function useSignOutAllDevices() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const [signOutAllMutation, { loading }] = useMutation(SIGN_OUT_ALL_DEVICES);

  const handleSignOutAll = useCallback(async () => {
    try {
      await signOutAllMutation();
    } catch {
      // Mutation failed — still clear local state on this device.
    }

    logout();
    clearUserScopedStores();
    await apolloClient.clearStore();
    router.replace("/auth/phone");
    toast.success("Signed out everywhere");
  }, [signOutAllMutation, logout, router]);

  return { signOutAll: handleSignOutAll, loading };
}
