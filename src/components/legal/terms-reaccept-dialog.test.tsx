import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock Apollo's react bindings BEFORE importing the component so we can
// drive `useQuery` / `useMutation` from each test without spinning up
// MockedProvider. Each test sets the next return values via the spies.
const useQuerySpy = vi.fn<(...args: unknown[]) => unknown>();
const mutateSpy = vi.fn<(...args: unknown[]) => unknown>();
const useMutationSpy = vi.fn<(...args: unknown[]) => unknown>(() => [
  mutateSpy,
  { loading: false },
]);

vi.mock("@apollo/client/react", () => ({
  useQuery: (...args: unknown[]) => useQuerySpy(...args),
  useMutation: (...args: unknown[]) => useMutationSpy(...args),
}));

import { useAuthStore } from "@/lib/stores/auth";
import type { User } from "@/lib/stores/auth";
import { TermsReacceptDialog } from "./terms-reaccept-dialog";

interface AuthSeed {
  user?: User | null;
  isAuthenticated?: boolean;
  isLoading?: boolean;
  _hasHydrated?: boolean;
}

function setAuthState(seed: AuthSeed): void {
  // setState accepts a partial state object; the explicit `AuthSeed` type
  // (vs `Parameters<typeof setState>[0]`) keeps the overload narrowing
  // under strict TS so partial seeds compile without complaints about
  // missing fields.
  useAuthStore.setState(seed as Parameters<typeof useAuthStore.setState>[0]);
}

beforeEach(() => {
  useQuerySpy.mockReset();
  mutateSpy.mockReset();
  useMutationSpy.mockClear();
  // Default: signed-in user, hydrated, terms version 2026-04-01.
  setAuthState({
    user: {
      id: "user-1",
      firstName: "Kofi",
      lastName: "Mensah",
      otherNames: null,
      fullName: "Kofi Mensah",
      phone: "+233241000001",
      email: null,
      avatarUrl: null,
      city: null,
      isDesigner: false,
      isOnboarded: true,
      termsAcceptedVersion: "2026-04-01",
    },
    isAuthenticated: true,
    isLoading: false,
    _hasHydrated: true,
  });
});

describe("<TermsReacceptDialog />", () => {
  it("renders nothing when the user's accepted version matches the live version", () => {
    useQuerySpy.mockReturnValue({
      data: {
        legalVersions: {
          termsVersion: "2026-04-01",
          privacyVersion: "2026-04-01",
        },
      },
    });

    render(<TermsReacceptDialog />);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByText(/We've updated our Terms/)).toBeNull();
  });

  it("renders the dialog when versions differ (stale acceptance)", () => {
    useQuerySpy.mockReturnValue({
      data: {
        legalVersions: {
          termsVersion: "2026-05-01",
          privacyVersion: "2026-04-01",
        },
      },
    });

    render(<TermsReacceptDialog />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/We've updated our Terms/)).toBeInTheDocument();
    // Both versions surfaced for context.
    expect(screen.getByText("2026-04-01")).toBeInTheDocument();
    expect(screen.getByText("2026-05-01")).toBeInTheDocument();
  });

  it("does NOT show the dialog when the user is unauthenticated", () => {
    setAuthState({ user: null, isAuthenticated: false });
    useQuerySpy.mockReturnValue({
      data: {
        legalVersions: {
          termsVersion: "2026-05-01",
          privacyVersion: "2026-04-01",
        },
      },
    });

    render(<TermsReacceptDialog />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("does NOT show the dialog before auth store hydration completes", () => {
    setAuthState({ _hasHydrated: false });
    useQuerySpy.mockReturnValue({
      data: {
        legalVersions: {
          termsVersion: "2026-05-01",
          privacyVersion: "2026-04-01",
        },
      },
    });

    render(<TermsReacceptDialog />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("does NOT show the dialog when the user has never accepted (null) — handled by onboarding wizard", () => {
    setAuthState({
      user: {
        id: "user-1",
        firstName: "Kofi",
        lastName: "Mensah",
        otherNames: null,
        fullName: "Kofi Mensah",
        phone: "+233241000001",
        email: null,
        avatarUrl: null,
        city: null,
        isDesigner: false,
        isOnboarded: true,
        termsAcceptedVersion: null,
      },
    });
    useQuerySpy.mockReturnValue({
      data: {
        legalVersions: {
          termsVersion: "2026-05-01",
          privacyVersion: "2026-04-01",
        },
      },
    });

    render(<TermsReacceptDialog />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("Accept button fires the mutation and refreshes the auth-store version", async () => {
    useQuerySpy.mockReturnValue({
      data: {
        legalVersions: {
          termsVersion: "2026-05-01",
          privacyVersion: "2026-04-01",
        },
      },
    });
    mutateSpy.mockResolvedValue({
      data: {
        acceptUpdatedTerms: {
          id: "user-1",
          termsAcceptedVersion: "2026-05-01",
        },
      },
    });

    render(<TermsReacceptDialog />);

    fireEvent.click(
      screen.getByRole("button", { name: /accept the updated terms/i })
    );

    await waitFor(() => {
      expect(mutateSpy).toHaveBeenCalledTimes(1);
    });

    // Auth store reflects the new version after the mutation resolves.
    await waitFor(() => {
      expect(useAuthStore.getState().user?.termsAcceptedVersion).toBe(
        "2026-05-01"
      );
    });
  });

  it("Read updated Terms link points at /terms in a new tab", () => {
    useQuerySpy.mockReturnValue({
      data: {
        legalVersions: {
          termsVersion: "2026-05-01",
          privacyVersion: "2026-04-01",
        },
      },
    });

    render(<TermsReacceptDialog />);
    const link = screen.getByRole("link", { name: /read the updated terms/i });
    expect(link.getAttribute("href")).toBe("/terms");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
  });
});
