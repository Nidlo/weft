/**
 * Build the "Linked N orders and M measurements we held for you." toast
 * copy that fires after a successful signup / login when AuthService::
 * linkOrphansByPhone() claimed any walk-in records keyed to the user's
 * phone. Returns null when both counts are 0 so the caller can skip the
 * toast entirely (avoids "Linked 0 orders..." pollution).
 *
 * Pluralisation handled per-category - only non-zero categories appear
 * in the string, so the four shapes are:
 *   - "Linked 2 orders and 1 measurement we held for you."
 *   - "Linked 1 order and 2 measurements we held for you."
 *   - "Linked 3 orders we held for you."
 *   - "Linked 1 measurement we held for you."
 */
export function buildClaimedToast(
  ordersCount: number,
  measurementsCount: number
): string | null {
  if (ordersCount <= 0 && measurementsCount <= 0) return null;

  const parts: string[] = [];
  if (ordersCount > 0) {
    parts.push(`${ordersCount} ${ordersCount === 1 ? "order" : "orders"}`);
  }
  if (measurementsCount > 0) {
    parts.push(
      `${measurementsCount} ${
        measurementsCount === 1 ? "measurement" : "measurements"
      }`
    );
  }
  return `Linked ${parts.join(" and ")} we held for you.`;
}
