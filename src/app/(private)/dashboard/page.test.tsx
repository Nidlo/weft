import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const useAuthGuardSpy = vi.fn();
const useOrdersSpy = vi.fn();

vi.mock("@/lib/hooks/use-auth-guard", () => ({
  useAuthGuard: (...args: unknown[]) => useAuthGuardSpy(...args),
}));

vi.mock("@/lib/hooks/use-orders", () => ({
  useOrders: (...args: unknown[]) => useOrdersSpy(...args),
}));

vi.mock("@/components/layout/app-shell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}));

vi.mock("@/components/order/order-card", () => ({
  OrderCard: ({ order }: { order: { id: string } }) => (
    <div data-testid="order-card">{order.id}</div>
  ),
}));

vi.mock("@/components/shared/share-buttons", () => ({
  ShareButtons: () => <div data-testid="share-buttons" />,
}));

import DashboardPage from "./page";

const CLIENT_USER = {
  id: "u-1",
  firstName: "Adwoa",
  lastName: "Mensah",
  fullName: "Adwoa Mensah",
  isDesigner: false,
  isOnboarded: true,
  designerProfile: null,
};

const DESIGNER_USER = {
  id: "u-2",
  firstName: "Kojo",
  lastName: "Atelier",
  fullName: "Kojo Atelier",
  isDesigner: true,
  isOnboarded: true,
  designerProfile: {
    slug: "kojo-atelier",
    profileViewsThisWeek: 12,
    profileViewsCount: 240,
  },
};

beforeEach(() => {
  useAuthGuardSpy.mockReset();
  useOrdersSpy.mockReset();
  useOrdersSpy.mockReturnValue({ orders: [] });
});

describe("DashboardPage", () => {
  it("shows the loading skeleton when the auth guard isn't ready", () => {
    useAuthGuardSpy.mockReturnValue({ user: null, isReady: false });
    const { container } = render(<DashboardPage />);
    expect(
      container.querySelectorAll("[data-slot=skeleton]").length
    ).toBeGreaterThan(0);
  });

  it("renders the client dashboard for non-designer users", () => {
    useAuthGuardSpy.mockReturnValue({ user: CLIENT_USER, isReady: true });
    render(<DashboardPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: /welcome, adwoa/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /find a designer/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/three steps from idea to wardrobe/i)
    ).toBeInTheDocument();
  });

  it("renders the designer dashboard for designer users", () => {
    useAuthGuardSpy.mockReturnValue({ user: DESIGNER_USER, isReady: true });
    render(<DashboardPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: /welcome, kojo/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/active orders/i)).toBeInTheDocument();
    expect(screen.getByText(/profile views/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /share your profile/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/240/)).toBeInTheDocument();
  });

  it("links the designer's profile via the shared profile URL", () => {
    useAuthGuardSpy.mockReturnValue({ user: DESIGNER_USER, isReady: true });
    render(<DashboardPage />);
    // The host is whatever jsdom produces - assert the slug is rendered.
    expect(screen.getByText(/\/designer\/kojo-atelier/)).toBeInTheDocument();
  });
});
