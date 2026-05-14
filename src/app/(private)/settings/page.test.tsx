import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const useAuthGuardSpy = vi.fn();

vi.mock("@/lib/hooks/use-auth-guard", () => ({
  useAuthGuard: (...args: unknown[]) => useAuthGuardSpy(...args),
}));

vi.mock("@/components/layout/app-shell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}));

import SettingsPage from "./page";

const CLIENT_USER = {
  id: "u-1",
  isDesigner: false,
  isOnboarded: true,
};

const DESIGNER_USER = {
  id: "u-2",
  isDesigner: true,
  isOnboarded: true,
};

beforeEach(() => {
  useAuthGuardSpy.mockReset();
});

describe("SettingsPage", () => {
  it("renders the loading skeleton while the auth guard isn't ready", () => {
    useAuthGuardSpy.mockReturnValue({ user: null, isReady: false });
    const { container } = render(<SettingsPage />);
    expect(
      container.querySelectorAll("[data-slot=skeleton]").length
    ).toBeGreaterThan(0);
  });

  it("renders the editorial header + back link", () => {
    useAuthGuardSpy.mockReturnValue({ user: CLIENT_USER, isReady: true });
    render(<SettingsPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: /^settings$/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/back to profile/i)).toBeInTheDocument();
  });

  it("renders the configuration tiles (Notifications, Privacy, About) for clients", () => {
    useAuthGuardSpy.mockReturnValue({ user: CLIENT_USER, isReady: true });
    render(<SettingsPage />);
    expect(
      screen.getByRole("link", { name: /notifications/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^privacy/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /about nidlo/i })
    ).toBeInTheDocument();
  });

  it("does not duplicate Profile-owned tiles (Account, Earnings) on Settings", () => {
    useAuthGuardSpy.mockReturnValue({ user: DESIGNER_USER, isReady: true });
    render(<SettingsPage />);
    expect(
      screen.queryByRole("link", { name: /^account/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /^earnings/i })
    ).not.toBeInTheDocument();
  });

  it("does not duplicate Profile-owned sign-out actions", () => {
    useAuthGuardSpy.mockReturnValue({ user: CLIENT_USER, isReady: true });
    render(<SettingsPage />);
    expect(
      screen.queryByRole("button", { name: /^log out$/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /sign out of all devices/i })
    ).not.toBeInTheDocument();
  });

  it("surfaces Delete account in the Danger zone", () => {
    useAuthGuardSpy.mockReturnValue({ user: CLIENT_USER, isReady: true });
    render(<SettingsPage />);
    expect(screen.getByText(/danger zone/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /delete account/i })
    ).toBeInTheDocument();
  });

  it("renders the coming-soon section with Soon badges", () => {
    useAuthGuardSpy.mockReturnValue({ user: CLIENT_USER, isReady: true });
    render(<SettingsPage />);
    expect(screen.getByText(/^coming soon$/i)).toBeInTheDocument();
    expect(screen.getAllByText(/^soon$/i).length).toBeGreaterThanOrEqual(1);
  });
});
