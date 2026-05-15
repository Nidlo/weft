import { describe, it, expect } from "vitest";

import { buildClaimedToast } from "./claimed-toast";

describe("buildClaimedToast", () => {
  it("returns null when both counts are 0 so the caller skips the toast", () => {
    expect(buildClaimedToast(0, 0)).toBeNull();
  });

  it("handles the orders-only path with singular plural", () => {
    expect(buildClaimedToast(1, 0)).toBe("Linked 1 order we held for you.");
  });

  it("handles the orders-only path with plural", () => {
    expect(buildClaimedToast(3, 0)).toBe("Linked 3 orders we held for you.");
  });

  it("handles the measurements-only path with singular", () => {
    expect(buildClaimedToast(0, 1)).toBe(
      "Linked 1 measurement we held for you."
    );
  });

  it("handles the measurements-only path with plural", () => {
    expect(buildClaimedToast(0, 4)).toBe(
      "Linked 4 measurements we held for you."
    );
  });

  it("composes both categories with correct singular/plural per-category", () => {
    expect(buildClaimedToast(2, 1)).toBe(
      "Linked 2 orders and 1 measurement we held for you."
    );
    expect(buildClaimedToast(1, 2)).toBe(
      "Linked 1 order and 2 measurements we held for you."
    );
    expect(buildClaimedToast(1, 1)).toBe(
      "Linked 1 order and 1 measurement we held for you."
    );
    expect(buildClaimedToast(5, 7)).toBe(
      "Linked 5 orders and 7 measurements we held for you."
    );
  });

  it("treats negative counts as zero (defensive - backend should never send these)", () => {
    expect(buildClaimedToast(-1, -3)).toBeNull();
    expect(buildClaimedToast(-1, 2)).toBe(
      "Linked 2 measurements we held for you."
    );
  });
});
