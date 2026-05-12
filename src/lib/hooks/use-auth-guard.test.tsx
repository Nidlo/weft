import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

const replaceSpy = vi.fn();
let mockPathname: string = "/orders/abc-123";
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceSpy, push: vi.fn(), back: vi.fn() }),
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

let mockAuthState = {
  user: null as null | { isOnboarded: boolean; isDesigner: boolean },
  isAuthenticated: false,
  isLoading: false,
  _hasHydrated: true,
};

vi.mock("@/lib/stores/auth", () => ({
  useAuthStore: <T,>(selector: (s: typeof mockAuthState) => T) =>
    selector(mockAuthState),
}));

import { useAuthGuard } from "./use-auth-guard";

beforeEach(() => {
  replaceSpy.mockReset();
  mockAuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    _hasHydrated: true,
  };
  mockPathname = "/orders/abc-123";
  mockSearchParams = new URLSearchParams();
});

describe("useAuthGuard", () => {
  it("redirects unauth users to /auth/phone with ?next= preserving the current path", () => {
    renderHook(() => useAuthGuard());

    expect(replaceSpy).toHaveBeenCalledWith(
      "/auth/phone?next=" + encodeURIComponent("/orders/abc-123")
    );
  });

  it("includes the query string in the captured next", () => {
    mockPathname = "/orders/abc-123";
    mockSearchParams = new URLSearchParams({ tab: "history" });

    renderHook(() => useAuthGuard());

    expect(replaceSpy).toHaveBeenCalledWith(
      "/auth/phone?next=" + encodeURIComponent("/orders/abc-123?tab=history")
    );
  });

  it("does NOT preserve next when the user is already on an auth page (would loop)", () => {
    mockPathname = "/auth/phone";

    renderHook(() => useAuthGuard());

    expect(replaceSpy).toHaveBeenCalledWith("/auth/phone");
  });

  it("does NOT preserve next when caller passes a non-default redirectTo", () => {
    renderHook(() => useAuthGuard({ redirectTo: "/somewhere-else" }));

    expect(replaceSpy).toHaveBeenCalledWith("/somewhere-else");
  });

  it("waits for hydration before redirecting", () => {
    mockAuthState._hasHydrated = false;

    renderHook(() => useAuthGuard());

    expect(replaceSpy).not.toHaveBeenCalled();
  });

  it("does not redirect when the user is authenticated", () => {
    mockAuthState = {
      ...mockAuthState,
      isAuthenticated: true,
      user: { isOnboarded: true, isDesigner: false },
    };

    renderHook(() => useAuthGuard());

    expect(replaceSpy).not.toHaveBeenCalled();
  });
});
