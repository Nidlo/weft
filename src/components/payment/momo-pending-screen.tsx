"use client";

import { useEffect } from "react";
import { Phone, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StitchLoader } from "@/components/ui/stitch-loader";
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
      <div className="bg-copper/15 text-copper-soft ring-copper/30 flex size-20 items-center justify-center rounded-2xl ring-1">
        <Phone className="h-9 w-9" aria-hidden />
      </div>

      <div className="space-y-2">
        <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
          Confirm on your phone
        </p>
        <h2 className="text-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Check your phone.
        </h2>
        <p className="text-muted-foreground text-sm">
          A {methodConfig.shortLabel} prompt has been sent
          {phone ? ` to ${phone}` : ""}. Approve the payment of{" "}
          <strong className="text-foreground">{formatPesewas(amount)}</strong>{" "}
          to complete your transaction.
        </p>
      </div>

      <StitchLoader
        size={28}
        tone="copper"
        label="Waiting for confirmation..."
      />

      <Button
        variant="luxe-outline"
        size="lg"
        onClick={() => checkNow()}
        disabled={status !== "polling"}
        className="gap-2"
      >
        <RefreshCw className="h-4 w-4" aria-hidden />
        I&apos;ve approved — check now
      </Button>

      <p className="text-muted-foreground text-xs">
        This page will update automatically when payment is confirmed.
        {status === "polling" && " Timeout in 5 minutes."}
      </p>
    </div>
  );
}
