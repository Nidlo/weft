"use client";

import { useMutation } from "@apollo/client/react";
import { REQUEST_PAYOUT } from "@/lib/graphql/mutations/payout";
import { GET_ORDER } from "@/lib/graphql/queries/order";
import type { RequestPayoutData } from "@/types/graphql";

export function useRequestPayout(orderId: string) {
  const [mutate, { loading, error }] = useMutation<RequestPayoutData>(REQUEST_PAYOUT, {
    refetchQueries: [{ query: GET_ORDER, variables: { id: orderId } }],
  });

  const requestPayout = async (payoutId: string) => {
    const result = await mutate({ variables: { payoutId } });
    return result.data?.requestPayout ?? null;
  };

  return { requestPayout, loading, error };
}
