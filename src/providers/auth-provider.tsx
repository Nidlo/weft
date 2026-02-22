"use client";

import { useEffect, useRef } from "react";
import { useAuthStore, useHasHydrated } from "@/lib/stores/auth";
import { apolloClient } from "@/lib/graphql/client";
import { ME_QUERY } from "@/lib/graphql/queries/auth";
import type { MeData } from "@/types/graphql";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, token, setUser, setLoading, logout } = useAuthStore();
  const hasHydrated = useHasHydrated();
  const didValidate = useRef(false);

  useEffect(() => {
    // Wait for Zustand to rehydrate from localStorage before making decisions
    if (!hasHydrated) return;
    if (didValidate.current) return;
    didValidate.current = true;

    if (!user || !token) {
      setLoading(false);
      return;
    }

    // Validate the persisted session against the backend
    apolloClient
      .query<MeData>({ query: ME_QUERY, fetchPolicy: "network-only" })
      .then(({ data }) => {
        if (data?.me) {
          const me = data.me;
          setUser({
            id: me.id,
            firstName: me.firstName,
            lastName: me.lastName,
            fullName: me.fullName,
            phone: me.phone || "",
            email: me.email,
            avatarUrl: me.avatarUrl,
            city: me.city,
            isDesigner: me.isDesigner,
            isOnboarded: me.isOnboarded,
          });
        } else {
          logout();
        }
      })
      .catch(() => {
        // Session invalid — clear local state
        logout();
      });
  }, [hasHydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
