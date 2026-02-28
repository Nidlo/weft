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
  MY_WALLET_BALANCE,
  MY_WALLET_TRANSACTIONS,
} from "@/lib/graphql/queries/wallet";
import type {
  ResolveMomoAccountData,
  AddWalletAccountData,
  SetWalletPrimaryData,
  RemoveWalletAccountData,
  MyWalletAccountsData,
  MyWalletBalanceData,
  MyWalletTransactionsData,
  MomoNetworkValue,
} from "@/types/graphql";

export function useWalletAccounts() {
  const { data, loading, error, refetch } =
    useQuery<MyWalletAccountsData>(MY_WALLET_ACCOUNTS, {
      fetchPolicy: "cache-and-network",
    });

  return {
    accounts: data?.myWalletAccounts ?? [],
    loading,
    error,
    refetch,
  };
}

export function useWalletBalance() {
  const { data, loading, error, refetch } =
    useQuery<MyWalletBalanceData>(MY_WALLET_BALANCE, {
      fetchPolicy: "cache-and-network",
    });

  return {
    balance: data?.myWalletBalance?.balance ?? 0,
    loading,
    error,
    refetch,
  };
}

export function useWalletTransactions(first = 20, page = 1) {
  const { data, loading, error, refetch } =
    useQuery<MyWalletTransactionsData>(MY_WALLET_TRANSACTIONS, {
      variables: { first, page },
      fetchPolicy: "cache-and-network",
    });

  return {
    transactions: data?.myWalletTransactions ?? [],
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

export function useAddWalletAccount() {
  const [mutate, { loading, error }] = useMutation<AddWalletAccountData>(
    ADD_WALLET_ACCOUNT,
    { refetchQueries: [{ query: MY_WALLET_ACCOUNTS }, { query: MY_WALLET_BALANCE }] }
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

export function useSetWalletPrimary() {
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

export function useRemoveWalletAccount() {
  const [mutate, { loading, error }] = useMutation<RemoveWalletAccountData>(
    REMOVE_WALLET_ACCOUNT,
    { refetchQueries: [{ query: MY_WALLET_ACCOUNTS }, { query: MY_WALLET_BALANCE }] }
  );

  const removeAccount = async (walletAccountId: string) => {
    const result = await mutate({ variables: { walletAccountId } });
    return result.data?.removeWalletAccount ?? false;
  };

  return { removeAccount, loading, error };
}
