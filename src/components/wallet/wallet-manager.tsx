"use client";

import { useState } from "react";
import { CheckCircle2, Phone, Plus, Star, Trash2, Wallet } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAddWalletAccount,
  useRemoveWalletAccount,
  useResolveMomoAccount,
  useSetWalletPrimary,
  useWalletAccounts,
  useWalletBalance,
} from "@/lib/hooks/use-wallet";
import { formatPesewas } from "@/lib/utils/order";
import { cn } from "@/lib/utils";
import type { MomoNetworkValue } from "@/types/graphql";

const NETWORK_OPTIONS: { value: MomoNetworkValue; label: string }[] = [
  { value: "mtn", label: "MTN Mobile Money" },
  { value: "telecel", label: "Telecel Cash" },
  { value: "at", label: "AT Money" },
];

export function WalletManager() {
  const { accounts, loading: accountsLoading, refetch } = useWalletAccounts();
  const { balance } = useWalletBalance();
  const { resolve, loading: resolving } = useResolveMomoAccount();
  const { addAccount, loading: adding } = useAddWalletAccount();
  const { setPrimary, loading: settingPrimary } = useSetWalletPrimary();
  const { removeAccount, loading: removing } = useRemoveWalletAccount();

  const [showAdd, setShowAdd] = useState(false);
  const [phone, setPhone] = useState("");
  const [network, setNetwork] = useState<MomoNetworkValue>("mtn");
  const [resolvedName, setResolvedName] = useState<string | null>(null);

  const handleResolve = async () => {
    try {
      const result = await resolve(phone, network);
      if (result) {
        setResolvedName(result.accountName);
        toast.success(`Account found: ${result.accountName}`);
      }
    } catch {
      toast.error("Could not resolve account. Check the number and try again.");
    }
  };

  const handleConfirmAndAdd = async () => {
    if (!resolvedName) return;
    try {
      await addAccount(phone, resolvedName, network);
      toast.success("Payout account added successfully");
      setShowAdd(false);
      setPhone("");
      setResolvedName(null);
      refetch();
    } catch {
      toast.error("Failed to add account");
    }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      await setPrimary(id);
      toast.success("Primary account updated");
      refetch();
    } catch {
      toast.error("Failed to update primary account");
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeAccount(id);
      toast.success("Account removed");
      refetch();
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Failed to remove account";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Balance hero card */}
      <GlassCard
        variant="solid"
        className="bg-thread-mesh relative overflow-hidden p-6 sm:p-8"
      >
        <div
          className="via-copper/40 pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent to-transparent"
          aria-hidden
        />
        <div className="text-copper flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] uppercase">
          <Wallet className="h-3.5 w-3.5" aria-hidden />
          Available balance
        </div>
        <p className="text-display mt-3 text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
          {formatPesewas(balance)}
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          Earnings ready to withdraw to your primary MoMo account.
        </p>
      </GlassCard>

      {/* Payout accounts */}
      <section>
        <header className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
              Payout
            </p>
            <h2 className="text-display mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">
              MoMo accounts
            </h2>
          </div>
          {!showAdd && accounts.length > 0 && (
            <Button
              variant="luxe-outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setShowAdd(true)}
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Add
            </Button>
          )}
        </header>

        <div className="space-y-3">
          {accountsLoading && accounts.length === 0 ? (
            <GlassCard variant="ghost" className="p-4">
              <p className="text-muted-foreground text-sm">Loading...</p>
            </GlassCard>
          ) : accounts.length === 0 && !showAdd ? (
            <GlassCard
              variant="solid"
              className="flex flex-col items-center py-12 text-center"
            >
              <span className="bg-secondary text-foreground flex size-14 items-center justify-center rounded-2xl">
                <Phone className="h-6 w-6" aria-hidden />
              </span>
              <h3 className="text-display mt-4 text-xl font-semibold tracking-tight">
                No payout account yet.
              </h3>
              <p className="text-muted-foreground mx-auto mt-1.5 max-w-xs text-sm">
                Add your MoMo number so we can deliver your earnings the moment
                an order is paid.
              </p>
              <Button
                variant="luxe"
                size="lg"
                className="mt-5 gap-1.5"
                onClick={() => setShowAdd(true)}
              >
                <Plus className="h-4 w-4" aria-hidden />
                Add MoMo account
              </Button>
            </GlassCard>
          ) : (
            accounts.map((account) => (
              <GlassCard
                key={account.id}
                variant="solid"
                className="flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="bg-secondary text-foreground ring-border flex size-10 shrink-0 items-center justify-center rounded-xl ring-1">
                    <Phone className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-display truncate text-sm font-semibold tracking-tight">
                      {account.accountName}
                    </p>
                    <p className="text-muted-foreground truncate text-xs tabular-nums">
                      {account.accountNumber}
                      <span className="text-muted-foreground/60"> · </span>
                      {account.networkLabel}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {account.isPrimary ? (
                    <span className="bg-copper/15 text-copper-soft ring-copper/30 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase ring-1">
                      <CheckCircle2 className="h-3 w-3" aria-hidden />
                      Primary
                    </span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleSetPrimary(account.id)}
                      disabled={settingPrimary}
                      aria-label="Make primary"
                      title="Make primary"
                    >
                      <Star className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleRemove(account.id)}
                    loading={removing}
                    aria-label="Remove account"
                    title="Remove account"
                    className="text-muted-foreground hover:bg-status-error-soft hover:text-status-error-fg"
                  >
                    {!removing && <Trash2 className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </GlassCard>
            ))
          )}

          {/* Add account form */}
          {showAdd && (
            <GlassCard variant="ghost" className="space-y-4 p-5">
              <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.16em] uppercase">
                {accounts.length === 0
                  ? "Add your first MoMo account"
                  : "Add another MoMo account"}
              </p>
              <div className="space-y-2">
                <Label className="text-sm">Network</Label>
                <Select
                  value={network}
                  onValueChange={(v) => {
                    setNetwork(v as MomoNetworkValue);
                    setResolvedName(null);
                  }}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NETWORK_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Phone number</Label>
                <div className="relative">
                  <Phone
                    className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                    aria-hidden
                  />
                  <Input
                    placeholder="+233 24 123 4567"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setResolvedName(null);
                    }}
                    autoComplete="tel"
                    inputMode="numeric"
                    className="h-11 pl-9 tabular-nums"
                  />
                </div>
              </div>

              {!resolvedName ? (
                <div className="flex flex-col gap-2 sm:flex-row-reverse">
                  <Button
                    variant="luxe"
                    size="lg"
                    onClick={handleResolve}
                    disabled={phone.length < 10}
                    loading={resolving}
                    loadingLabel="Looking up..."
                    className={cn("gap-1.5", "sm:flex-1")}
                  >
                    Look up account
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="text-muted-foreground"
                    onClick={() => {
                      setShowAdd(false);
                      setPhone("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="border-status-success-soft bg-status-success-soft/40 flex items-center gap-3 rounded-xl border p-3">
                    <CheckCircle2
                      className="text-status-success h-5 w-5 shrink-0"
                      aria-hidden
                    />
                    <div>
                      <p className="text-status-success-fg text-[11px] font-semibold tracking-[0.16em] uppercase">
                        Account verified
                      </p>
                      <p className="text-display mt-0.5 text-base font-semibold tracking-tight">
                        {resolvedName}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row-reverse">
                    <Button
                      variant="luxe"
                      size="lg"
                      className="gap-1.5 sm:flex-1"
                      onClick={handleConfirmAndAdd}
                      loading={adding}
                      loadingLabel="Adding..."
                    >
                      Confirm & add
                    </Button>
                    <Button
                      variant="ghost"
                      size="lg"
                      className="text-muted-foreground"
                      onClick={() => {
                        setResolvedName(null);
                        setShowAdd(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </GlassCard>
          )}
        </div>
      </section>
    </div>
  );
}
