"use client";

import { useMutation } from "@apollo/client/react";
import {
  RECORD_EXTERNAL_PAYMENT,
  CONFIRM_EXTERNAL_PAYMENT,
  REJECT_EXTERNAL_PAYMENT,
} from "@/lib/graphql/mutations/external-payment";
import { GET_ORDER } from "@/lib/graphql/queries/order";
import type {
  RecordExternalPaymentData,
  ConfirmExternalPaymentData,
  RejectExternalPaymentData,
  ExternalPaymentMethodValue,
} from "@/types/graphql";

export function useRecordExternalPayment(orderId: string) {
  const [mutate, { loading, error }] = useMutation<RecordExternalPaymentData>(
    RECORD_EXTERNAL_PAYMENT,
    { refetchQueries: [{ query: GET_ORDER, variables: { id: orderId } }] }
  );

  const record = async (input: {
    orderId: string;
    amount: number;
    method: ExternalPaymentMethodValue;
    paidAt: string;
    notes?: string;
    proofImages?: Array<{
      url: string;
      fileId?: string;
      thumbnailUrl?: string;
    }>;
  }) => {
    const result = await mutate({ variables: { input } });
    return result.data?.recordExternalPayment ?? null;
  };

  return { record, loading, error };
}

export function useConfirmExternalPayment(orderId: string) {
  const [mutate, { loading, error }] = useMutation<ConfirmExternalPaymentData>(
    CONFIRM_EXTERNAL_PAYMENT,
    { refetchQueries: [{ query: GET_ORDER, variables: { id: orderId } }] }
  );

  const confirm = async (externalPaymentId: string) => {
    const result = await mutate({ variables: { externalPaymentId } });
    return result.data?.confirmExternalPayment ?? null;
  };

  return { confirm, loading, error };
}

export function useRejectExternalPayment(orderId: string) {
  const [mutate, { loading, error }] = useMutation<RejectExternalPaymentData>(
    REJECT_EXTERNAL_PAYMENT,
    { refetchQueries: [{ query: GET_ORDER, variables: { id: orderId } }] }
  );

  const reject = async (externalPaymentId: string, reason?: string) => {
    const result = await mutate({
      variables: { externalPaymentId, reason },
    });
    return result.data?.rejectExternalPayment ?? null;
  };

  return { reject, loading, error };
}
