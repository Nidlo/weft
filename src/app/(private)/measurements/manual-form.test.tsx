import { describe, it, expect, beforeEach, vi } from "vitest";
import { StrictMode } from "react";
import { render, fireEvent, act } from "@testing-library/react";

import { usePreferencesStore } from "@/lib/stores/preferences";
import { ManualForm } from "./manual-form";

function bustInput(container: HTMLElement): HTMLInputElement {
  return container.querySelector("#upper_body-bust") as HTMLInputElement;
}

function toggleUnit(container: HTMLElement) {
  const sw = container.querySelector("#unit-toggle") as HTMLElement;
  act(() => {
    fireEvent.click(sw);
  });
}

beforeEach(() => {
  usePreferencesStore.setState({ measurementUnit: "inches" });
});

describe("ManualForm unit toggle (regression: 2.54x double-conversion)", () => {
  // StrictMode double-invokes state updaters in dev. The original bug
  // nested setData() inside the setUnit() updater, so a double-invoke
  // enqueued the conversion twice: 39.8 in -> 101.1 cm -> 256.8 cm.
  // These run under StrictMode so a reintroduction fails loudly.
  it("converts a bust value exactly once when toggling inches -> cm", () => {
    const { container } = render(
      <StrictMode>
        <ManualForm
          initialLabel="My body"
          initialUnit="inches"
          initialData={{
            upper_body: { bust: 39.8 },
            lower_body: {},
            vertical: {},
            garments: {},
          }}
          onSave={vi.fn().mockResolvedValue(undefined)}
        />
      </StrictMode>
    );

    expect(parseFloat(bustInput(container).value)).toBeCloseTo(39.8, 1);

    toggleUnit(container);

    const cm = parseFloat(bustInput(container).value);
    // 39.8 in * 2.54 = 101.092 -> rounded to 101.1
    expect(cm).toBeCloseTo(101.1, 1);
    // The bug produced 256.8 (x2.54 twice). Guard the magnitude band.
    expect(cm).toBeLessThan(150);
  });

  it("round-trips inches -> cm -> inches without compounding", () => {
    const { container } = render(
      <StrictMode>
        <ManualForm
          initialLabel="My body"
          initialUnit="inches"
          initialData={{
            upper_body: { bust: 39.8 },
            lower_body: {},
            vertical: {},
            garments: {},
          }}
          onSave={vi.fn().mockResolvedValue(undefined)}
        />
      </StrictMode>
    );

    toggleUnit(container); // inches -> cm
    expect(parseFloat(bustInput(container).value)).toBeCloseTo(101.1, 1);

    toggleUnit(container); // cm -> inches
    expect(parseFloat(bustInput(container).value)).toBeCloseTo(39.8, 1);
  });

  it("passes the toggled unit + converted data to onSave", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { container, getByRole } = render(
      <ManualForm
        initialLabel="My body"
        initialUnit="inches"
        initialData={{
          upper_body: { bust: 39.8 },
          lower_body: {},
          vertical: {},
          garments: {},
        }}
        onSave={onSave}
      />
    );

    toggleUnit(container); // -> cm

    const saveBtn = getByRole("button", { name: /save/i });
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    const [, unit, data] = onSave.mock.calls[0];
    expect(unit).toBe("cm");
    expect(data.upper_body.bust).toBeCloseTo(101.1, 1);
  });
});
