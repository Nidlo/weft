"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  ShieldOff,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { useAuthStore } from "@/lib/stores/auth";
import { useOnboardingStore } from "@/lib/stores/onboarding";
import { useClientOnboardingStore } from "@/lib/stores/client-onboarding";
import { useBlueprintStore } from "@/lib/stores/blueprint";
import { apolloClient } from "@/lib/graphql/client";
import { DELETE_MY_ACCOUNT } from "@/lib/graphql/mutations/auth";
import type { DeleteMyAccountData } from "@/types/graphql";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Mode = "soft" | "immediate";

const CONFIRM_PHRASE = "DELETE";

export default function DeleteAccountPage() {
  const router = useRouter();
  const { user, isReady } = useAuthGuard({ requireOnboarded: false });
  const resetAuth = useAuthStore((s) => s.logout);

  const [mode, setMode] = useState<Mode>("soft");
  const [confirmInput, setConfirmInput] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteMyAccount, { loading }] = useMutation<
    DeleteMyAccountData,
    { immediate?: boolean }
  >(DELETE_MY_ACCOUNT);

  const handleDelete = useCallback(async () => {
    try {
      const { data } = await deleteMyAccount({
        variables: { immediate: mode === "immediate" },
      });

      // Reset every user-scoped store the same way useLogout does, so a
      // restore (or a fresh signup on the same device) doesn't inherit
      // stale wizard drafts.
      resetAuth();
      useOnboardingStore.getState().reset();
      useClientOnboardingStore.getState().reset();
      useBlueprintStore.getState().reset();
      await apolloClient.clearStore();

      const result = data?.deleteMyAccount;
      if (result?.immediate) {
        toast.success("Account deleted. We're sorry to see you go.");
      } else if (result?.recoverableUntil) {
        const until = new Date(result.recoverableUntil);
        toast.success(
          `Account deactivated. Sign back in before ${until.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })} to restore it.`
        );
      } else {
        toast.success("Account deactivated.");
      }

      router.replace("/auth/phone");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not delete account";
      toast.error(message);
      setConfirmOpen(false);
    }
  }, [deleteMyAccount, mode, resetAuth, router]);

  if (!isReady || !user) {
    return (
      <AppShell>
        <div className="mx-auto max-w-xl space-y-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  const phraseOk = confirmInput.trim().toUpperCase() === CONFIRM_PHRASE;

  return (
    <AppShell>
      <div className="mx-auto max-w-xl space-y-7">
        <div>
          <Link
            href="/settings"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to settings
          </Link>
          <header className="mt-4">
            <p className="text-status-error text-[11px] font-semibold tracking-[0.18em] uppercase">
              Danger zone
            </p>
            <h1 className="text-display mt-2 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
              Delete account
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              You can deactivate your Nidlo account now and decide for sure
              later. Read on for the details before you confirm.
            </p>
          </header>
        </div>

        <GlassCard variant="solid" className="space-y-5 p-5 sm:p-6">
          <fieldset>
            <legend className="sr-only">Choose how to delete</legend>

            <DeleteModeOption
              id="mode-soft"
              checked={mode === "soft"}
              onSelect={() => setMode("soft")}
              icon={Clock}
              title="Deactivate with a 30-day window"
              description="Your account is hidden right away. Sign back in within 30 days from any device and we restore everything. After 30 days the data is permanently and irreversibly removed."
              recommended
            />

            <DeleteModeOption
              id="mode-immediate"
              checked={mode === "immediate"}
              onSelect={() => setMode("immediate")}
              icon={ShieldOff}
              title="Delete immediately"
              description="Skip the 30-day window. Your data is permanently deleted right away and cannot be restored. Choose this only if you are certain."
            />
          </fieldset>

          <div className="border-status-error/30 bg-status-error/5 text-status-error-fg rounded-xl border p-4 text-sm">
            <p className="flex items-start gap-2">
              <AlertTriangle
                className="text-status-error mt-0.5 h-4 w-4 shrink-0"
                aria-hidden
              />
              <span>
                In both modes, in-flight orders need to be settled (delivered or
                refunded through the original payment method) with the other
                party before the deletion finishes. Tax and
                anti-money-laundering records we are required to keep continue
                to live in restricted, audited storage.{" "}
                <Link
                  href="/data-deletion"
                  className="text-status-error font-medium underline-offset-2 hover:underline"
                >
                  Read the full policy
                </Link>
                .
              </span>
            </p>
          </div>

          <div>
            <label
              htmlFor="confirm-delete"
              className="text-foreground block text-sm font-medium"
            >
              Type <span className="font-mono">{CONFIRM_PHRASE}</span> to enable
              the delete button
            </label>
            <input
              id="confirm-delete"
              type="text"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              className="border-input bg-background/60 focus:border-status-error mt-2 h-11 w-full rounded-xl border-2 px-4 font-mono text-base outline-none"
              aria-describedby="confirm-delete-help"
            />
            <p
              id="confirm-delete-help"
              className="text-muted-foreground mt-1.5 text-xs"
            >
              We ask for this so a misclick cannot delete your account.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => router.push("/settings")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="lg"
              className="gap-1.5"
              onClick={() => setConfirmOpen(true)}
              disabled={!phraseOk || loading}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              {mode === "immediate"
                ? "Delete permanently now"
                : "Deactivate my account"}
            </Button>
          </div>
        </GlassCard>
      </div>

      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => !loading && setConfirmOpen(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-display text-2xl font-semibold tracking-tight">
              {mode === "immediate"
                ? "Delete permanently?"
                : "Deactivate this account?"}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              {mode === "immediate" ? (
                <>
                  Your account and all the personal data we hold about you will
                  be removed straight away. There is no restore. Are you sure?
                </>
              ) : (
                <>
                  Your account will be hidden immediately. Sign back in with
                  this phone number within 30 days and we will restore
                  everything. After 30 days the data is permanently removed.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setConfirmOpen(false)}
              disabled={loading}
            >
              Not yet
            </Button>
            <Button
              variant="destructive"
              size="lg"
              className="gap-1.5"
              onClick={handleDelete}
              loading={loading}
              loadingLabel={
                mode === "immediate" ? "Deleting..." : "Deactivating..."
              }
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              {mode === "immediate" ? "Yes, delete" : "Yes, deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

interface DeleteModeOptionProps {
  id: string;
  checked: boolean;
  onSelect: () => void;
  icon: typeof Clock;
  title: string;
  description: string;
  recommended?: boolean;
}

function DeleteModeOption({
  id,
  checked,
  onSelect,
  icon: Icon,
  title,
  description,
  recommended,
}: DeleteModeOptionProps) {
  return (
    <label
      htmlFor={id}
      className={
        checked
          ? "border-copper bg-copper/5 mb-3 flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-colors last:mb-0"
          : "border-border bg-background/40 hover:border-foreground/40 mb-3 flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-colors last:mb-0"
      }
    >
      <input
        id={id}
        type="radio"
        name="delete-mode"
        checked={checked}
        onChange={onSelect}
        className="accent-copper mt-1 h-4 w-4"
      />
      <span className="bg-muted text-foreground ring-border flex size-9 shrink-0 items-center justify-center rounded-lg ring-1">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="flex-1">
        <span className="text-display flex items-center gap-2 text-sm font-semibold tracking-tight">
          {title}
          {recommended && (
            <span className="border-copper/40 bg-copper/10 text-copper-soft rounded-full border px-1.5 py-0 text-[9px] font-semibold tracking-wider uppercase">
              Recommended
            </span>
          )}
        </span>
        <span className="text-muted-foreground mt-1 block text-xs leading-relaxed">
          {description}
        </span>
      </span>
    </label>
  );
}
