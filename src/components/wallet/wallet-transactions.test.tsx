import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const useWalletTransactionsSpy = vi.fn();

vi.mock("@/lib/hooks/use-wallet", () => ({
  useWalletTransactions: () => useWalletTransactionsSpy(),
}));

import { WalletTransactions } from "./wallet-transactions";

beforeEach(() => {
  useWalletTransactionsSpy.mockReset();
});

describe("WalletTransactions", () => {
  it("renders the editorial header", () => {
    useWalletTransactionsSpy.mockReturnValue({
      transactions: [],
      loading: false,
    });
    render(<WalletTransactions />);
    expect(
      screen.getByRole("heading", { level: 2, name: /transaction history/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/^activity$/i)).toBeInTheDocument();
  });

  it("renders the empty state when no transactions exist", () => {
    useWalletTransactionsSpy.mockReturnValue({
      transactions: [],
      loading: false,
    });
    render(<WalletTransactions />);
    expect(
      screen.getByRole("heading", { level: 3, name: /no transactions yet/i })
    ).toBeInTheDocument();
  });

  it("renders deposit + withdrawal rows with correctly signed amounts", () => {
    useWalletTransactionsSpy.mockReturnValue({
      transactions: [
        {
          id: "tx-1",
          type: "deposit",
          amount: 50000,
          createdAt: "2026-05-01T10:00:00Z",
          meta: { type: "designer_payout" },
        },
        {
          id: "tx-2",
          type: "withdrawal",
          amount: 30000,
          createdAt: "2026-05-02T11:00:00Z",
          meta: { type: "payout_withdrawal" },
        },
      ],
      loading: false,
    });
    render(<WalletTransactions />);
    expect(screen.getByText(/order earnings/i)).toBeInTheDocument();
    expect(screen.getByText(/momo withdrawal/i)).toBeInTheDocument();
    // Deposit shows + prefix; withdrawal shows the minus sign (U+2212)
    expect(screen.getByText(/^\+/)).toBeInTheDocument();
    expect(screen.getByText(/^−/)).toBeInTheDocument();
  });

  it("falls back to a generic label when meta.type is unknown", () => {
    useWalletTransactionsSpy.mockReturnValue({
      transactions: [
        {
          id: "tx-3",
          type: "deposit",
          amount: 1000,
          createdAt: "2026-05-01T10:00:00Z",
          meta: { type: "something_else" },
        },
      ],
      loading: false,
    });
    render(<WalletTransactions />);
    expect(screen.getByText(/^transaction$/i)).toBeInTheDocument();
  });
});
