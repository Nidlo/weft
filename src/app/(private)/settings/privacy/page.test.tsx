import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

const useAuthGuardSpy = vi.fn();

vi.mock("@/lib/hooks/use-auth-guard", () => ({
  useAuthGuard: (...args: unknown[]) => useAuthGuardSpy(...args),
}));

vi.mock("@/components/layout/app-shell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}));

import PrivacySettingsPage from "./page";
import {
  CONSENT_VERSION,
  __resetConsentCacheForTests,
} from "@/lib/consent/use-consent";

const STORAGE_KEY = "nidlo:consent:v1";

const USER = {
  id: "u-1",
  firstName: "Adwoa",
  lastName: "Mensah",
  fullName: "Adwoa Mensah",
  isOnboarded: true,
};

beforeEach(() => {
  window.localStorage.clear();
  __resetConsentCacheForTests();
  useAuthGuardSpy.mockReset();
  useAuthGuardSpy.mockReturnValue({ user: USER, isReady: true });
});

describe("PrivacySettingsPage", () => {
  it("renders the loading skeleton until the auth guard resolves", () => {
    useAuthGuardSpy.mockReturnValue({ user: null, isReady: false });
    const { container } = render(<PrivacySettingsPage />);
    expect(
      container.querySelectorAll("[data-slot=skeleton]").length
    ).toBeGreaterThan(0);
  });

  it("tells the user they haven't decided yet when no consent record exists", () => {
    render(<PrivacySettingsPage />);
    expect(screen.getByTestId("consent-state-copy")).toHaveTextContent(
      /haven't decided yet/i
    );
  });

  it("shows the accepted-on copy when analytics was opted in", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        analytics: true,
        decidedAt: "2026-05-15T12:00:00.000Z",
        version: CONSENT_VERSION,
      })
    );
    render(<PrivacySettingsPage />);
    expect(screen.getByTestId("consent-state-copy")).toHaveTextContent(
      /accepted analytics cookies/i
    );
  });

  it("shows the declined-on copy when analytics was opted out", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        analytics: false,
        decidedAt: "2026-05-15T12:00:00.000Z",
        version: CONSENT_VERSION,
      })
    );
    render(<PrivacySettingsPage />);
    expect(screen.getByTestId("consent-state-copy")).toHaveTextContent(
      /declined analytics cookies/i
    );
  });

  it("clicking 'Change my choices' clears the stored record (so the banner re-prompts)", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        analytics: true,
        decidedAt: "2026-05-15T12:00:00.000Z",
        version: CONSENT_VERSION,
      })
    );

    render(<PrivacySettingsPage />);

    act(() => {
      fireEvent.click(screen.getByTestId("consent-reset"));
    });

    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(screen.getByTestId("consent-state-copy")).toHaveTextContent(
      /haven't decided yet/i
    );
  });

  it("links to the public privacy and cookie policy pages", () => {
    render(<PrivacySettingsPage />);
    expect(
      screen.getByRole("link", { name: /our privacy policy/i })
    ).toHaveAttribute("href", "/privacy");
    expect(
      screen.getByRole("link", { name: /our cookie policy/i })
    ).toHaveAttribute("href", "/cookies");
  });
});
