export type OrderStatusKey =
  | "pending"
  | "confirmed"
  | "fabric_ready"
  | "cutting"
  | "sewing"
  | "finishing"
  | "ready"
  | "delivered"
  | "cancelled"
  | "declined";

export const ORDER_STATUS_CONFIG: Record<
  OrderStatusKey,
  { label: string; color: string; bgColor: string }
> = {
  pending: { label: "Pending", color: "text-yellow-700", bgColor: "bg-yellow-100" },
  confirmed: { label: "Confirmed", color: "text-blue-700", bgColor: "bg-blue-100" },
  fabric_ready: { label: "Fabric Ready", color: "text-indigo-700", bgColor: "bg-indigo-100" },
  cutting: { label: "Cutting", color: "text-purple-700", bgColor: "bg-purple-100" },
  sewing: { label: "Sewing", color: "text-pink-700", bgColor: "bg-pink-100" },
  finishing: { label: "Finishing", color: "text-orange-700", bgColor: "bg-orange-100" },
  ready: { label: "Ready", color: "text-green-700", bgColor: "bg-green-100" },
  delivered: { label: "Delivered", color: "text-emerald-700", bgColor: "bg-emerald-100" },
  cancelled: { label: "Cancelled", color: "text-red-700", bgColor: "bg-red-100" },
  declined: { label: "Declined", color: "text-gray-700", bgColor: "bg-gray-100" },
};

export const PRODUCTION_STAGES: OrderStatusKey[] = [
  "confirmed",
  "fabric_ready",
  "cutting",
  "sewing",
  "finishing",
  "ready",
  "delivered",
];

export const ACTIVE_STATUSES = [
  "pending",
  "confirmed",
  "fabric_ready",
  "cutting",
  "sewing",
  "finishing",
  "ready",
];

export function getStatusConfig(status: string) {
  return (
    ORDER_STATUS_CONFIG[status as OrderStatusKey] ?? {
      label: status,
      color: "text-gray-700",
      bgColor: "bg-gray-100",
    }
  );
}

export function formatPesewas(pesewas: number): string {
  return `GHS ${(pesewas / 100).toFixed(2)}`;
}

export function getDeadlineColor(deadline: string): string {
  const days = Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (days < 0) return "text-red-600";
  if (days < 7) return "text-red-500";
  if (days < 14) return "text-yellow-600";
  return "text-muted-foreground";
}

export function getDaysUntilDeadline(deadline: string): string {
  const days = Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `${days}d left`;
}
