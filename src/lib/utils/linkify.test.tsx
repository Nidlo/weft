import { describe, it, expect } from "vitest";
import { isValidElement } from "react";
import { containsUrl, linkify } from "./linkify";

function joinTexts(parts: ReturnType<typeof linkify>): string {
  return parts
    .map((p) => {
      if (typeof p === "string") return p;
      if (isValidElement(p)) {
        const props = p.props as { children?: unknown; href?: string };
        // Anchor: emit "[label|href]" so we can assert both.
        if (typeof props.children === "string" && props.href) {
          return `[${props.children}|${props.href}]`;
        }
      }
      return "";
    })
    .join("");
}

describe("linkify", () => {
  it("returns the original string when no URLs are present", () => {
    const result = linkify("just plain text");
    expect(result).toEqual(["just plain text"]);
  });

  it("wraps a single URL in an <a> with matching href", () => {
    const result = linkify("Visit https://nidlo.com today");
    expect(joinTexts(result)).toBe("Visit [https://nidlo.com|https://nidlo.com] today");
  });

  it("strips a trailing period from the matched URL", () => {
    const result = linkify("Visit https://nidlo.com.");
    expect(joinTexts(result)).toBe("Visit [https://nidlo.com|https://nidlo.com].");
  });

  it("strips a trailing comma from the matched URL", () => {
    const result = linkify("See https://nidlo.com, then come back.");
    expect(joinTexts(result)).toBe(
      "See [https://nidlo.com|https://nidlo.com], then come back."
    );
  });

  it("strips multiple trailing punctuation chars", () => {
    const result = linkify("Wow https://nidlo.com!!!");
    expect(joinTexts(result)).toBe("Wow [https://nidlo.com|https://nidlo.com]!!!");
  });

  it("preserves a parenthesised path inside the URL but trims a closing paren after it", () => {
    const result = linkify("Read https://en.wikipedia.org/wiki/Tailor)");
    expect(joinTexts(result)).toBe(
      "Read [https://en.wikipedia.org/wiki/Tailor|https://en.wikipedia.org/wiki/Tailor])"
    );
  });

  it("handles two URLs in the same message", () => {
    const result = linkify("Pick https://a.com or https://b.com.");
    expect(joinTexts(result)).toBe(
      "Pick [https://a.com|https://a.com] or [https://b.com|https://b.com]."
    );
  });
});

describe("containsUrl", () => {
  it("returns true when text has a URL", () => {
    expect(containsUrl("hello https://x.com world")).toBe(true);
  });

  it("returns false for plain text", () => {
    expect(containsUrl("hello world")).toBe(false);
  });

  it("is reusable across calls (regex lastIndex resets)", () => {
    expect(containsUrl("https://a.com")).toBe(true);
    expect(containsUrl("plain")).toBe(false);
    expect(containsUrl("https://b.com")).toBe(true);
  });
});
