import { describe, it, expect } from "vitest";
import { safeNext } from "./safe-next";

describe("safeNext", () => {
  it("returns the candidate when it's a safe same-origin path", () => {
    expect(safeNext("/orders/abc-123")).toBe("/orders/abc-123");
    expect(safeNext("/payouts/0190abcd")).toBe("/payouts/0190abcd");
    expect(safeNext("/messages/xyz?tab=unread")).toBe(
      "/messages/xyz?tab=unread"
    );
  });

  it("falls back to default when candidate is null/empty/whitespace", () => {
    expect(safeNext(null)).toBe("/dashboard");
    expect(safeNext(undefined)).toBe("/dashboard");
    expect(safeNext("")).toBe("/dashboard");
    expect(safeNext("   ")).toBe("/dashboard");
  });

  it("rejects protocol-relative URLs (//evil.com/path)", () => {
    expect(safeNext("//evil.com/steal")).toBe("/dashboard");
    expect(safeNext("//evil.com")).toBe("/dashboard");
  });

  it("rejects absolute URLs (http/https/protocol handlers)", () => {
    expect(safeNext("https://evil.com/path")).toBe("/dashboard");
    expect(safeNext("http://evil.com")).toBe("/dashboard");
    expect(safeNext("javascript:alert(1)")).toBe("/dashboard");
    expect(safeNext("mailto:victim@nidlo.test")).toBe("/dashboard");
    expect(safeNext("data:text/html,<script>")).toBe("/dashboard");
  });

  it("rejects backslash smuggling and embedded-protocol tricks", () => {
    expect(safeNext("/\\evil.com")).toBe("/dashboard");
    expect(safeNext("/javascript:alert(1)")).toBe("/dashboard");
    expect(safeNext("/HTTPS:evil.com")).toBe("/dashboard");
  });

  it("rejects bounces back into auth pages (would loop)", () => {
    expect(safeNext("/auth/phone")).toBe("/dashboard");
    expect(safeNext("/auth/verify")).toBe("/dashboard");
    expect(safeNext("/auth/role")).toBe("/dashboard");
    expect(safeNext("/auth/phone?next=/orders/x")).toBe("/dashboard");
    expect(safeNext("/auth/role/some-sub")).toBe("/dashboard");
  });

  it("honors a custom fallback", () => {
    expect(safeNext(null, "/profile")).toBe("/profile");
    expect(safeNext("https://evil.com", "/profile")).toBe("/profile");
  });

  it("paths must start with a single forward slash", () => {
    expect(safeNext("orders/abc")).toBe("/dashboard");
    expect(safeNext("./orders")).toBe("/dashboard");
    expect(safeNext("../admin")).toBe("/dashboard");
  });
});
