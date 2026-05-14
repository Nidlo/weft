"use client";

import { useMutation, useQuery } from "@apollo/client/react";

import {
  RESOLVE_MOMO_ACCOUNT,
  ADD_WALLET_ACCOUNT,
  SET_WALLET_PRIMARY,
  REMOVE_WALLET_ACCOUNT,
} from "@/lib/graphql/mutations/wallet";
import {
  MY_WALLET_ACCOUNTS,
  MY_EARNINGS_SUMMARY,
} from "@/lib/graphql/queries/earnings";
import type {
  ResolveMomoAccountData,
  AddWalletAccountData,
  SetWalletPrimaryData,
  RemoveWalletAccountData,
  MyWalletAccountsData,
  MyEarningsSummaryData,
  MomoNetworkValue,
} from "@/types/graphql";

// ── Payout-account registry ────────────────────────────────────────
// The MoMo numbers the designer has registered to RECEIVE earnings.
// Server-side the table is `wallet_accounts`; the UI calls them
// "payout accounts" because we don't hold a balance, we route payments.

export function usePayoutAccounts() {
  const { data, loading, error, refetch } = useQuery<MyWalletAccountsData>(
    MY_WALLET_ACCOUNTS,
    { fetchPolicy: "cache-and-network" }
  );

  return {
    accounts: data?.myWalletAccounts ?? [],
    loading,
    error,
    refetch,
  };
}

export function useResolveMomoAccount() {
  const [mutate, { loading, error }] =
    useMutation<ResolveMomoAccountData>(RESOLVE_MOMO_ACCOUNT);

  const resolve = async (phone: string, network: MomoNetworkValue) => {
    const result = await mutate({
      variables: { input: { phone, network } },
    });
    return result.data?.resolveMomoAccount ?? null;
  };

  return { resolve, loading, error };
}

export function useAddPayoutAccount() {
  const [mutate, { loading, error }] = useMutation<AddWalletAccountData>(
    ADD_WALLET_ACCOUNT,
    { refetchQueries: [{ query: MY_WALLET_ACCOUNTS }] }
  );

  const addAccount = async (
    accountNumber: string,
    accountName: string,
    network: MomoNetworkValue
  ) => {
    const result = await mutate({
      variables: { input: { accountNumber, accountName, network } },
    });
    return result.data?.addWalletAccount ?? null;
  };

  return { addAccount, loading, error };
}

export function useSetPrimaryPayoutAccount() {
  const [mutate, { loading, error }] = useMutation<SetWalletPrimaryData>(
    SET_WALLET_PRIMARY,
    { refetchQueries: [{ query: MY_WALLET_ACCOUNTS }] }
  );

  const setPrimary = async (walletAccountId: string) => {
    const result = await mutate({ variables: { walletAccountId } });
    return result.data?.setWalletPrimary ?? null;
  };

  return { setPrimary, loading, error };
}

export function useRemovePayoutAccount() {
  const [mutate, { loading, error }] = useMutation<RemoveWalletAccountData>(
    REMOVE_WALLET_ACCOUNT,
    { refetchQueries: [{ query: MY_WALLET_ACCOUNTS }] }
  );

  const removeAccount = async (walletAccountId: string) => {
    const result = await mutate({ variables: { walletAccountId } });
    return result.data?.removeWalletAccount ?? false;
  };

  return { removeAccount, loading, error };
}

// ── Earnings summary ───────────────────────────────────────────────
// Replaces the old balance + transactions queries. Period-filtered
// report off the payouts table — no stored balance anywhere.

export function useEarningsSummary(from?: Date, to?: Date) {
  const { data, loading, error, refetch } = useQuery<MyEarningsSummaryData>(
    MY_EARNINGS_SUMMARY,
    {
      variables: {
        from: from ? toLighthouseDateTime(from) : null,
        to: to ? toLighthouseDateTime(to) : null,
      },
      fetchPolicy: "cache-and-network",
    }
  );

  return {
    summary: data?.myEarningsSummary ?? null,
    loading,
    error,
    refetch,
  };
}

// Lighthouse's DateTime scalar wants `Y-m-d H:i:s` (no T, no offset).
// Send UTC so the server interprets us consistently regardless of the
// browser's local zone.
function toLighthouseDateTime(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ` +
    `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`
  );
}
