"use client";

import { useState } from "react";
import { Wallet, Plus, Star, Trash2, Phone, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useWalletAccounts,
  useWalletBalance,
  useResolveMomoAccount,
  useAddWalletAccount,
  useSetWalletPrimary,
  useRemoveWalletAccount,
} from "@/lib/hooks/use-wallet";
import { formatPesewas } from "@/lib/utils/order";
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
    <div className="space-y-4">
      {/* Balance Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-4 w-4" />
            Virtual Wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatPesewas(balance)}</p>
          <p className="text-xs text-muted-foreground">
            Earnings pending withdrawal
          </p>
        </CardContent>
      </Card>

      {/* Payout Accounts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Payout Accounts</CardTitle>
          {!showAdd && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdd(true)}
            >
              <Plus className="mr-1 h-3 w-3" />
              Add
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {accountsLoading && accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : accounts.length === 0 && !showAdd ? (
            <div className="rounded-lg border border-dashed p-4 text-center">
              <Phone className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No payout account yet. Add your MoMo number to receive
                payments.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setShowAdd(true)}
              >
                <Plus className="mr-1 h-3 w-3" />
                Add MoMo Account
              </Button>
            </div>
          ) : (
            accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {account.accountName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {account.accountNumber} &middot;{" "}
                      {account.networkLabel}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {account.isPrimary ? (
                    <Badge
                      variant="secondary"
                      className="border-0 bg-green-100 text-green-700"
                    >
                      Primary
                    </Badge>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetPrimary(account.id)}
                      disabled={settingPrimary}
                    >
                      <Star className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(account.id)}
                    disabled={removing}
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              </div>
            ))
          )}

          {/* Add Account Form */}
          {showAdd && (
            <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
              <div className="space-y-2">
                <Label>Network</Label>
                <Select
                  value={network}
                  onValueChange={(v) => {
                    setNetwork(v as MomoNetworkValue);
                    setResolvedName(null);
                  }}
                >
                  <SelectTrigger>
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
                <Label>Phone Number</Label>
                <Input
                  placeholder="+233241234567"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setResolvedName(null);
                  }}
                />
              </div>

              {!resolvedName ? (
                <Button
                  onClick={handleResolve}
                  disabled={resolving || phone.length < 10}
                  className="w-full"
                >
                  {resolving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Look Up Account
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-lg border bg-green-50 p-3">
                    <p className="text-xs text-muted-foreground">
                      Account Name
                    </p>
                    <p className="text-sm font-semibold">{resolvedName}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setResolvedName(null);
                        setShowAdd(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleConfirmAndAdd}
                      disabled={adding}
                    >
                      {adding && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Confirm & Add
                    </Button>
                  </div>
                </div>
              )}

              {!resolvedName && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setShowAdd(false);
                    setPhone("");
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
