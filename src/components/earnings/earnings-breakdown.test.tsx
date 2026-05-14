import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { EarningsBreakdown } from "./earnings-breakdown";
import type { GqlEarningsBreakdownItem } from "@/types/graphql";

function row(
  overrides: Partial<GqlEarningsBreakdownItem> = {}
): GqlEarningsBreakdownItem {
  return {
    payoutId: "po-1",
    orderId: "ord-abcdef12",
    grossPesewas: 50000,
    feePesewas: 5000,
    netPesewas: 45000,
    status: "success",
    transferredAt: "2026-05-10T10:00:00Z",
    createdAt: "2026-05-10T09:00:00Z",
    ...overrides,
  };
}

describe("EarningsBreakdown", () => {
  it("renders the empty state when no rows", () => {
    render(<EarningsBreakdown rows={[]} loading={false} />);
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: /no transactions in this period/i,
      })
    ).toBeInTheDocument();
  });

  it("renders one row per payout with the short order id", () => {
    render(
      <EarningsBreakdown
        rows={[
          row({ payoutId: "po-1", orderId: "abcdef1234567890" }),
          row({
            payoutId: "po-2",
            orderId: "zyxwvuts87654321",
            status: "wallet_pending",
          }),
        ]}
        loading={false}
      />
    );
    expect(screen.getByText(/Order · abcdef12/i)).toBeInTheDocument();
    expect(screen.getByText(/Order · zyxwvuts/i)).toBeInTheDocument();
  });

  it("labels rows according to status", () => {
    render(
      <EarningsBreakdown
        rows={[
          row({ payoutId: "po-a", status: "success" }),
          row({ payoutId: "po-b", status: "wallet_pending" }),
          row({ payoutId: "po-c", status: "failed" }),
        ]}
        loading={false}
      />
    );
    expect(screen.getByText(/reached your momo/i)).toBeInTheDocument();
    expect(screen.getByText(/awaiting payout setup/i)).toBeInTheDocument();
    expect(screen.getByText(/transfer failed/i)).toBeInTheDocument();
  });

  it("renders rows as links to the order detail page", () => {
    render(
      <EarningsBreakdown
        rows={[row({ orderId: "abcdef1234567890" })]}
        loading={false}
      />
    );
    const link = screen.getByRole("link", { name: /order abcdef12/i });
    expect(link).toHaveAttribute("href", "/orders/abcdef1234567890");
  });

  it("displays gross − fee breakdown alongside the net", () => {
    render(
      <EarningsBreakdown
        rows={[
          row({
            grossPesewas: 100_000,
            feePesewas: 10_000,
            netPesewas: 90_000,
          }),
        ]}
        loading={false}
      />
    );
    expect(screen.getByText(/GHS 900\.00/i)).toBeInTheDocument();
    // formatPesewas doesn't add thousands separators — 100000 → "GHS 1000.00".
    expect(
      screen.getByText(/gross GHS 1000\.00 − fee GHS 100\.00/i)
    ).toBeInTheDocument();
  });
});
