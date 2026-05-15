import { describe, it, expect } from "vitest";
import { CombinedGraphQLErrors } from "@apollo/client/errors";

import { extractErrorCode } from "./error-code";

describe("extractErrorCode", () => {
  it("returns null when the input isn't a CombinedGraphQLErrors", () => {
    expect(extractErrorCode(new Error("plain"))).toBeNull();
    expect(extractErrorCode(null)).toBeNull();
    expect(extractErrorCode(undefined)).toBeNull();
    expect(extractErrorCode("string error")).toBeNull();
  });

  it("returns the extensions.code from the first error that carries one", () => {
    const combined = new CombinedGraphQLErrors(
      // result shape: { errors: [...] }
      {
        errors: [{ message: "boom", extensions: { code: "DEPOSIT_NOT_PAID" } }],
      },
      [{ message: "boom", extensions: { code: "DEPOSIT_NOT_PAID" } }]
    );
    expect(extractErrorCode(combined)).toBe("DEPOSIT_NOT_PAID");
  });

  it("returns null when no error carries a code", () => {
    const combined = new CombinedGraphQLErrors(
      { errors: [{ message: "boom" }] },
      [{ message: "boom" }]
    );
    expect(extractErrorCode(combined)).toBeNull();
  });

  it("skips errors without a code and returns the first one that has it", () => {
    const combined = new CombinedGraphQLErrors(
      {
        errors: [
          { message: "no code" },
          { message: "boom", extensions: { code: "X" } },
        ],
      },
      [{ message: "no code" }, { message: "boom", extensions: { code: "X" } }]
    );
    expect(extractErrorCode(combined)).toBe("X");
  });
});
