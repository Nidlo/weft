import { describe, it, expect } from "vitest";

import { maskPhone } from "./phone";

describe("maskPhone", () => {
  it("returns an empty string for an empty input", () => {
    expect(maskPhone("")).toBe("");
  });

  it("masks a 10-digit Ghana number keeping head + tail visible", () => {
    expect(maskPhone("0241234567")).toBe("024····567");
  });

  it("preserves the leading '+' on an international number", () => {
    const masked = maskPhone("+233241234567");
    expect(masked.startsWith("+")).toBe(true);
    expect(masked.endsWith("567")).toBe(true);
    expect(masked).not.toContain("4123");
  });

  it("strips non-digits from the formatted US shape but keeps + prefix", () => {
    const masked = maskPhone("+1 (555) 123-4567");
    expect(masked.startsWith("+")).toBe(true);
    expect(masked.endsWith("567")).toBe(true);
    // No middle digits exposed
    expect(masked).not.toContain("123");
  });

  it("returns short inputs unchanged (under 7 digits)", () => {
    expect(maskPhone("12345")).toBe("12345");
  });
});
