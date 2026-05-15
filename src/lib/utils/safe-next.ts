/**
 * Validates a `?next=` query-param value for post-login redirect.
 *
 * Open-redirect-safe: returns the path only if it is a same-origin
 * relative path (starts with `/`, NOT with `//`). Anything else falls
 * back to the supplied default. We never want a deep-link from an SMS
 * to bounce a freshly-authenticated user to an attacker-controlled
 * domain via something like `?next=//evil.com/steal-tokens`.
 *
 * Also rejects:
 * - protocol URLs (`http://...`, `mailto:...`, `javascript:...`)
 * - empty / whitespace-only strings
 * - the auth pages themselves (would loop)
 */
const AUTH_PATH_PREFIXES = ["/auth/phone", "/auth/verify", "/auth/role"];

export function safeNext(
  candidate: string | null | undefined,
  fallback = "/dashboard"
): string {
  if (!candidate) return fallback;

  const trimmed = candidate.trim();
  if (!trimmed) return fallback;

  // Must be same-origin relative
  if (!trimmed.startsWith("/")) return fallback;
  if (trimmed.startsWith("//")) return fallback;
  if (trimmed.startsWith("/\\")) return fallback;

  // Block protocol-handler smuggling via URL parsing oddities
  if (/^\/[a-z][a-z0-9+.-]*:/i.test(trimmed)) return fallback;

  // Don't bounce back into auth pages — would loop
  if (
    AUTH_PATH_PREFIXES.some(
      (p) =>
        trimmed === p ||
        trimmed.startsWith(`${p}?`) ||
        trimmed.startsWith(`${p}/`)
    )
  ) {
    return fallback;
  }

  return trimmed;
}
