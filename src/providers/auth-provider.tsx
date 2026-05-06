"use client";

import { useEffect, useRef } from "react";
import { useAuthStore, useHasHydrated } from "@/lib/stores/auth";
import { apolloClient } from "@/lib/graphql/client";
import { ensureCsrfCookie } from "@/lib/graphql/csrf";
import { ME_QUERY } from "@/lib/graphql/queries/auth";
import type { MeData } from "@/types/graphql";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const logout = useAuthStore((s) => s.logout);
  const hasHydrated = useHasHydrated();
  const didValidate = useRef(false);

  useEffect(() => {
    // Prime the Sanctum XSRF-TOKEN cookie once per page load. The csrfLink
    // in apolloClient mirrors it as X-XSRF-TOKEN on every mutation; without
    // this, every state-changing request 419s. Catch is intentional — when
    // the backend is unreachable (dev with API down, brief network blip)
    // we don't want an unhandled-rejection in the console; the next
    // mutation will retry the prime via inflight semantics.
    ensureCsrfCookie().catch((err: unknown) => {
      if (process.env.NODE_ENV !== "production") {
        console.debug("[csrf] prime deferred:", err);
      }
    });
  }, []);

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
    // Intentional single-fire: run the Me validation once after hydration. The
    // `didValidate.current` ref guards re-runs; adding the rest of the deps
    // (user / setUser / logout) would trigger re-validation every time auth
    // state mutates and put us in a loop. (H14 documented.)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated]);

  return <>{children}</>;
}
