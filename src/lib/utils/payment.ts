import type { PaymentMethodValue, PaymentStatusValue, PaymentTypeValue } from "@/types/graphql";

export interface PaymentMethodConfig {
  label: string;
  shortLabel: string;
  icon: string;
  isMomo: boolean;
  provider?: string;
}

export const PAYMENT_METHOD_CONFIG: Record<PaymentMethodValue, PaymentMethodConfig> = {
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
  pending: { label: "Pending", color: "text-yellow-700", bgColor: "bg-yellow-100" },
  success: { label: "Paid", color: "text-green-700", bgColor: "bg-green-100" },
  failed: { label: "Failed", color: "text-red-700", bgColor: "bg-red-100" },
  refunded: { label: "Refunded", color: "text-blue-700", bgColor: "bg-blue-100" },
};

export function getPaymentStatusConfig(status: string) {
  return (
    PAYMENT_STATUS_CONFIG[status as PaymentStatusValue] ?? {
      label: status,
      color: "text-gray-700",
      bgColor: "bg-gray-100",
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

export function calculateDeposit(confirmedPrice: number): number {
  return Math.ceil(confirmedPrice / 2);
}

export function calculateBalance(confirmedPrice: number): number {
  return confirmedPrice - calculateDeposit(confirmedPrice);
}

export const MOMO_POLL_INTERVAL_MS = 3000;
export const MOMO_POLL_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
