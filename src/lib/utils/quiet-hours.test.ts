import { describe, it, expect } from "vitest";
import { isInQuietHours } from "./quiet-hours";

// All inputs are "HH:MM" 24h strings interpreted as UTC, matching the backend.
// Build `Date` fixtures via `Date.UTC(...)` so the test isn't sensitive to the
// machine's local timezone.

const at = (hour: number, min = 0): Date =>
  new Date(Date.UTC(2026, 4, 1, hour, min));

describe("isInQuietHours", () => {
  it("returns false when start is null", () => {
    expect(isInQuietHours(null, "07:00", at(23))).toBe(false);
  });

  it("returns false when end is null", () => {
    expect(isInQuietHours("22:00", null, at(23))).toBe(false);
  });

  it("returns false when both bounds are null", () => {
    expect(isInQuietHours(null, null, at(3))).toBe(false);
  });

  describe("same-day window (09:00 → 17:00)", () => {
    it("is in window at 12:00", () => {
      expect(isInQuietHours("09:00", "17:00", at(12))).toBe(true);
    });

    it("is at the start boundary inclusive", () => {
      expect(isInQuietHours("09:00", "17:00", at(9, 0))).toBe(true);
    });

    it("is NOT at the end boundary (exclusive)", () => {
      expect(isInQuietHours("09:00", "17:00", at(17, 0))).toBe(false);
    });

    it("is NOT before window", () => {
      expect(isInQuietHours("09:00", "17:00", at(8, 59))).toBe(false);
    });

    it("is NOT after window", () => {
      expect(isInQuietHours("09:00", "17:00", at(17, 1))).toBe(false);
    });
  });

  describe("overnight window (22:00 → 07:00)", () => {
    it("is in at 23:00 (post-start)", () => {
      expect(isInQuietHours("22:00", "07:00", at(23))).toBe(true);
    });

    it("is in at 03:00 (pre-end)", () => {
      expect(isInQuietHours("22:00", "07:00", at(3))).toBe(true);
    });

    it("is at the start boundary inclusive", () => {
      expect(isInQuietHours("22:00", "07:00", at(22, 0))).toBe(true);
    });

    it("is NOT at the end boundary (exclusive)", () => {
      expect(isInQuietHours("22:00", "07:00", at(7, 0))).toBe(false);
    });

    it("is NOT during the daytime gap", () => {
      expect(isInQuietHours("22:00", "07:00", at(12))).toBe(false);
    });

    it("handles minute-level precision", () => {
      expect(isInQuietHours("22:30", "07:00", at(22, 29))).toBe(false);
      expect(isInQuietHours("22:30", "07:00", at(22, 30))).toBe(true);
    });
  });
});
