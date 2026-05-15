import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing/react";

import { CREATE_MEASUREMENT } from "@/lib/graphql/mutations/measurement";

// ManualForm + AiFlow drag in Apollo, the auth store, the preferences
// store, motion, and the camera SDK — none of which are interesting here.
// Stub them so the test focuses on the sheet's wiring: trigger gating,
// tab rendering, and the mutation payload.
vi.mock("@/app/(private)/measurements/manual-form", () => ({
  ManualForm: ({
    onSave,
  }: {
    onSave: (
      label: string,
      unit: string,
      data: Record<string, Record<string, number>>
    ) => void;
  }) => (
    <button
      type="button"
      data-testid="manual-save"
      onClick={() =>
        onSave("Walk-in Adwoa", "cm", {
          upper_body: { bust: 92 },
        })
      }
    >
      Save manual
    </button>
  ),
}));

vi.mock("@/app/(private)/measurements/ai-flow", () => ({
  AiFlow: () => <div data-testid="ai-flow-stub" />,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { InlineMeasurementSheet } from "./inline-measurement-sheet";

describe("InlineMeasurementSheet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("disables the trigger when no client and no walk-in phone are supplied", () => {
    render(
      <MockedProvider mocks={[]}>
        <InlineMeasurementSheet onSaved={vi.fn()} />
      </MockedProvider>
    );

    expect(
      screen.getByRole("button", { name: /take new measurement/i })
    ).toBeDisabled();
  });

  it("enables the trigger when a clientId is supplied", () => {
    render(
      <MockedProvider mocks={[]}>
        <InlineMeasurementSheet clientId="c-1" onSaved={vi.fn()} />
      </MockedProvider>
    );

    expect(
      screen.getByRole("button", { name: /take new measurement/i })
    ).toBeEnabled();
  });

  it("enables the trigger when a pendingClientPhone is supplied", () => {
    render(
      <MockedProvider mocks={[]}>
        <InlineMeasurementSheet
          pendingClientPhone="+233241234567"
          onSaved={vi.fn()}
        />
      </MockedProvider>
    );

    expect(
      screen.getByRole("button", { name: /take new measurement/i })
    ).toBeEnabled();
  });

  it("fires createMeasurement with pendingClientPhone in the walk-in path", async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    const phone = "+233241234567";

    const createCall = vi.fn();
    const mocks = [
      {
        request: {
          query: CREATE_MEASUREMENT,
          variables: {
            input: {
              label: "Walk-in Adwoa",
              unit: "cm",
              data: { upper_body: { bust: 92 } },
              source: "manual",
              landmarks: null,
              photoUrl: null,
              photoPublicId: null,
              photoDisk: null,
              pendingClientPhone: phone,
            },
          },
        },
        result: () => {
          createCall();
          return {
            data: {
              createMeasurement: {
                id: "m-1",
                label: "Walk-in Adwoa",
                dataMm: null,
                aiBaselineMm: null,
                manualOverridesMm: null,
                landmarksNormalized: null,
                photoUrl: null,
                photoDisk: null,
                confirmedAt: null,
                source: "manual",
                isDefault: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            },
          };
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <InlineMeasurementSheet pendingClientPhone={phone} onSaved={onSaved} />
      </MockedProvider>
    );

    await user.click(
      screen.getByRole("button", { name: /take new measurement/i })
    );
    // Sheet opens — manual tab is the default, click the stubbed save
    await user.click(screen.getByTestId("manual-save"));

    // Wait for the mutation + onSaved callback
    await vi.waitFor(() => expect(createCall).toHaveBeenCalledTimes(1));
    await vi.waitFor(() => expect(onSaved).toHaveBeenCalledWith("m-1"));
  });
});
