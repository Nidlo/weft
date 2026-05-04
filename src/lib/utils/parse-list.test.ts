import { describe, it, expect } from "vitest";
import { parseStringList } from "./parse-list";

// Backend can return JSONB array fields (specializations, portfolio images,
// etc.) as either real arrays or JSON-encoded strings depending on the
// resolver. This helper normalises both into a string[].

describe("parseStringList", () => {
  it("returns a real array as-is", () => {
    expect(parseStringList(["a", "b", "c"])).toEqual(["a", "b", "c"]);
  });

  it("parses a JSON-encoded array", () => {
    expect(parseStringList('["wedding","kaba_slit"]')).toEqual([
      "wedding",
      "kaba_slit",
    ]);
  });

  it("returns empty for null", () => {
    expect(parseStringList(null)).toEqual([]);
  });

  it("returns empty for undefined", () => {
    expect(parseStringList(undefined)).toEqual([]);
  });

  it("returns empty for a number", () => {
    expect(parseStringList(42)).toEqual([]);
  });

  it("returns empty for a boolean", () => {
    expect(parseStringList(true)).toEqual([]);
  });

  it("returns empty for malformed JSON", () => {
    expect(parseStringList("[not json")).toEqual([]);
  });

  it("returns empty when JSON parses to a non-array (object)", () => {
    expect(parseStringList('{"a":1}')).toEqual([]);
  });

  it("returns empty when JSON parses to a scalar", () => {
    // Critical: '"hello"' parses to "hello" — without the array guard we'd
    // accidentally return ['h','e','l','l','o'] from `[...string]` somewhere.
    expect(parseStringList('"hello"')).toEqual([]);
  });

  it("returns empty for an empty string", () => {
    expect(parseStringList("")).toEqual([]);
  });

  it("preserves an empty array", () => {
    expect(parseStringList([])).toEqual([]);
  });
});
