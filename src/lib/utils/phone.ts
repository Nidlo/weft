/**
 * Mask the middle digits of a phone number, keeping the first 3 and last 3
 * digits visible regardless of total length. Works for any country format
 * (Ghana 10 digits, US 11, UK 12, etc.) without assuming a fixed shape.
 *
 * Examples:
 *   "0241234567"       → "024····567"
 *   "+233241234567"    → "+23····567"   (the leading "+" counts as a non-digit)
 *   "+1 (555) 123-4567" → "+15····567"  (non-digits stripped from the middle)
 *   ""                  → ""
 *
 * Used on the OTP-verify screens so the user sees a faint reminder of which
 * number they entered without leaking the full digits to a shoulder-surfer.
 */
export function maskPhone(phone: string): string {
  if (!phone) return "";

  // Preserve a leading "+" but otherwise normalize to digits-only.
  const hasPlus = phone.trim().startsWith("+");
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) {
    // Too short to meaningfully mask; return as-is so the user still sees
    // something rather than a cryptic placeholder.
    return phone;
  }

  const head = digits.slice(0, 3);
  const tail = digits.slice(-3);
  const middleLength = Math.max(2, digits.length - 6);
  const middle = "·".repeat(Math.min(middleLength, 6));
  return `${hasPlus ? "+" : ""}${head}${middle}${tail}`;
}
