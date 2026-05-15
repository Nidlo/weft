import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { DepositUnpaidDialog } from "./deposit-unpaid-dialog";

describe("DepositUnpaidDialog", () => {
  it("renders the confirm copy when open", () => {
    render(
      <DepositUnpaidDialog
        open
        targetLabel="fabric ready"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText(/deposit not yet recorded/i)).toBeInTheDocument();
    expect(screen.getByText(/fabric ready/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue anyway/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("fires onConfirm when the override button is clicked", () => {
    const onConfirm = vi.fn();
    render(
      <DepositUnpaidDialog open onConfirm={onConfirm} onCancel={vi.fn()} />
    );

    fireEvent.click(screen.getByRole("button", { name: /continue anyway/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("fires onCancel when the cancel button is clicked", () => {
    const onCancel = vi.fn();
    render(
      <DepositUnpaidDialog open onConfirm={vi.fn()} onCancel={onCancel} />
    );

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("disables both buttons while loading", () => {
    render(
      <DepositUnpaidDialog
        open
        loading
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: /continuing/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
  });
});
