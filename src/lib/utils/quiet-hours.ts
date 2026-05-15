/**
 * Quiet-hours window evaluator. The window is set as `HH:MM` strings on the
 * server (UTC `time` column). Both bounds may be null when unset.
 *
 * Window semantics match the backend `User::isInQuietHours()`:
 *   - Same-day window (e.g. 09:00 → 17:00): in if start <= now < end.
 *   - Overnight window (e.g. 22:00 → 07:00): in if now >= start OR now < end.
 *   - Either bound null: never in quiet hours.
 *
 * The comparison uses string ordering of `"HH:MM"` because zero-padded 24h
 * strings compare correctly lexicographically.
 */
export function isInQuietHours(
  start: string | null | undefined,
  end: string | null | undefined,
  now: Date = new Date()
): boolean {
  if (!start || !end) return false;

  const hh = String(now.getUTCHours()).padStart(2, "0");
  const mm = String(now.getUTCMinutes()).padStart(2, "0");
  const nowHm = `${hh}:${mm}`;

  // Overnight window crosses midnight.
  if (start > end) {
    return nowHm >= start || nowHm < end;
  }

  return nowHm >= start && nowHm < end;
}
