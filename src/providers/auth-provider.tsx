"use client";

import { useEffect, useRef } from "react";
import { useAuthStore, useHasHydrated } from "@/lib/stores/auth";
import { apolloClient } from "@/lib/graphql/client";
import { ME_QUERY } from "@/lib/graphql/queries/auth";
import type { MeData } from "@/types/graphql";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser, setLoading, logout } = useAuthStore();
  const hasHydrated = useHasHydrated();
  const didValidate = useRef(false);

  useEffect(() => {
    // Wait for Zustand to rehydrate from localStorage before making decisions
    if (!hasHydrated) return;
    if (didValidate.current) return;
    didValidate.current = true;

    if (!user) {
      setLoading(false);
      return;
    }

    // Validate the persisted session against the backend.
    // The session cookie is sent automatically via credentials: 'include'.
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
      .catch((err: unknown) => {
        // Only logout on explicit auth errors (session expired/invalidated).
        // Network errors or backend-down should NOT log the user out —
        // keep them authenticated optimistically with cached profile data.
        const graphQLErrors =
          err instanceof Object &&
          "graphQLErrors" in err &&
          Array.isArray((err as Record<string, unknown>).graphQLErrors)
            ? (
                err as {
                  graphQLErrors: Array<{
                    message: string;
                    extensions?: { category?: string };
                  }>;
                }
              ).graphQLErrors
            : [];

        const isAuthError = graphQLErrors.some(
          (e) =>
            e.message === "Unauthenticated." ||
            e.extensions?.category === "authentication"
        );

        if (isAuthError) {
          logout();
        } else {
          // Network error — keep user logged in with cached data
          setLoading(false);
        }
      });
  }, [hasHydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
