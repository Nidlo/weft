"use client";

import { useAuthStore } from "@/lib/stores/auth";

/**
 * QA-AD-USER-012 — Sticky top banner that surfaces an active admin
 * impersonation session. Reads `isImpersonated` + `impersonatorEmail` off
 * the auth store (sourced from the GraphQL `me` query) and links to the
 * backend's stop endpoint, which clears the impersonation session and
 * returns the operator to /admin.
 *
 * Renders nothing for normal sessions (the most common case), so cost on
 * the happy path is one cheap selector read.
 */
export function ImpersonationBanner() {
  const isImpersonated = useAuthStore(
    (state) => state.user?.isImpersonated ?? false,
  );
  const impersonatorEmail = useAuthStore(
    (state) => state.user?.impersonatorEmail ?? null,
  );
  const target = useAuthStore((state) => state.user);

  if (!isImpersonated) {
    return null;
  }

  // The backend's POST /admin/impersonate/{user} redirects here on the
  // way in. The stop route accepts both GET and POST so the banner can
  // be a plain link — no need to forge a CSRF token from the FE.
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
  const stopUrl = apiUrl.replace(/\/graphql$/, "") + "/admin/impersonate-stop";

  const targetLabel = target?.fullName ?? target?.email ?? target?.phone ?? "this user";

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="impersonation-banner"
      className="sticky top-0 z-50 w-full border-b border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
    >
      <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-2 text-sm">
        <div>
          <span className="font-semibold">Acting as {targetLabel}.</span>{" "}
          {impersonatorEmail ? (
            <span>Return to your admin session ({impersonatorEmail}).</span>
          ) : (
            <span>Return to your admin session.</span>
          )}
        </div>
        <a
          href={stopUrl}
          className="rounded-md bg-amber-900 px-3 py-1 font-medium text-amber-50 transition hover:bg-amber-800 dark:bg-amber-200 dark:text-amber-950 dark:hover:bg-amber-100"
        >
          Stop impersonating
        </a>
      </div>
    </div>
  );
}
