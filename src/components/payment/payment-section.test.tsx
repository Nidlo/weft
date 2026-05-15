import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const toastInfoSpy = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    info: (...args: unknown[]) => toastInfoSpy(...args),
  },
}));

import { PaymentSection } from "./payment-section";
import type { GqlPayment, GqlPaymentSummary } from "@/types/graphql";

const emptyPayments: GqlPayment[] = [];

function summary(
  overrides: Partial<GqlPaymentSummary> = {}
): GqlPaymentSummary {
  return {
    depositAmount: 50_000,
    balanceAmount: 50_000,
    depositOwed: 50_000,
    balanceOwed: 50_000,
    depositStatus: null,
    balanceStatus: null,
    totalPaid: 0,
    totalPaidGateway: 0,
    totalPaidExternal: 0,
    amountRemaining: 100_000,
    isFullyPaid: false,
    ...overrides,
  } as GqlPaymentSummary;
}

beforeEach(() => {
  toastInfoSpy.mockReset();
});

describe("PaymentSection - coming-soon Pay buttons", () => {
  it("shows the Pay Deposit button with a Soon badge when deposit is owed", () => {
    render(
      <PaymentSection
        orderId="ord-1"
        confirmedPrice={100_000}
        payments={emptyPayments}
        summary={summary()}
        isClient={true}
        orderStatus="confirmed"
      />
    );

    const btn = screen.getByRole("button", { name: /pay deposit/i });
    expect(btn).toBeInTheDocument();
    // The Soon badge lives inside the button label.
    expect(btn).toHaveTextContent(/soon/i);
  });

  it("shows the Pay Balance button (with Soon) only after deposit is settled", () => {
    render(
      <PaymentSection
        orderId="ord-1"
        confirmedPrice={100_000}
        payments={emptyPayments}
        summary={summary({
          depositOwed: 0,
          balanceOwed: 50_000,
          depositStatus: "success",
        })}
        isClient={true}
        orderStatus="confirmed"
      />
    );

    expect(
      screen.getByRole("button", { name: /pay balance/i })
    ).toHaveTextContent(/soon/i);
    expect(
      screen.queryByRole("button", { name: /pay deposit/i })
    ).not.toBeInTheDocument();
  });

  it("clicking Pay Deposit toasts the coming-soon copy and does not navigate", async () => {
    render(
      <PaymentSection
        orderId="ord-1"
        confirmedPrice={100_000}
        payments={emptyPayments}
        summary={summary()}
        isClient={true}
        orderStatus="confirmed"
      />
    );

    const btn = screen.getByRole("button", { name: /pay deposit/i });
    await userEvent.click(btn);

    expect(toastInfoSpy).toHaveBeenCalledTimes(1);
    const [message] = toastInfoSpy.mock.calls[0];
    expect(message).toMatch(/in-app payments are coming soon/i);
    expect(message).toMatch(/record your payment below/i);

    // The button must NOT be a link - clicking it should never produce a
    // navigation. If a future refactor reintroduces a Link href, this fails.
    expect(btn.tagName.toLowerCase()).toBe("button");
    expect(btn.getAttribute("href")).toBeNull();
  });

  it("clicking Pay Balance also toasts the same coming-soon copy", async () => {
    render(
      <PaymentSection
        orderId="ord-1"
        confirmedPrice={100_000}
        payments={emptyPayments}
        summary={summary({
          depositOwed: 0,
          balanceOwed: 50_000,
          depositStatus: "success",
        })}
        isClient={true}
        orderStatus="confirmed"
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /pay balance/i }));
    expect(toastInfoSpy).toHaveBeenCalledTimes(1);
  });

  it("hides Pay buttons for the designer (only the client should pay)", () => {
    render(
      <PaymentSection
        orderId="ord-1"
        confirmedPrice={100_000}
        payments={emptyPayments}
        summary={summary()}
        isClient={false}
        orderStatus="confirmed"
      />
    );

    expect(
      screen.queryByRole("button", { name: /pay deposit/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /pay balance/i })
    ).not.toBeInTheDocument();
  });
});
