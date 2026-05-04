// Some toolchains (Next 15 turbopack) are unhappy with literal U+2028 / U+2029
// in source files. Build the patterns via the RegExp constructor with
// explicit \u escapes so source bytes stay 7-bit ASCII.
const LS_RE = new RegExp("\\u2028", "g");
const PS_RE = new RegExp("\\u2029", "g");

/**
 * JSON-stringify a value safely for embedding in an inline `<script>` tag
 * (e.g. JSON-LD payload). Escapes:
 * - `<` `>` `&` so a `</script>` token in user-controlled strings can't break
 *   out of the script element (FE-XSS, audit A5).
 * - U+2028 (LINE SEPARATOR) + U+2029 (PARAGRAPH SEPARATOR), which are valid
 *   inside JSON strings but illegal as raw line terminators in older JS
 *   engines and parsing modes — they'd raise a SyntaxError when the inline
 *   script executes.
 *
 * Returns a string suitable for `dangerouslySetInnerHTML`.
 */
export function safeJsonForScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(LS_RE, "\\u2028")
    .replace(PS_RE, "\\u2029");
}
