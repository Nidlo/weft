"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Check, CreditCard, Smartphone } from "lucide-react";
import type { PaymentMethodValue } from "@/types/graphql";
import { PAYMENT_METHOD_CONFIG, isMomoMethod } from "@/lib/utils/payment";

interface PaymentMethodSelectorProps {
  onSelect: (method: PaymentMethodValue, phone?: string) => void;
  loading?: boolean;
  defaultPhone?: string;
}

const METHOD_ORDER: PaymentMethodValue[] = [
  "momo_mtn",
  "momo_vodafone",
  "momo_airteltigo",
  "card",
];

export function PaymentMethodSelector({
  onSelect,
  loading,
  defaultPhone,
}: PaymentMethodSelectorProps) {
  const [selected, setSelected] = useState<PaymentMethodValue | null>(null);
  const [phone, setPhone] = useState(defaultPhone ?? "");

  const needsPhone = selected && isMomoMethod(selected);
  const canProceed = selected && (!needsPhone || phone.length >= 10);

  const handleProceed = () => {
    if (!selected || !canProceed) return;
    onSelect(selected, needsPhone ? phone : undefined);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {METHOD_ORDER.map((method) => {
          const config = PAYMENT_METHOD_CONFIG[method];
          const isSelected = selected === method;

          return (
            <Card
              key={method}
              className={`cursor-pointer transition-colors ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "hover:border-muted-foreground/30"
              }`}
              onClick={() => setSelected(method)}
            >
              <CardContent className="flex items-center gap-3 py-3">
                <div className="bg-secondary flex h-10 w-10 items-center justify-center rounded-full">
                  {config.isMomo ? (
                    <Smartphone className="h-5 w-5" />
                  ) : (
                    <CreditCard className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{config.label}</p>
                  <p className="text-muted-foreground text-xs">
                    {config.isMomo
                      ? "Pay with Mobile Money"
                      : "Visa / Mastercard"}
                  </p>
                </div>
                {isSelected && <Check className="text-primary h-5 w-5" />}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {needsPhone && (
        <div className="space-y-2">
          <Label htmlFor="momo-phone">Mobile Money Number</Label>
          <Input
            id="momo-phone"
            type="tel"
            placeholder="024XXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={15}
            autoComplete="tel"
            inputMode="numeric"
          />
          <p className="text-muted-foreground text-xs">
            Your Mobile Money number for this payment.
          </p>
        </div>
      )}

      <Button
        className="w-full"
        disabled={!canProceed || loading}
        onClick={handleProceed}
      >
        {loading ? "Initializing..." : "Continue to Pay"}
      </Button>
    </div>
  );
}
