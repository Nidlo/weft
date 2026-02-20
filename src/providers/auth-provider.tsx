"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/lib/stores/auth";
import { apolloClient } from "@/lib/graphql/client";
import { ME_QUERY } from "@/lib/graphql/queries/auth";
import type { MeData } from "@/types/graphql";
import type { UserRole } from "@/lib/stores/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser, setLoading, logout } = useAuthStore();
  const didValidate = useRef(false);

  useEffect(() => {
    if (didValidate.current) return;
    didValidate.current = true;

    if (!user) {
      setLoading(false);
      return;
    }

    // Validate the persisted session against the backend
    apolloClient
      .query<MeData>({ query: ME_QUERY, fetchPolicy: "network-only" })
      .then(({ data }) => {
        if (data?.me) {
          const me = data.me;
          const role = me.role?.toLowerCase() as UserRole | undefined;
          setUser({
            id: me.id,
            name: me.name || "",
            phone: me.phone || "",
            email: me.email,
            role: role ?? null,
            avatarUrl: me.avatarUrl,
            city: me.city,
            isOnboarded: !!me.role,
          });
        } else {
          logout();
        }
      })
      .catch(() => {
        // Session invalid — clear local state
        logout();
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
