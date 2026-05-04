"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Phone, RefreshCw } from "lucide-react";
import { useMomoPolling } from "@/lib/hooks/use-payments";
import { getPaymentMethodConfig } from "@/lib/utils/payment";
import { formatPesewas } from "@/lib/utils/order";

interface MomoPendingScreenProps {
  reference: string;
  method: string;
  amount: number;
  phone?: string;
  onSuccess: () => void;
  onFailed: () => void;
  onTimeout: () => void;
}

export function MomoPendingScreen({
  reference,
  method,
  amount,
  phone,
  onSuccess,
  onFailed,
  onTimeout,
}: MomoPendingScreenProps) {
  const { status, startPolling, checkNow } = useMomoPolling(reference);
  const methodConfig = getPaymentMethodConfig(method);

  // Start polling on mount
  useEffect(() => {
    startPolling();
  }, [startPolling]);

  // React to status changes
  useEffect(() => {
    if (status === "success") onSuccess();
    if (status === "failed") onFailed();
    if (status === "timeout") onTimeout();
  }, [status, onSuccess, onFailed, onTimeout]);

  return (
    <div className="flex flex-col items-center space-y-6 py-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-status-warning-soft">
        <Phone className="h-10 w-10 text-status-warning" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold">Check Your Phone</h2>
        <p className="text-sm text-muted-foreground">
          A {methodConfig.shortLabel} prompt has been sent
          {phone ? ` to ${phone}` : ""}.
        </p>
        <p className="text-sm text-muted-foreground">
          Approve the payment of <strong>{formatPesewas(amount)}</strong> to complete your transaction.
        </p>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Waiting for confirmation...
      </div>

      <Button
        variant="outline"
        onClick={() => checkNow()}
        disabled={status !== "polling"}
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        I&apos;ve Approved — Check Now
      </Button>

      <p className="text-xs text-muted-foreground">
        This page will update automatically when payment is confirmed.
        {status === "polling" && " Timeout in 5 minutes."}
      </p>
    </div>
  );
}
