import { describe, it, expect, vi } from "vitest";
import { render, screen, renderHook } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PeriodFilter, usePeriodRange } from "./period-filter";

describe("PeriodFilter", () => {
  it("renders all four period options", () => {
    render(<PeriodFilter value="month" onChange={() => {}} />);
    expect(screen.getByRole("tab", { name: /today/i })).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /this month/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /this year/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /all time/i })).toBeInTheDocument();
  });

  it("calls onChange with the new value when the user switches tabs", async () => {
    const onChange = vi.fn();
    render(<PeriodFilter value="month" onChange={onChange} />);

    await userEvent.click(screen.getByRole("tab", { name: /this year/i }));
    expect(onChange).toHaveBeenCalledWith("year");
  });
});

describe("usePeriodRange", () => {
  it("returns undefined bounds for 'all'", () => {
    const { result } = renderHook(() => usePeriodRange("all"));
    expect(result.current.from).toBeUndefined();
    expect(result.current.to).toBeUndefined();
    expect(result.current.label).toBe("All time");
  });

  it("'today' starts at midnight today and ends now", () => {
    const { result } = renderHook(() => usePeriodRange("today"));
    expect(result.current.from).toBeInstanceOf(Date);
    const from = result.current.from!;
    expect(from.getHours()).toBe(0);
    expect(from.getMinutes()).toBe(0);
    expect(from.getSeconds()).toBe(0);
    // From should be no later than To.
    expect(from.getTime()).toBeLessThanOrEqual(result.current.to!.getTime());
    expect(result.current.label).toBe("Today");
  });

  it("'month' starts on the 1st of the current month", () => {
    const { result } = renderHook(() => usePeriodRange("month"));
    expect(result.current.from!.getDate()).toBe(1);
    expect(result.current.label).toMatch(/\b\d{4}\b/); // includes the year
  });

  it("'year' starts on Jan 1 of the current year", () => {
    const { result } = renderHook(() => usePeriodRange("year"));
    const from = result.current.from!;
    expect(from.getMonth()).toBe(0);
    expect(from.getDate()).toBe(1);
    expect(result.current.label).toBe(String(new Date().getFullYear()));
  });
});
