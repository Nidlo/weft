"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { INITIATE_PAYMENT } from "@/lib/graphql/mutations/payment";
import { PAYMENT_STATUS, ORDER_PAYMENTS } from "@/lib/graphql/queries/payment";
import { GET_ORDER } from "@/lib/graphql/queries/order";
import type {
  InitiatePaymentData,
  InitiatePaymentInput,
  PaymentStatusData,
  OrderPaymentsData,
  PaymentStatusValue,
} from "@/types/graphql";
import {
  MOMO_POLL_INTERVAL_MS,
  MOMO_POLL_TIMEOUT_MS,
} from "@/lib/utils/payment";

export function useInitiatePayment() {
  const [mutate, { loading, error }] =
    useMutation<InitiatePaymentData>(INITIATE_PAYMENT);

  const initiatePayment = async (input: InitiatePaymentInput) => {
    const withKey: InitiatePaymentInput = {
      ...input,
      idempotencyKey: input.idempotencyKey ?? crypto.randomUUID(),
    };
    const result = await mutate({ variables: { input: withKey } });
    return result.data?.initiatePayment ?? null;
  };

  return { initiatePayment, loading, error };
}

export function usePaymentStatus(reference: string | null) {
  const { data, loading, error, refetch } = useQuery<PaymentStatusData>(
    PAYMENT_STATUS,
    {
      variables: { reference },
      skip: !reference,
      fetchPolicy: "network-only",
    }
  );

  return {
    payment: data?.paymentStatus ?? null,
    loading,
    error,
    refetch,
  };
}

export function useOrderPayments(orderId: string) {
  const { data, loading, error, refetch } = useQuery<OrderPaymentsData>(
    ORDER_PAYMENTS,
    {
      variables: { orderId },
      skip: !orderId,
      fetchPolicy: "cache-and-network",
    }
  );

  return {
    payments: data?.orderPayments ?? [],
    loading,
    error,
    refetch,
  };
}

export type MomoPollingStatus =
  | "idle"
  | "polling"
  | "success"
  | "failed"
  | "timeout";

export function useMomoPolling(reference: string | null) {
  const [status, setStatus] = useState<MomoPollingStatus>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const { refetch } = useQuery<PaymentStatusData>(PAYMENT_STATUS, {
    variables: { reference },
    skip: true, // Only fetch manually via refetch
  });

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const poll = useCallback(async (): Promise<PaymentStatusValue | null> => {
    if (!reference) return null;
    try {
      const { data } = await refetch({ reference });
      return (data?.paymentStatus?.status as PaymentStatusValue) ?? null;
    } catch {
      return null;
    }
  }, [reference, refetch]);

  const startPolling = useCallback(() => {
    if (!reference) return;

    stopPolling();
    setStatus("polling");
    startTimeRef.current = Date.now();
    setElapsedMs(0);

    // Set up 5min timeout
    timeoutRef.current = setTimeout(() => {
      stopPolling();
      setStatus("timeout");
    }, MOMO_POLL_TIMEOUT_MS);

    // Tick elapsed every second so consumers can render a progress display
    // without computing Date.now() during render (React 19 purity rule).
    tickRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 1000);

    // Poll every 3s
    intervalRef.current = setInterval(async () => {
      const paymentStatus = await poll();

      if (paymentStatus === "success") {
        stopPolling();
        setStatus("success");
      } else if (paymentStatus === "failed") {
        stopPolling();
        setStatus("failed");
      }
    }, MOMO_POLL_INTERVAL_MS);
  }, [reference, poll, stopPolling]);

  const checkNow = useCallback(async () => {
    const paymentStatus = await poll();

    if (paymentStatus === "success") {
      stopPolling();
      setStatus("success");
    } else if (paymentStatus === "failed") {
      stopPolling();
      setStatus("failed");
    }

    return paymentStatus;
  }, [poll, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  return {
    status,
    startPolling,
    stopPolling,
    checkNow,
    elapsedMs: status === "polling" ? elapsedMs : 0,
  };
}

/** Refetch the order detail cache after payment changes */
export function useRefetchOrderOnPayment(orderId: string) {
  const { refetch } = useQuery(GET_ORDER, {
    variables: { id: orderId },
    skip: true,
  });

  return { refetchOrder: refetch };
}
