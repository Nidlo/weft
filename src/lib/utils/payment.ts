import type {
  PaymentMethodValue,
  PaymentStatusValue,
  PaymentTypeValue,
} from "@/types/graphql";

export interface PaymentMethodConfig {
  label: string;
  shortLabel: string;
  icon: string;
  isMomo: boolean;
  provider?: string;
}

export const PAYMENT_METHOD_CONFIG: Record<
  PaymentMethodValue,
  PaymentMethodConfig
> = {
  momo_mtn: {
    label: "MTN Mobile Money",
    shortLabel: "MTN MoMo",
    icon: "📱",
    isMomo: true,
    provider: "mtn",
  },
  momo_vodafone: {
    label: "Telecel Cash",
    shortLabel: "Telecel",
    icon: "📱",
    isMomo: true,
    provider: "telecel",
  },
  momo_airteltigo: {
    label: "AT Money",
    shortLabel: "AT",
    icon: "📱",
    isMomo: true,
    provider: "at",
  },
  card: {
    label: "Visa / Mastercard",
    shortLabel: "Card",
    icon: "💳",
    isMomo: false,
  },
};

export const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatusValue,
  { label: string; color: string; bgColor: string }
> = {
  pending: {
    label: "Pending",
    color: "text-status-warning-fg",
    bgColor: "bg-status-warning-soft",
  },
  success: {
    label: "Paid",
    color: "text-status-success-fg",
    bgColor: "bg-status-success-soft",
  },
  failed: {
    label: "Failed",
    color: "text-status-error-fg",
    bgColor: "bg-status-error-soft",
  },
  refunded: {
    label: "Refunded",
    color: "text-status-info-fg",
    bgColor: "bg-status-info-soft",
  },
};

export function getPaymentStatusConfig(status: string) {
  return (
    PAYMENT_STATUS_CONFIG[status as PaymentStatusValue] ?? {
      label: status,
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    }
  );
}

export function getPaymentMethodConfig(method: string): PaymentMethodConfig {
  return (
    PAYMENT_METHOD_CONFIG[method as PaymentMethodValue] ?? {
      label: method,
      shortLabel: method,
      icon: "💰",
      isMomo: false,
    }
  );
}

export function isMomoMethod(method: string): boolean {
  return method.startsWith("momo_");
}

export function formatPaymentType(type: PaymentTypeValue): string {
  const map: Record<PaymentTypeValue, string> = {
    deposit: "Deposit",
    balance: "Balance",
    refund: "Refund",
  };
  return map[type] ?? type;
}

// NOTE: deposit / balance amounts are server-computed on `paymentSummary`
// (see `pay/page.tsx`). Per W-NEXT-11, never reconstruct money client-side.

export const MOMO_POLL_INTERVAL_MS = 3000;
export const MOMO_POLL_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
