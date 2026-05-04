import { describe, it, expect } from "vitest";
import { mergeDesignerPage } from "./client";

// Regression coverage for the B9 fix to audit H9: when filters change (or
// the user lands fresh), the merge function MUST reset the cache entry
// rather than concatenate. Apollo's `args.after` flags whether this is a
// pagination call (cursor present) or a fresh fetch.

describe("mergeDesignerPage", () => {
  it("returns incoming verbatim when there is no existing entry", () => {
    const incoming = { data: [{ id: "a" }], paginatorInfo: { count: 1 } };
    const result = mergeDesignerPage(undefined, incoming, { after: "X" });
    expect(result).toBe(incoming);
  });

  it("resets to incoming when args.after is missing (fresh search)", () => {
    const existing = {
      data: [{ id: "old-1" }, { id: "old-2" }],
      paginatorInfo: { count: 2 },
    };
    const incoming = {
      data: [{ id: "new-1" }],
      paginatorInfo: { count: 1 },
    };
    // No cursor → user changed filter / first load. Drop existing data.
    const result = mergeDesignerPage(existing, incoming, {});
    expect(result).toBe(incoming);
  });

  it("resets when args is null", () => {
    const existing = {
      data: [{ id: "old" }],
      paginatorInfo: { count: 1 },
    };
    const incoming = {
      data: [{ id: "new" }],
      paginatorInfo: { count: 1 },
    };
    const result = mergeDesignerPage(existing, incoming, null);
    expect(result).toBe(incoming);
  });

  it("concatenates incoming onto existing when args.after is present", () => {
    const existing = {
      data: [{ id: "1" }, { id: "2" }],
      paginatorInfo: { count: 2, hasMorePages: true, endCursor: "C" },
    };
    const incoming = {
      data: [{ id: "3" }, { id: "4" }],
      paginatorInfo: { count: 2, hasMorePages: false, endCursor: null },
    };
    const result = mergeDesignerPage(existing, incoming, {
      after: "C",
    }) as Record<string, unknown>;
    expect(result.data).toEqual([
      { id: "1" },
      { id: "2" },
      { id: "3" },
      { id: "4" },
    ]);
    // Pagination metadata follows the latest page.
    expect(result.paginatorInfo).toEqual({
      count: 2,
      hasMorePages: false,
      endCursor: null,
    });
  });

  it("handles existing without a `data` array (defensive)", () => {
    const existing = { paginatorInfo: { count: 0 } };
    const incoming = {
      data: [{ id: "1" }],
      paginatorInfo: { count: 1 },
    };
    const result = mergeDesignerPage(existing, incoming, {
      after: "C",
    }) as Record<string, unknown>;
    expect(result.data).toEqual([{ id: "1" }]);
  });
});
