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

import OrdersPage from "./page";

const CLIENT_USER = {
  id: "u-1",
  firstName: "Adwoa",
  isDesigner: false,
  isOnboarded: true,
};

const DESIGNER_USER = {
  id: "u-2",
  firstName: "Kojo",
  isDesigner: true,
  isOnboarded: true,
};

beforeEach(() => {
  useAuthGuardSpy.mockReset();
  useOrdersSpy.mockReset();
  useOrdersSpy.mockReturnValue({
    orders: [],
    paginatorInfo: null,
    loading: false,
    error: null,
  });
});

describe("OrdersPage", () => {
  it("renders the loading skeleton while the auth guard isn't ready", () => {
    useAuthGuardSpy.mockReturnValue({ user: null, isReady: false });
    const { container } = render(<OrdersPage />);
    expect(
      container.querySelectorAll("[data-slot=skeleton]").length
    ).toBeGreaterThan(0);
  });

  it("renders the editorial header for clients without a 'New order' button", () => {
    useAuthGuardSpy.mockReturnValue({ user: CLIENT_USER, isReady: true });
    render(<OrdersPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: /my orders/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/your orders/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /new order/i })
    ).not.toBeInTheDocument();
  });

  it("shows the 'New order' luxe CTA for designers", () => {
    useAuthGuardSpy.mockReturnValue({ user: DESIGNER_USER, isReady: true });
    render(<OrdersPage />);
    expect(
      screen.getByRole("link", { name: /new order/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/studio orders/i)).toBeInTheDocument();
  });

  it("renders the empty state when there are no orders", () => {
    useAuthGuardSpy.mockReturnValue({ user: CLIENT_USER, isReady: true });
    render(<OrdersPage />);
    expect(
      screen.getByRole("heading", { level: 2, name: /no orders yet/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /browse designers/i })
    ).toBeInTheDocument();
  });

  it("renders an OrderCard for each returned order", () => {
    useAuthGuardSpy.mockReturnValue({ user: CLIENT_USER, isReady: true });
    useOrdersSpy.mockReturnValue({
      orders: [
        { id: "o-1", status: "pending", deadline: new Date().toISOString() },
        { id: "o-2", status: "confirmed", deadline: new Date().toISOString() },
      ],
      paginatorInfo: null,
      loading: false,
      error: null,
    });
    render(<OrdersPage />);
    expect(screen.getAllByTestId("order-card")).toHaveLength(2);
  });

  it("renders an error state when the orders query fails", () => {
    useAuthGuardSpy.mockReturnValue({ user: CLIENT_USER, isReady: true });
    useOrdersSpy.mockReturnValue({
      orders: [],
      paginatorInfo: null,
      loading: false,
      error: new Error("network"),
    });
    render(<OrdersPage />);
    expect(screen.getByText(/couldn.t load your orders/i)).toBeInTheDocument();
  });
});
