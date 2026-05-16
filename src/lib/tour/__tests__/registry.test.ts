import { describe, it, expect } from "vitest";

import { TOURS, TOUR_IDS, ROUTE_FOR, tourForPath } from "../registry";
import { filterTourProgress } from "../filter-progress";

describe("tour registry", () => {
  it("every tour id has a definition and a route", () => {
    for (const id of TOUR_IDS) {
      expect(TOURS[id]).toBeDefined();
      expect(TOURS[id].id).toBe(id);
      expect(TOURS[id].steps.length).toBeGreaterThan(0);
      expect(ROUTE_FOR[id]).toMatch(/^\//);
    }
  });

  it("tour copy is plain ASCII (no AI typographic characters)", () => {
    // En/em dash, smart single + double quotes, ellipsis. Built from
    // codepoints so this file itself stays ASCII and doesn't trip the
    // pre-commit Q-13 character scan.
    const bannedChars = [
      0x2013, 0x2014, 0x2018, 0x2019, 0x201c, 0x201d, 0x2026,
    ].map((c) => String.fromCodePoint(c));
    const hasBanned = (s: string) => bannedChars.some((ch) => s.includes(ch));
    for (const id of TOUR_IDS) {
      for (const step of TOURS[id].steps) {
        expect(hasBanned(step.title), `${id} title`).toBe(false);
        expect(hasBanned(step.body), `${id} body`).toBe(false);
      }
    }
  });
});

describe("tourForPath", () => {
  it.each([
    ["/dashboard", "dashboard"],
    ["/dashboard/", "dashboard"],
    ["/measurements", "measurements"],
    ["/blueprint", "newOrder"],
    ["/messages", "messages"],
    ["/messages/abc-123", "messages"],
    ["/profile/edit", "profileEdit"],
    ["/orders/order-uuid-123", "orderDetail"],
  ])("%s -> %s", (path, expected) => {
    expect(tourForPath(path)).toBe(expected);
  });

  it("profile/edit wins over a bare /profile prefix", () => {
    // /profile itself has no tour; only the edit screen does.
    expect(tourForPath("/profile")).toBeNull();
    expect(tourForPath("/profile/edit")).toBe("profileEdit");
  });

  it("the orders list itself has no tour, only an order detail page", () => {
    expect(tourForPath("/orders")).toBeNull();
    expect(tourForPath("/orders/")).toBeNull();
    expect(tourForPath("/orders/abc")).toBe("orderDetail");
  });

  it("returns null for routes without a tour", () => {
    expect(tourForPath("/settings")).toBeNull();
    expect(tourForPath("/wallet")).toBeNull();
    expect(tourForPath("/")).toBeNull();
  });
});

describe("filterTourProgress", () => {
  it("returns an empty object for null / undefined", () => {
    expect(filterTourProgress(null)).toEqual({});
    expect(filterTourProgress(undefined)).toEqual({});
  });

  it("keeps known ids with valid outcomes", () => {
    expect(
      filterTourProgress({ home: "completed", measurements: "skipped" })
    ).toEqual({ home: "completed", measurements: "skipped" });
  });

  it("drops unknown ids and invalid outcomes", () => {
    expect(
      filterTourProgress({
        home: "completed",
        futureTour: "completed",
        messages: "maybe",
      } as unknown as Record<string, "completed" | "skipped">)
    ).toEqual({ home: "completed" });
  });
});
