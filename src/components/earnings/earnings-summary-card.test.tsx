import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { EarningsSummaryCard } from "./earnings-summary-card";
import type { GqlEarningsSummary } from "@/types/graphql";

const baseSummary: GqlEarningsSummary = {
  ordersCount: 0,
  grossPesewas: 0,
  feePesewas: 0,
  netPesewas: 0,
  paidOutPesewas: 0,
  awaitingPayoutSetupPesewas: 0,
  breakdown: [],
};

describe("EarningsSummaryCard", () => {
  it("shows the period label in the header", () => {
    render(
      <EarningsSummaryCard
        summary={baseSummary}
        periodLabel="May 2026"
        loading={false}
      />
    );
    expect(screen.getByText(/Net earned · May 2026/i)).toBeInTheDocument();
  });

  it("renders the empty copy when ordersCount is 0", () => {
    render(
      <EarningsSummaryCard
        summary={baseSummary}
        periodLabel="Today"
        loading={false}
      />
    );
    expect(
      screen.getByText(/no orders settled in this period yet/i)
    ).toBeInTheDocument();
  });

  it("renders order count + net earned + the three supporting stats when summary is populated", () => {
    render(
      <EarningsSummaryCard
        summary={{
          ...baseSummary,
          ordersCount: 3,
          grossPesewas: 100_000,
          feePesewas: 10_000,
          netPesewas: 90_000,
          paidOutPesewas: 60_000,
          awaitingPayoutSetupPesewas: 30_000,
        }}
        periodLabel="May 2026"
        loading={false}
      />
    );
    // The big "net" headline shows GHS 900.00.
    expect(screen.getByText(/GHS 900\.00/i)).toBeInTheDocument();
    // Subtitle calls out the order count and "after the platform fee".
    expect(
      screen.getByText(/from 3 orders after the platform fee/i)
    ).toBeInTheDocument();
    // Each of the three supporting stats is labelled.
    expect(screen.getByText(/gross paid by clients/i)).toBeInTheDocument();
    expect(screen.getByText(/reached your momo/i)).toBeInTheDocument();
    expect(screen.getByText(/awaiting payout setup/i)).toBeInTheDocument();
  });

  it("singularises 'order' when ordersCount is 1", () => {
    render(
      <EarningsSummaryCard
        summary={{ ...baseSummary, ordersCount: 1, netPesewas: 5000 }}
        periodLabel="Today"
        loading={false}
      />
    );
    expect(
      screen.getByText(/from 1 order after the platform fee/i)
    ).toBeInTheDocument();
  });
});
