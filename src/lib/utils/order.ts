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
  // Semantic statuses - mapped to brand status tokens.
  pending: {
    label: "Pending",
    color: "text-status-warning-fg",
    bgColor: "bg-status-warning-soft",
  },
  confirmed: {
    label: "Confirmed",
    color: "text-status-info-fg",
    bgColor: "bg-status-info-soft",
  },
  ready: {
    label: "Ready",
    color: "text-status-success-fg",
    bgColor: "bg-status-success-soft",
  },
  delivered: {
    label: "Delivered",
    color: "text-status-success-fg",
    bgColor: "bg-status-success-soft",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-status-error-fg",
    bgColor: "bg-status-error-soft",
  },
  declined: {
    label: "Declined",
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
  // Production-stage hues - intentionally distinct so the order timeline
  // shows visual progression (indigo → purple → pink → orange).
  fabric_ready: {
    label: "Fabric Ready",
    color: "text-indigo-700",
    bgColor: "bg-indigo-100",
  },
  cutting: {
    label: "Cutting",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
  },
  sewing: { label: "Sewing", color: "text-pink-700", bgColor: "bg-pink-100" },
  finishing: {
    label: "Finishing",
    color: "text-orange-700",
    bgColor: "bg-orange-100",
  },
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
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    }
  );
}

export function formatPesewas(pesewas: number): string {
  return `GHS ${(pesewas / 100).toFixed(2)}`;
}

/**
 * Compact rendering for cards / hero / list surfaces - drops trailing zeros,
 * uses thousands separator. e.g. 150_000 → "GHS 1,500", 12_345 → "GHS 123.45".
 */
export function formatPesewasShort(pesewas: number): string {
  const ghs = pesewas / 100;
  return `GHS ${ghs.toLocaleString("en-GH", {
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Bare-number rendering for contexts that already supply their own currency
 * prefix (e.g. JSON-LD price strings: `"GHS 100.00 - GHS 500.00"`). Always
 * two decimals. Use over `formatPesewas` only when the surrounding template
 * needs to omit `GHS `.
 */
export function pesewasToGhs(pesewas: number): string {
  return (pesewas / 100).toFixed(2);
}

export function getDeadlineColor(deadline: string): string {
  const days = Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (days < 0) return "text-status-error";
  if (days < 7) return "text-status-error-fg";
  if (days < 14) return "text-status-warning-fg";
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

/**
 * Designer-response window for newly-placed pending orders. After this
 * elapses without a designer response, BE-NIDLO-ORDER-09 auto-cancels the
 * order. Keep in sync with the backend constant. (FE-NIDLO-ORDER-02)
 */
export const ORDER_RESPONSE_WINDOW_HOURS = 24;

/**
 * Human-friendly remaining-time string for the pending-order response
 * window. Returns:
 *   - "Designer has 23h left" when >= 1h
 *   - "Designer has 45m left" when < 1h but > 0
 *   - "Response window expired" when past the cutoff
 *
 * Pure helper - caller is responsible for ticking the clock (re-render
 * via setInterval). Returning a string keeps the call site declarative.
 */
export function getResponseTimeLeft(
  createdAt: string,
  windowHours: number = ORDER_RESPONSE_WINDOW_HOURS,
  now: Date = new Date()
): string {
  const created = new Date(createdAt).getTime();
  const cutoff = created + windowHours * 60 * 60 * 1000;
  const remainingMs = cutoff - now.getTime();

  if (remainingMs <= 0) return "Response window expired";

  const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
  if (remainingMinutes < 60) {
    return `Designer has ${remainingMinutes}m left`;
  }

  const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));
  return `Designer has ${remainingHours}h left`;
}

/**
 * Severity tone for the response-window pill - green when fresh, amber
 * mid-window, red close to expiry / past it.
 */
export function getResponseTimeColor(
  createdAt: string,
  windowHours: number = ORDER_RESPONSE_WINDOW_HOURS,
  now: Date = new Date()
): string {
  const created = new Date(createdAt).getTime();
  const cutoff = created + windowHours * 60 * 60 * 1000;
  const remainingMs = cutoff - now.getTime();
  const oneHour = 60 * 60 * 1000;

  if (remainingMs <= 0) return "text-status-error-fg";
  if (remainingMs <= oneHour) return "text-status-warning-fg";
  return "text-muted-foreground";
}

/**
 * Post-delivery review window. Surface this on order detail so a client
 * who just received their garment knows when they can leave feedback.
 * Default 7 days mirrors XLent's pattern; canonical value will land via
 * BE-NIDLO-REVIEW-01 → swap this constant for the server value.
 * (FE-NIDLO-REVIEW-05)
 */
export const REVIEW_WINDOW_DAYS = 7;

/**
 * Human-friendly review deadline label like "Review by Tue 7 May" while
 * the window is open, or "Review window closed" past the cutoff. Returns
 * null when the order has no `deliveredAt` (i.e., not yet delivered).
 */
export function getReviewDeadlineLabel(
  deliveredAt: string | null,
  windowDays: number = REVIEW_WINDOW_DAYS,
  now: Date = new Date()
): string | null {
  if (!deliveredAt) return null;

  const delivered = new Date(deliveredAt).getTime();
  const cutoff = new Date(delivered + windowDays * 24 * 60 * 60 * 1000);

  if (now.getTime() >= cutoff.getTime()) {
    return "Review window closed";
  }

  // Same `Tue 7 May` shape used elsewhere in the FE for consistency.
  const formatted = cutoff.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  return `Review by ${formatted}`;
}
