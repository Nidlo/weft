"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { LOGOUT } from "@/lib/graphql/mutations/auth";
import { useAuthStore } from "@/lib/stores/auth";
import { apolloClient } from "@/lib/graphql/client";
import { toast } from "sonner";

export function useLogout() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const [logoutMutation, { loading }] = useMutation(LOGOUT);

  const handleLogout = useCallback(async () => {
    try {
      await logoutMutation();
    } catch {
      // Server logout failed — still clear local state
    }

    logout();
    await apolloClient.clearStore();
    router.replace("/auth/phone");
    toast.success("Signed out");
  }, [logoutMutation, logout, router]);

  return { logout: handleLogout, loading };
}
