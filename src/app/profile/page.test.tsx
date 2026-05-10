import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const useAuthGuardSpy = vi.fn();
const logoutSpy = vi.fn();

vi.mock("@/lib/hooks/use-auth-guard", () => ({
  useAuthGuard: (...args: unknown[]) => useAuthGuardSpy(...args),
}));

vi.mock("@/lib/hooks/use-logout", () => ({
  useLogout: () => ({ logout: logoutSpy, loading: false }),
}));

vi.mock("@/components/layout/app-shell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => {
    /* eslint-disable-next-line @next/next/no-img-element */
    return <img src={src} alt={alt} />;
  },
}));

// The profile page hosts the StyleProfileCard, which talks to Apollo.
// Stub it so the page test stays focused on the profile shell + quick
// links + contact rows.
vi.mock("@/components/profile/style-profile-card", () => ({
  StyleProfileCard: () => <div data-testid="style-profile-card-stub" />,
}));

import ProfilePage from "./page";

const CLIENT_USER = {
  id: "u-1",
  firstName: "Adwoa",
  lastName: "Mensah",
  fullName: "Adwoa Mensah",
  phone: "+233 24 123 4567",
  email: "adwoa@example.com",
  city: "Accra",
  avatarUrl: null,
  isDesigner: false,
  isOnboarded: true,
};

const DESIGNER_USER = {
  ...CLIENT_USER,
  id: "u-2",
  fullName: "Kojo Atelier",
  isDesigner: true,
};

beforeEach(() => {
  useAuthGuardSpy.mockReset();
  logoutSpy.mockReset();
});

describe("ProfilePage", () => {
  it("renders the loading skeleton until the auth guard resolves", () => {
    useAuthGuardSpy.mockReturnValue({ user: null, isReady: false });
    const { container } = render(<ProfilePage />);
    expect(
      container.querySelectorAll("[data-slot=skeleton]").length
    ).toBeGreaterThan(0);
  });

  it("renders the editorial header + hero card with the user's name", () => {
    useAuthGuardSpy.mockReturnValue({ user: CLIENT_USER, isReady: true });
    render(<ProfilePage />);
    expect(
      screen.getByRole("heading", { level: 1, name: /my profile/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Adwoa Mensah")).toBeInTheDocument();
    expect(screen.getByText(/^client$/i)).toBeInTheDocument();
  });

  it("renders the Designer pill when the user is a designer", () => {
    useAuthGuardSpy.mockReturnValue({ user: DESIGNER_USER, isReady: true });
    render(<ProfilePage />);
    expect(screen.getByText(/^designer$/i)).toBeInTheDocument();
  });

  it("hides designer-only quick links from clients", () => {
    useAuthGuardSpy.mockReturnValue({ user: CLIENT_USER, isReady: true });
    render(<ProfilePage />);
    expect(
      screen.getByRole("link", { name: /body vault/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /designer dashboard/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /wallet/i })
    ).not.toBeInTheDocument();
  });

  it("shows designer-only links to designers", () => {
    useAuthGuardSpy.mockReturnValue({ user: DESIGNER_USER, isReady: true });
    render(<ProfilePage />);
    expect(
      screen.getByRole("link", { name: /designer dashboard/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /wallet/i })).toBeInTheDocument();
  });

  it("renders the contact info rows (phone always, email + city when present)", () => {
    useAuthGuardSpy.mockReturnValue({ user: CLIENT_USER, isReady: true });
    render(<ProfilePage />);
    expect(screen.getByText(/^phone$/i)).toBeInTheDocument();
    expect(screen.getByText("+233 24 123 4567")).toBeInTheDocument();
    expect(screen.getByText("adwoa@example.com")).toBeInTheDocument();
    expect(screen.getByText("Accra")).toBeInTheDocument();
  });
});
