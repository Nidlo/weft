import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// The store mock has to be hoisted before the client import so that the
// errorLink picks up the mocked logout. We expose `logoutSpy` from a
// closure so each test can assert against it without re-mocking the module.
const logoutSpy = vi.fn();
const fakeStore = { logout: logoutSpy };
vi.mock("@/lib/stores/auth", () => ({
  useAuthStore: {
    getState: () => fakeStore,
    subscribe: vi.fn(),
    setState: vi.fn(),
  },
}));

vi.mock("@/lib/graphql/csrf", () => ({
  ensureCsrfCookie: vi.fn(() => Promise.resolve()),
  resetCsrfState: vi.fn(),
  readXsrfCookie: vi.fn(() => null),
}));

import {
  apolloClient,
  mergeDesignerPage,
  probeSessionAndLogoutIfDead,
} from "./client";

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

describe("probeSessionAndLogoutIfDead (Apollo errorLink Me-probe)", () => {
  beforeEach(() => {
    logoutSpy.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does NOT logout when Me confirms the session is alive", async () => {
    // Bug A: a transient Unauthenticated from a non-Me query (e.g.
    // RealtimeProvider's UnreadMessagesCount racing the freshly-set
    // cookie post-verifyOtp) must not silently log the user out.
    // The probe asks Me directly — if Me says we're authenticated,
    // the original error was a fluke and we ignore it.
    vi.spyOn(apolloClient, "query").mockResolvedValueOnce({
      data: { me: { id: "u-1", phone: "+233557560032" } },
      loading: false,
      networkStatus: 7,
    } as unknown as Awaited<ReturnType<typeof apolloClient.query>>);

    await probeSessionAndLogoutIfDead();

    expect(logoutSpy).not.toHaveBeenCalled();
  });

  it("logs out when Me also confirms the session is dead", async () => {
    // Real session expiry — Me itself fails Unauthenticated.
    // We catch on the rejection and trigger logout so the UI re-routes.
    vi.spyOn(apolloClient, "query").mockRejectedValueOnce(
      new Error("Unauthenticated.")
    );

    await probeSessionAndLogoutIfDead();

    expect(logoutSpy).toHaveBeenCalledTimes(1);
  });

  it("logs out when Me resolves with no user (data.me is null)", async () => {
    vi.spyOn(apolloClient, "query").mockResolvedValueOnce({
      data: { me: null },
      loading: false,
      networkStatus: 7,
    } as unknown as Awaited<ReturnType<typeof apolloClient.query>>);

    await probeSessionAndLogoutIfDead();

    expect(logoutSpy).toHaveBeenCalledTimes(1);
  });

  it("dedupes concurrent probes — only one Me query fires per cluster", async () => {
    // When 401s arrive in a burst (e.g. several queries all fail at once
    // after a real session expiry), the probe should fire ONCE and
    // logout ONCE — not N times.
    const querySpy = vi.spyOn(apolloClient, "query").mockResolvedValueOnce({
      data: { me: null },
      loading: false,
      networkStatus: 7,
    } as unknown as Awaited<ReturnType<typeof apolloClient.query>>);

    await Promise.all([
      probeSessionAndLogoutIfDead(),
      probeSessionAndLogoutIfDead(),
      probeSessionAndLogoutIfDead(),
    ]);

    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(logoutSpy).toHaveBeenCalledTimes(1);
  });
});
