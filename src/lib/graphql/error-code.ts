import { CombinedGraphQLErrors } from "@apollo/client/errors";

/**
 * Extract the `extensions.code` from the first GraphQL error in a thrown
 * mutation/query rejection. Returns null when the thrown thing isn't a
 * structured GraphQL error or when no error in the bundle carries a code.
 *
 * Used to branch on server-side soft-error codes (e.g. DEPOSIT_NOT_PAID)
 * without string-matching the message text — which is brittle and breaks
 * the moment a backend dev rewords the copy.
 */
export function extractErrorCode(error: unknown): string | null {
  if (!CombinedGraphQLErrors.is(error)) return null;
  for (const gqlError of error.errors) {
    const code = gqlError.extensions?.code;
    if (typeof code === "string") return code;
  }
  return null;
}
