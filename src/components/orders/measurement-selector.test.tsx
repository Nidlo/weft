import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Stub the data hooks before importing the component so the test
// stays focused on which BRANCH renders (linked client / walk-in / self)
// and which header copy + measurement list appears.
const clientMeasurementsRef = {
  current: [] as {
    id: string;
    label: string;
    isDefault?: boolean;
    source?: string;
    dataMm?: unknown;
  }[],
};
const ownMeasurementsRef = {
  current: [] as {
    id: string;
    label: string;
    isDefault?: boolean;
    source?: string;
    dataMm?: unknown;
  }[],
};

vi.mock("@/lib/hooks/use-orders", () => ({
  useClientMeasurements: () => ({
    measurements: clientMeasurementsRef.current,
    loading: false,
  }),
}));

vi.mock("@/lib/hooks/use-measurements", () => ({
  useMeasurements: () => ({
    measurements: ownMeasurementsRef.current,
    loading: false,
  }),
}));

vi.mock("./inline-measurement-sheet", () => ({
  InlineMeasurementSheet: ({
    clientId,
    pendingClientPhone,
  }: {
    clientId: string | null;
    pendingClientPhone: string | null;
  }) => (
    <div
      data-testid="inline-sheet-stub"
      data-client-id={clientId ?? ""}
      data-pending-phone={pendingClientPhone ?? ""}
    />
  ),
}));

import { MeasurementSelector } from "./measurement-selector";

beforeEach(() => {
  clientMeasurementsRef.current = [];
  ownMeasurementsRef.current = [];
});

describe("MeasurementSelector", () => {
  it("renders the Client header + forwards clientId to the inline sheet", () => {
    // Radix Select keeps options inside a portal until opened, so we
    // assert the header copy + the trigger combobox + the forwarded
    // props on the (mocked) inline sheet - that's the full surface
    // a parent can observe without simulating the dropdown.
    clientMeasurementsRef.current = [
      { id: "cm-1", label: "Adwoa primary", isDefault: true, source: "manual" },
    ];

    render(
      <MeasurementSelector
        clientId="c-1"
        value={undefined}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText("Client measurement profile")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    const sheet = screen.getByTestId("inline-sheet-stub");
    expect(sheet).toHaveAttribute("data-client-id", "c-1");
    expect(sheet).toHaveAttribute("data-pending-phone", "");
  });

  it("renders the Your body vault header when no client and no phone", () => {
    ownMeasurementsRef.current = [
      {
        id: "om-1",
        label: "My fitting body",
        isDefault: false,
        source: "ai_photo",
      },
    ];

    render(
      <MeasurementSelector
        clientId={null}
        value={undefined}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText("Your body vault")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    // Inline sheet got neither clientId nor pending phone -> save path
    // is "create for the authenticated designer" (default createMeasurement).
    const sheet = screen.getByTestId("inline-sheet-stub");
    expect(sheet).toHaveAttribute("data-client-id", "");
    expect(sheet).toHaveAttribute("data-pending-phone", "");
  });

  it("shows the walk-in hint + forwards the phone when pendingClientPhone is supplied", () => {
    render(
      <MeasurementSelector
        clientId={null}
        pendingClientPhone="+233241234567"
        value={undefined}
        onChange={vi.fn()}
      />
    );

    expect(
      screen.getByText(/attach to the client when they sign up/i)
    ).toBeInTheDocument();
    const sheet = screen.getByTestId("inline-sheet-stub");
    expect(sheet).toHaveAttribute("data-pending-phone", "+233241234567");
  });

  it("shows the empty-vault fallback (no select) when the designer has no own measurements yet", () => {
    ownMeasurementsRef.current = [];

    render(
      <MeasurementSelector
        clientId={null}
        value={undefined}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText("Your body vault")).toBeInTheDocument();
    expect(
      screen.getByText(/No measurements in your body vault yet/i)
    ).toBeInTheDocument();
    // No <Select> rendered - the empty-vault path goes straight to the
    // dashed-empty box + the inline sheet trigger.
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });
});
