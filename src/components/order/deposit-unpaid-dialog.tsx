"use client";

import { AlertTriangle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DepositUnpaidDialogProps {
  open: boolean;
  /** Designer-friendly preview of the stage they're advancing to. */
  targetLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Surfaces the DEPOSIT_NOT_PAID structured error from updateOrderStatus
 * as a confirm dialog instead of letting it bubble as a red error toast
 * / Next.js dev overlay. The designer accepts the risk explicitly; the
 * server records the override on the order_updates audit row so admins
 * can review later. Cancel = no state change.
 */
export function DepositUnpaidDialog({
  open,
  targetLabel,
  loading = false,
  onConfirm,
  onCancel,
}: DepositUnpaidDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-copper h-5 w-5" aria-hidden />
            <DialogTitle>Deposit not yet recorded</DialogTitle>
          </div>
          <DialogDescription className="pt-2 leading-relaxed">
            The client hasn&apos;t paid the deposit on Nidlo
            {targetLabel ? ` before moving to "${targetLabel}".` : "."}
            <br className="hidden sm:block" />
            If you&apos;ve received payment offline, or you&apos;re extending
            credit, you can continue. The order will be flagged in your records
            as advanced without a recorded deposit.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="luxe"
            onClick={onConfirm}
            loading={loading}
            loadingLabel="Continuing..."
          >
            Continue anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
