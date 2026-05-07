import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { GarmentEaseEditor } from "./garment-ease-editor";
import { usePreferencesStore } from "@/lib/stores/preferences";
import type { GqlOrderGarmentEase } from "@/types/graphql";

const setEaseSpy = vi.fn();
const clearEaseSpy = vi.fn();

vi.mock("@/lib/hooks/use-orders", () => ({
  useSetOrderGarmentEase: () => ({
    setOrderGarmentEase: (...args: unknown[]) => setEaseSpy(...args),
    loading: false,
  }),
  useClearOrderGarmentEase: () => ({
    clearOrderGarmentEase: (...args: unknown[]) => clearEaseSpy(...args),
    loading: false,
  }),
}));

beforeEach(() => {
  setEaseSpy.mockReset();
  clearEaseSpy.mockReset();
  setEaseSpy.mockResolvedValue({});
  clearEaseSpy.mockResolvedValue(true);
  usePreferencesStore.setState({
    measurementUnit: "inches",
    _hasHydrated: true,
  });
  // jsdom doesn't implement scrollIntoView; Radix Select calls it when
  // the popup mounts. Stub it so the form-submission test can drive
  // the field selector.
  Element.prototype.scrollIntoView = vi.fn();
  // Radix also probes hasPointerCapture / setPointerCapture etc.
  // jsdom lacks them; stub to no-op.
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
  }
  if (!HTMLElement.prototype.releasePointerCapture) {
    HTMLElement.prototype.releasePointerCapture = vi.fn();
  }
});

const sampleEase: GqlOrderGarmentEase = {
  id: "ease-1",
  orderId: "order-1",
  section: "upper_body",
  field: "bust",
  deltaMm: 25,
  note: "extra room for breathing",
  createdBy: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("GarmentEaseEditor", () => {
  it("renders an empty-state message when there are no eases", () => {
    render(<GarmentEaseEditor orderId="order-1" eases={[]} canEdit={true} />);
    expect(screen.getByText(/no eases set yet/i)).toBeInTheDocument();
  });

  it("displays an existing ease with the converted unit and note", () => {
    render(
      <GarmentEaseEditor
        orderId="order-1"
        eases={[sampleEase]}
        canEdit={true}
      />,
    );
    // 25mm ≈ 1.0 in
    expect(screen.getByText(/1\.0 in/)).toBeInTheDocument();
    expect(screen.getByText(/extra room for breathing/i)).toBeInTheDocument();
  });

  it("hides edit affordances when canEdit is false (client view)", () => {
    render(
      <GarmentEaseEditor
        orderId="order-1"
        eases={[sampleEase]}
        canEdit={false}
      />,
    );
    expect(screen.queryByRole("button", { name: /add ease/i })).toBeNull();
    expect(
      screen.queryByRole("button", { name: /remove ease/i }),
    ).toBeNull();
  });

  it("calls clearOrderGarmentEase when the trash icon is clicked", async () => {
    render(
      <GarmentEaseEditor
        orderId="order-1"
        eases={[sampleEase]}
        canEdit={true}
      />,
    );
    const removeBtn = screen.getByRole("button", {
      name: /remove ease on bust/i,
    });
    fireEvent.click(removeBtn);
    await waitFor(() => {
      expect(clearEaseSpy).toHaveBeenCalledWith("upper_body", "bust");
    });
  });

  it("reveals the new-ease form when Add ease is clicked", () => {
    render(<GarmentEaseEditor orderId="order-1" eases={[]} canEdit={true} />);

    expect(screen.queryByRole("button", { name: /save ease/i })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /add ease/i }));
    expect(
      screen.getByRole("button", { name: /save ease/i }),
    ).toBeInTheDocument();
    // Form labels reflect the user's preferred unit (inches).
    expect(screen.getByText(/delta in in/i)).toBeInTheDocument();
  });

  it("disables Save until a field is picked, regardless of typed delta", () => {
    render(<GarmentEaseEditor orderId="order-1" eases={[]} canEdit={true} />);
    fireEvent.click(screen.getByRole("button", { name: /add ease/i }));

    // No field selected yet → Save is disabled even with a delta typed.
    const deltaInput = screen.getByLabelText(/delta in in/i);
    fireEvent.change(deltaInput, { target: { value: "1" } });
    const save = screen.getByRole("button", { name: /save ease/i });
    expect(save).toBeDisabled();
  });
});
