"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LEGAL_VERSIONS } from "@/lib/graphql/queries/auth";
import { ACCEPT_UPDATED_TERMS } from "@/lib/graphql/mutations/auth";
import { useAuthStore } from "@/lib/stores/auth";
import type { LegalVersionsData, GqlUser } from "@/types/graphql";

interface AcceptUpdatedTermsData {
  acceptUpdatedTerms: Pick<GqlUser, "id" | "termsAcceptedVersion">;
}

/**
 * Modal that fires when an authenticated user is sitting on a stale
 * `terms_accepted_version`. Non-dismissible — users must view + accept the
 * updated terms (or sign out) to continue using the app. Wired into
 * AppShell so it's globally available on every authed route.
 *
 * Closes audit FE-NIDLO-SETTINGS-05 / BE-NIDLO-LAUNCH-07.
 */
export function TermsReacceptDialog() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  const { data } = useQuery<LegalVersionsData>(LEGAL_VERSIONS, {
    skip: !hasHydrated || !isAuthenticated,
    fetchPolicy: "cache-first",
  });

  const [accept, { loading }] =
    useMutation<AcceptUpdatedTermsData>(ACCEPT_UPDATED_TERMS);
  const [error, setError] = useState<string | null>(null);

  const currentVersion = data?.legalVersions.termsVersion;
  const acceptedVersion = user?.termsAcceptedVersion;

  // Surface the dialog only when:
  //   1. Hydration finished and the user is authed (avoids flicker on guests).
  //   2. The BE responded with the current version.
  //   3. The user's stamped version is non-null and not equal to current.
  // A null `acceptedVersion` is treated as legacy-pre-versioning — those users
  // are handled by the onboarding wizard, not this dialog.
  const open = Boolean(
    hasHydrated &&
      isAuthenticated &&
      currentVersion &&
      acceptedVersion &&
      acceptedVersion !== currentVersion,
  );

  const handleAccept = async () => {
    setError(null);
    try {
      const result = await accept();
      const updated = result.data?.acceptUpdatedTerms;
      if (updated && user) {
        setUser({ ...user, termsAcceptedVersion: updated.termsAcceptedVersion });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't record your acceptance. Try again.",
      );
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-lg"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>We&apos;ve updated our Terms</DialogTitle>
          <DialogDescription>
            Our Terms of Service changed since you last accepted. Please review
            and re-accept to continue using Nidlo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            Your accepted version: <strong>{acceptedVersion ?? "—"}</strong>
          </p>
          <p>
            Current version: <strong>{currentVersion ?? "—"}</strong>
          </p>
          <p>
            <Link
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4"
            >
              Read the updated Terms
            </Link>
          </p>
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button onClick={handleAccept} disabled={loading}>
            {loading ? "Accepting..." : "I accept the updated Terms"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
