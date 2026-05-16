import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import {
  ssrGraphQL,
  ssrGraphqlEndpoint,
  GraphQLTransportError,
} from "./ssr-fetch";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  // Vitest already sets NODE_ENV=test; the dev-TLS branch keys off
  // "!== production" so the default is correct without touching it
  // (NODE_ENV is readonly in the Next type defs).
  process.env.API_URL_SERVER = "http://api.test/graphql";
  delete process.env.NEXT_PUBLIC_API_URL;
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("ssrGraphqlEndpoint", () => {
  it("prefers API_URL_SERVER over NEXT_PUBLIC_API_URL", () => {
    process.env.API_URL_SERVER = "http://server/graphql";
    process.env.NEXT_PUBLIC_API_URL = "https://public/graphql";
    expect(ssrGraphqlEndpoint()).toBe("http://server/graphql");
  });

  it("falls back to NEXT_PUBLIC_API_URL", () => {
    delete process.env.API_URL_SERVER;
    process.env.NEXT_PUBLIC_API_URL = "https://public/graphql";
    expect(ssrGraphqlEndpoint()).toBe("https://public/graphql");
  });

  it("returns null when neither is set", () => {
    delete process.env.API_URL_SERVER;
    delete process.env.NEXT_PUBLIC_API_URL;
    expect(ssrGraphqlEndpoint()).toBeNull();
  });
});

describe("ssrGraphQL", () => {
  it("returns data on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: { designer: { id: "d-1" } } }),
      })
    );
    const data = await ssrGraphQL<{ designer: { id: string } }>("q", {});
    expect(data.designer.id).toBe("d-1");
  });

  it("throws GraphQLTransportError when no endpoint is configured", async () => {
    delete process.env.API_URL_SERVER;
    delete process.env.NEXT_PUBLIC_API_URL;
    await expect(ssrGraphQL("q", {})).rejects.toBeInstanceOf(
      GraphQLTransportError
    );
  });

  it("throws GraphQLTransportError on a non-OK HTTP status (NOT a null/not-found)", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue({ ok: false, status: 502, json: async () => ({}) })
    );
    await expect(ssrGraphQL("q", {})).rejects.toBeInstanceOf(
      GraphQLTransportError
    );
  });

  it("throws GraphQLTransportError when the fetch itself rejects (e.g. self-signed cert)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("self signed certificate"))
    );
    await expect(ssrGraphQL("q", {})).rejects.toBeInstanceOf(
      GraphQLTransportError
    );
  });

  it("throws GraphQLTransportError when the response carries GraphQL errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          errors: [{ message: "Cannot query field publicVisibility" }],
        }),
      })
    );
    await expect(ssrGraphQL("q", {})).rejects.toBeInstanceOf(
      GraphQLTransportError
    );
  });
});
