import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const useAuthGuardSpy = vi.fn();
const logoutSpy = vi.fn();
const signOutAllSpy = vi.fn().mockResolvedValue(undefined);

vi.mock("@/lib/hooks/use-auth-guard", () => ({
  useAuthGuard: (...args: unknown[]) => useAuthGuardSpy(...args),
}));

vi.mock("@/lib/hooks/use-logout", () => ({
  useLogout: () => ({ logout: logoutSpy, loading: false }),
  useSignOutAllDevices: () => ({ signOutAll: signOutAllSpy, loading: false }),
}));

vi.mock("@/components/layout/app-shell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}));

vi.mock("@/lib/config", () => ({
  APP_VERSION: "1.2.3-test",
}));

// ReplayMenu calls next/navigation's useRouter, which needs an app
// router context that's not mounted here. Stub it out — the menu has
// its own dedicated tests for behavior.
vi.mock("@/lib/tour/replay-menu", () => ({
  ReplayMenu: () => <div data-testid="replay-menu" />,
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
  logoutSpy.mockReset();
  signOutAllSpy.mockClear();
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

  it("hides the Earnings tile from clients", () => {
    useAuthGuardSpy.mockReturnValue({ user: CLIENT_USER, isReady: true });
    render(<SettingsPage />);
    expect(screen.getByRole("link", { name: /^account/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /^earnings/i })
    ).not.toBeInTheDocument();
  });

  it("shows the Earnings tile for designers", () => {
    useAuthGuardSpy.mockReturnValue({ user: DESIGNER_USER, isReady: true });
    render(<SettingsPage />);
    expect(
      screen.getByRole("link", { name: /^earnings/i })
    ).toBeInTheDocument();
  });

  it("renders the coming-soon section with Soon badges", () => {
    useAuthGuardSpy.mockReturnValue({ user: CLIENT_USER, isReady: true });
    render(<SettingsPage />);
    expect(screen.getByText(/^coming soon$/i)).toBeInTheDocument();
    expect(screen.getAllByText(/^soon$/i).length).toBeGreaterThanOrEqual(1);
  });

  it("renders the version footer + sign-out actions", () => {
    useAuthGuardSpy.mockReturnValue({ user: CLIENT_USER, isReady: true });
    render(<SettingsPage />);
    expect(screen.getByText(/Nidlo · v1\.2\.3-test/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^log out$/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign out of all devices/i })
    ).toBeInTheDocument();
  });

  it("opens the confirm dialog when 'Sign out of all devices' is clicked", () => {
    useAuthGuardSpy.mockReturnValue({ user: CLIENT_USER, isReady: true });
    render(<SettingsPage />);
    fireEvent.click(
      screen.getByRole("button", { name: /sign out of all devices/i })
    );
    expect(
      screen.getByRole("heading", { name: /sign out of all devices\?/i })
    ).toBeInTheDocument();
  });
});
