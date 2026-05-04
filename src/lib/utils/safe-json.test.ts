import { describe, it, expect } from "vitest";
import { safeJsonForScript } from "./safe-json";

// Regression coverage for FE-XSS / audit A5: the JSON-LD blob on every public
// designer profile is rendered through `dangerouslySetInnerHTML`. The escapes
// here are what stops a designer with hostile copy in their bio from breaking
// out of the inline <script> element.

describe("safeJsonForScript", () => {
  it("returns valid JSON for a simple object", () => {
    const result = safeJsonForScript({ name: "Kwame" });
    expect(result).toBe('{"name":"Kwame"}');
  });

  it("escapes `<` so `</script>` can't break out of an inline script tag", () => {
    const hostile = { bio: "</script><script>alert(1)</script>" };
    const out = safeJsonForScript(hostile);
    expect(out).not.toMatch(/</);
    expect(out).toContain("\\u003c");
  });

  it("escapes `>` for symmetry", () => {
    const out = safeJsonForScript({ html: ">>>" });
    expect(out).not.toMatch(/>/);
    expect(out).toContain("\\u003e\\u003e\\u003e");
  });

  it("escapes `&` so HTML entity injection can't smuggle markup", () => {
    const out = safeJsonForScript({ note: "Tom & Jerry" });
    expect(out).not.toMatch(/&/);
    expect(out).toContain("Tom \\u0026 Jerry");
  });

  it("escapes U+2028 (LINE SEPARATOR)", () => {
    // U+2028 is valid in a JSON string but illegal as a raw line terminator
    // in older JS parsing modes. Build the input via fromCharCode so this
    // test source stays 7-bit ASCII (the same trap the production code avoids).
    const ls = String.fromCharCode(0x2028);
    const out = safeJsonForScript({ bio: `line1${ls}line2` });
    expect(out).not.toContain(ls);
    expect(out).toContain("\\u2028");
  });

  it("escapes U+2029 (PARAGRAPH SEPARATOR)", () => {
    const ps = String.fromCharCode(0x2029);
    const out = safeJsonForScript({ bio: `para1${ps}para2` });
    expect(out).not.toContain(ps);
    expect(out).toContain("\\u2029");
  });

  it("preserves unicode characters that don't need escaping", () => {
    const out = safeJsonForScript({ name: "Akosua Asantewaa" });
    expect(out).toContain("Akosua Asantewaa");
  });

  it("handles arrays + nested objects", () => {
    const out = safeJsonForScript({
      tags: ["wedding", "kaba & slit"],
      meta: { html: "<b>" },
    });
    expect(out).not.toMatch(/[<>&]/);
    expect(out).toContain('"tags":["wedding","kaba \\u0026 slit"]');
    expect(out).toContain('"meta":{"html":"\\u003cb\\u003e"}');
  });

  it("output round-trips through JSON.parse to the original value", () => {
    const original = {
      bio: "Hello </script> world & co",
      tags: ["a<b", "c>d"],
    };
    const escaped = safeJsonForScript(original);
    expect(JSON.parse(escaped)).toEqual(original);
  });
});
