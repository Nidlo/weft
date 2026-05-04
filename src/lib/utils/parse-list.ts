/**
 * Coerce an unknown value into a string array. Handles three shapes coming
 * back from the GraphQL layer:
 *
 *   1. Already an array → return as-is (cast to string[]).
 *   2. A JSON-encoded string → parse, return only if the parse result is an
 *      array. Anything else (object, scalar) → empty.
 *   3. Anything else (null, undefined, number, …) → empty.
 *
 * The safety guard around `JSON.parse` matters: backend can hand us
 * `'"<single>"'` for a single-value field, and we don't want a string of
 * one character to look like a 1-element array of unrelated chars.
 */
export function parseStringList(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as string[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}
