"use client";

import { useState } from "react";
import {
  Banknote,
  Check,
  X,
  Plus,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useRecordExternalPayment,
  useConfirmExternalPayment,
  useRejectExternalPayment,
} from "@/lib/hooks/use-external-payments";
import { formatPesewas } from "@/lib/utils/order";
import type {
  GqlExternalPayment,
  ExternalPaymentMethodValue,
} from "@/types/graphql";

const METHOD_OPTIONS: {
  value: ExternalPaymentMethodValue;
  label: string;
}[] = [
  { value: "cash", label: "Cash" },
  { value: "direct_momo", label: "Direct MoMo Transfer" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "other", label: "Other" },
];

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  pending: { bg: "bg-status-warning-soft", text: "text-status-warning-fg" },
  confirmed: { bg: "bg-status-success-soft", text: "text-status-success-fg" },
  rejected: { bg: "bg-status-error-soft", text: "text-status-error-fg" },
};

interface ExternalPaymentSectionProps {
  orderId: string;
  externalPayments: GqlExternalPayment[];
  isClient: boolean;
  isDesigner: boolean;
}

export function ExternalPaymentSection({
  orderId,
  externalPayments,
  isClient,
  isDesigner,
}: ExternalPaymentSectionProps) {
  const { record, loading: recording } = useRecordExternalPayment(orderId);
  const { confirm, loading: confirming } = useConfirmExternalPayment(orderId);
  const { reject, loading: rejecting } = useRejectExternalPayment(orderId);

  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<ExternalPaymentMethodValue>("cash");
  const [paidAt, setPaidAt] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleRecord = async () => {
    const amountPesewas = Math.round(parseFloat(amount) * 100);
    if (isNaN(amountPesewas) || amountPesewas <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    try {
      await record({
        orderId,
        amount: amountPesewas,
        method,
        paidAt,
        notes: notes || undefined,
      });
      toast.success("External payment recorded");
      setShowForm(false);
      setAmount("");
      setNotes("");
    } catch {
      toast.error("Failed to record payment");
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      await confirm(id);
      toast.success("Payment confirmed");
    } catch {
      toast.error("Failed to confirm payment");
    }
  };

  const handleReject = async () => {
    if (!rejectId) return;
    try {
      await reject(rejectId, rejectReason || undefined);
      toast.success("Payment rejected");
      setRejectId(null);
      setRejectReason("");
    } catch {
      toast.error("Failed to reject payment");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Banknote className="h-4 w-4" />
          Offline Payments
        </CardTitle>
        {isClient && !showForm && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(true)}
          >
            <Plus className="mr-1 h-3 w-3" />
            Record
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Record Form (Client) */}
        {showForm && (
          <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Amount (GHS)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Method</Label>
                <Select
                  value={method}
                  onValueChange={(v) =>
                    setMethod(v as ExternalPaymentMethodValue)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {METHOD_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Date Paid</Label>
              <Input
                type="date"
                value={paidAt}
                onChange={(e) => setPaidAt(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Notes (optional)</Label>
              <Textarea
                placeholder="E.g. Paid cash at the shop"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleRecord}
                disabled={recording}
              >
                {recording && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Record Payment
              </Button>
            </div>
          </div>
        )}

        {/* Payment List */}
        {externalPayments.length === 0 && !showForm ? (
          <p className="text-sm text-muted-foreground">
            No offline payments recorded.
          </p>
        ) : (
          externalPayments.map((ep) => {
            const styles = STATUS_STYLES[ep.status] ?? STATUS_STYLES.pending;

            return (
              <div key={ep.id} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      {formatPesewas(ep.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {ep.methodLabel} &middot;{" "}
                      {new Date(ep.paidAt).toLocaleDateString("en-GH", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <Badge
                    className={`${styles.bg} ${styles.text} border-0`}
                  >
                    {ep.statusLabel}
                  </Badge>
                </div>

                {ep.notes && (
                  <p className="text-xs text-muted-foreground">{ep.notes}</p>
                )}

                {ep.proofImages && ep.proofImages.length > 0 && (
                  <div className="flex gap-2">
                    {ep.proofImages.map((img, i) => (
                      <a
                        key={i}
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded border px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
                      >
                        <ImageIcon className="h-3 w-3" />
                        Proof {i + 1}
                      </a>
                    ))}
                  </div>
                )}

                {ep.rejectionReason && (
                  <p className="text-xs text-red-600">
                    Reason: {ep.rejectionReason}
                  </p>
                )}

                {/* Designer actions */}
                {isDesigner && ep.status === "pending" && (
                  <div className="flex gap-2 pt-1">
                    {rejectId === ep.id ? (
                      <div className="w-full space-y-2">
                        <Input
                          placeholder="Reason for rejection (optional)"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setRejectId(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                            onClick={handleReject}
                            disabled={rejecting}
                          >
                            {rejecting && (
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            )}
                            Reject
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleConfirm(ep.id)}
                          disabled={confirming}
                        >
                          {confirming ? (
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          ) : (
                            <Check className="mr-1 h-3 w-3" />
                          )}
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setRejectId(ep.id)}
                        >
                          <X className="mr-1 h-3 w-3" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
