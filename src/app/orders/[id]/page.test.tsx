import { Suspense } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

const useAuthGuardSpy = vi.fn();
const useOrderSpy = vi.fn();

vi.mock("@/lib/hooks/use-auth-guard", () => ({
  useAuthGuard: (...args: unknown[]) => useAuthGuardSpy(...args),
}));

vi.mock("@/lib/hooks/use-orders", () => ({
  useOrder: (...args: unknown[]) => useOrderSpy(...args),
  useConfirmOrder: () => ({ confirmOrder: vi.fn(), loading: false }),
  useCancelOrder: () => ({ cancelOrder: vi.fn(), loading: false }),
  useConfirmDelivery: () => ({ confirmDelivery: vi.fn(), loading: false }),
  useUpdateOrderStatus: () => ({
    updateOrderStatus: vi.fn(),
    loading: false,
  }),
}));

vi.mock("@/lib/hooks/use-messages", () => ({
  useStartConversation: () => ({
    startConversation: vi.fn(),
    loading: false,
  }),
}));

vi.mock("@/providers/realtime-provider", () => ({
  useRealtime: () => ({ echo: null }),
}));

vi.mock("@/lib/hooks/use-echo-reconnect", () => ({
  useEchoReconnect: () => undefined,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), replace: vi.fn() }),
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

vi.mock("@/components/order/order-progress-bar", () => ({
  OrderProgressBar: () => <div data-testid="progress-bar" />,
}));

vi.mock("@/components/order/order-timeline", () => ({
  OrderTimeline: () => <div data-testid="order-timeline" />,
}));

vi.mock("@/components/order/response-countdown", () => ({
  ResponseCountdown: () => <div data-testid="response-countdown" />,
}));

vi.mock("@/components/order/designer-response-sheet", () => ({
  DesignerResponseSheet: () => <div data-testid="designer-response-sheet" />,
}));

vi.mock("@/components/order/cost-book-panel", () => ({
  CostBookPanel: () => <div data-testid="cost-book" />,
}));

vi.mock("@/components/orders/order-edit-sheet", () => ({
  OrderEditSheet: () => <div data-testid="order-edit-sheet" />,
}));

vi.mock("@/components/payment/payment-section", () => ({
  PaymentSection: () => <div data-testid="payment-section" />,
}));

vi.mock("@/components/payment/payout-section", () => ({
  PayoutSection: () => <div data-testid="payout-section" />,
}));

vi.mock("@/components/payment/external-payment-section", () => ({
  ExternalPaymentSection: () => <div data-testid="external-payment-section" />,
}));

vi.mock("@/components/reviews/review-prompt-dialog", () => ({
  ReviewPromptDialog: () => null,
}));

vi.mock("@/components/reviews/star-rating", () => ({
  StarRating: () => <div data-testid="star-rating" />,
}));

import OrderDetailPage from "./page";

const CLIENT_USER = { id: "u-client", isOnboarded: true };

const ORDER_FIXTURE = {
  id: "order-abcdef12",
  status: "confirmed",
  clientId: "u-client",
  designerId: "u-designer",
  designer: { id: "u-designer", fullName: "Adwoa Studio" },
  client: { id: "u-client", fullName: "Kofi Mensah" },
  budgetMin: 50000,
  budgetMax: 200000,
  confirmedPrice: 150000,
  counterPrice: null,
  isRush: false,
  isInternal: false,
  hasLinkedClient: true,
  deadline: new Date(Date.now() + 14 * 86400_000).toISOString(),
  createdAt: new Date().toISOString(),
  blueprint: {
    garment_type: "kaba_and_slit",
    occasion: "wedding",
    fabric_type: "ankara",
  },
  payments: [],
  payouts: [],
  externalPayments: [],
  paymentSummary: null,
  measurement: null,
  conversation: null,
  notes: null,
  updates: [],
  materials: [],
  review: null,
  deliveredAt: null,
  counterMessage: null,
  clientName: null,
  clientPhone: null,
  clientDisplayName: null,
  deadlineStart: null,
};

// React 19's `use()` only reads thenables synchronously when they are tagged
// as already-fulfilled. A bare `Promise.resolve()` doesn't expose those
// internal status/value fields, so the test would suspend forever.
function makePromise<T>(value: T): Promise<T> {
  const p = Promise.resolve(value) as Promise<T> & {
    status: string;
    value: T;
  };
  p.status = "fulfilled";
  p.value = value;
  return p;
}

function renderWithSuspense(ui: React.ReactElement) {
  return render(<Suspense fallback={<div data-testid="suspense" />}>{ui}</Suspense>);
}

beforeEach(() => {
  useAuthGuardSpy.mockReset();
  useOrderSpy.mockReset();
});

describe("OrderDetailPage", () => {
  it("shows the loading skeleton while the auth guard isn't ready", async () => {
    useAuthGuardSpy.mockReturnValue({ user: null, isReady: false });
    useOrderSpy.mockReturnValue({
      order: null,
      loading: true,
      refetch: vi.fn(),
    });
    const { container } = renderWithSuspense(
      <OrderDetailPage params={makePromise({ id: "order-abcdef12" })} />
    );
    await waitFor(() => {
      expect(
        container.querySelectorAll("[data-slot=skeleton]").length
      ).toBeGreaterThan(0);
    });
  });

  it("shows a friendly not-found state when the order is missing", async () => {
    useAuthGuardSpy.mockReturnValue({ user: CLIENT_USER, isReady: true });
    useOrderSpy.mockReturnValue({
      order: null,
      loading: false,
      refetch: vi.fn(),
    });
    renderWithSuspense(
      <OrderDetailPage params={makePromise({ id: "missing" })} />
    );
    expect(
      await screen.findByRole("heading", { level: 2, name: /order not found/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /back to orders/i })
    ).toBeInTheDocument();
  });

  it("renders the editorial header with garment type + status pill", async () => {
    useAuthGuardSpy.mockReturnValue({ user: CLIENT_USER, isReady: true });
    useOrderSpy.mockReturnValue({
      order: ORDER_FIXTURE,
      loading: false,
      refetch: vi.fn(),
    });
    renderWithSuspense(
      <OrderDetailPage params={makePromise({ id: "order-abcdef12" })} />
    );
    expect(
      await screen.findByRole("heading", { level: 1, name: /kaba and slit/i })
    ).toBeInTheDocument();
    expect(screen.getAllByText(/confirmed/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Adwoa Studio/i)).toBeInTheDocument();
  });

  it("renders the budget + confirmed price cells", async () => {
    useAuthGuardSpy.mockReturnValue({ user: CLIENT_USER, isReady: true });
    useOrderSpy.mockReturnValue({
      order: ORDER_FIXTURE,
      loading: false,
      refetch: vi.fn(),
    });
    renderWithSuspense(
      <OrderDetailPage params={makePromise({ id: "order-abcdef12" })} />
    );
    // Wait for the page to mount + assert budget label appears at least once
    await screen.findByRole("heading", { level: 1, name: /kaba and slit/i });
    expect(screen.getAllByText(/budget/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/confirmed/i).length).toBeGreaterThan(0);
  });
});
