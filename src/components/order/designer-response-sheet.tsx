"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useRespondToOrder } from "@/lib/hooks/use-orders";
import { formatPesewas } from "@/lib/utils/order";
import type { GqlOrderDetail } from "@/types/graphql";

interface DesignerResponseSheetProps {
  order: GqlOrderDetail;
  onSuccess?: () => void;
}

export function DesignerResponseSheet({
  order,
  onSuccess,
}: DesignerResponseSheetProps) {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<"accept" | "counter" | "decline" | null>(null);
  const [counterPriceGhs, setCounterPriceGhs] = useState("");
  const [counterMessage, setCounterMessage] = useState("");
  const [declineReason, setDeclineReason] = useState("");
  const { respondToOrder, loading } = useRespondToOrder();

  const handleSubmit = async () => {
    if (!action) return;

    await respondToOrder({
      orderId: order.id,
      action,
      counterPrice: action === "counter" ? Math.round(parseFloat(counterPriceGhs) * 100) : undefined,
      counterMessage: action === "counter" ? counterMessage || undefined : undefined,
      declineReason: action === "decline" ? declineReason || undefined : undefined,
    });

    setOpen(false);
    setAction(null);
    onSuccess?.();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>Respond to Order</Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Respond to Order</SheetTitle>
          <SheetDescription>
            Budget: {formatPesewas(order.budgetMin)} - {formatPesewas(order.budgetMax)}
          </SheetDescription>
        </SheetHeader>

        {!action ? (
          <div className="mt-6 grid gap-3">
            <Button
              onClick={() => setAction("accept")}
              className="w-full"
            >
              Accept at {formatPesewas(order.budgetMax)}
            </Button>
            <Button
              variant="outline"
              onClick={() => setAction("counter")}
              className="w-full"
            >
              Counter Offer
            </Button>
            <Button
              variant="destructive"
              onClick={() => setAction("decline")}
              className="w-full"
            >
              Decline
            </Button>
          </div>
        ) : action === "accept" ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm">
              Accept this order at <strong>{formatPesewas(order.budgetMax)}</strong>?
            </p>
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={loading} className="flex-1">
                {loading ? "Accepting..." : "Confirm Accept"}
              </Button>
              <Button variant="outline" onClick={() => setAction(null)}>
                Back
              </Button>
            </div>
          </div>
        ) : action === "counter" ? (
          <div className="mt-6 space-y-4">
            <div>
              <Label htmlFor="counter-price">Your Price (GHS)</Label>
              <Input
                id="counter-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 650.00"
                value={counterPriceGhs}
                onChange={(e) => setCounterPriceGhs(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="counter-message">Message (optional)</Label>
              <Textarea
                id="counter-message"
                placeholder="Explain your pricing..."
                value={counterMessage}
                onChange={(e) => setCounterMessage(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={loading || !counterPriceGhs}
                className="flex-1"
              >
                {loading ? "Sending..." : "Send Counter Offer"}
              </Button>
              <Button variant="outline" onClick={() => setAction(null)}>
                Back
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div>
              <Label htmlFor="decline-reason">Reason (optional)</Label>
              <Textarea
                id="decline-reason"
                placeholder="Why are you declining this order?"
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Declining..." : "Confirm Decline"}
              </Button>
              <Button variant="outline" onClick={() => setAction(null)}>
                Back
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
