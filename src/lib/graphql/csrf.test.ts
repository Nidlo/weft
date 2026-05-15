import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { readXsrfCookie, ensureCsrfCookie, resetCsrfState } from "./csrf";

describe("readXsrfCookie", () => {
  beforeEach(() => {
    document.cookie = "";
    // Wipe any cookies jsdom is holding so each test starts clean.
    for (const c of document.cookie.split(";")) {
      const name = c.split("=")[0]?.trim();
      if (name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      }
    }
  });

  it("returns null when the cookie is missing", () => {
    expect(readXsrfCookie()).toBeNull();
  });

  it("reads the XSRF-TOKEN cookie value", () => {
    document.cookie = "XSRF-TOKEN=abc123; path=/";
    expect(readXsrfCookie()).toBe("abc123");
  });

  it("URL-decodes the cookie value (Sanctum encodes via rawurlencode)", () => {
    // Sanctum's CSRF cookie is URL-encoded; the header receives the decoded
    // value. e.g. literal `=` characters are encoded as `%3D`.
    document.cookie = "XSRF-TOKEN=hello%3Dworld; path=/";
    expect(readXsrfCookie()).toBe("hello=world");
  });

  it("returns the right value when other cookies are present", () => {
    document.cookie = "other=foo; path=/";
    document.cookie = "XSRF-TOKEN=zxy987; path=/";
    document.cookie = "session=bar; path=/";
    expect(readXsrfCookie()).toBe("zxy987");
  });
});

describe("ensureCsrfCookie + resetCsrfState", () => {
  beforeEach(() => {
    resetCsrfState();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    resetCsrfState();
  });

  it("calls /sanctum/csrf-cookie once on first invocation", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 204 }));

    await ensureCsrfCookie();
    await ensureCsrfCookie();
    await ensureCsrfCookie();

    // Once the priming succeeds, the helper memoizes — subsequent calls
    // are no-ops until `resetCsrfState()` is called.
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/sanctum/csrf-cookie");
    expect(init).toMatchObject({ credentials: "include" });
  });

  it("re-primes after `resetCsrfState()`", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 204 }));

    await ensureCsrfCookie();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    resetCsrfState();
    await ensureCsrfCookie();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("propagates errors from the priming fetch", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 500 })
    );

    await expect(ensureCsrfCookie()).rejects.toThrow(/csrf prime failed/);
  });

  it("retries after a failure (state is not stuck primed)", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(null, { status: 500 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    await expect(ensureCsrfCookie()).rejects.toThrow(/csrf prime failed/);
    // Second call must reach the network — the first attempt didn't memoise.
    await ensureCsrfCookie();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
