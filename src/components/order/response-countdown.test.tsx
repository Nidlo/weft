import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ResponseCountdown } from "./response-countdown";

/**
 * The component renders a chip whose text + color refreshes every minute
 * as the response window narrows. These tests pin both the initial paint
 * and the tick-driven update — without the timer, a 23h59m chip stays
 * "23h left" forever after one minute, which is the exact bug a passing
 * helper test wouldn't catch. (FE-NIDLO-ORDER-02 / B102)
 */
describe("<ResponseCountdown />", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Pin "now" so the math is deterministic.
    vi.setSystemTime(new Date("2026-05-03T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the initial remaining-time text on first paint", () => {
    // Created 1 hour ago, default 24h window → 23h left.
    const createdAt = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString();

    render(<ResponseCountdown createdAt={createdAt} />);

    expect(screen.getByText("Designer has 23h left")).toBeInTheDocument();
  });

  it("uses the muted tone when more than 1h remains", () => {
    const createdAt = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(); // 19h left
    const { container } = render(<ResponseCountdown createdAt={createdAt} />);

    const span = container.querySelector("span[role='status']");
    expect(span?.className).toContain("text-muted-foreground");
  });

  it("escalates to warning tone in the last hour", () => {
    const createdAt = new Date(
      Date.now() - 23 * 60 * 60 * 1000 - 30 * 60 * 1000
    ).toISOString(); // 30m left
    const { container } = render(<ResponseCountdown createdAt={createdAt} />);

    const span = container.querySelector("span[role='status']");
    expect(span?.className).toContain("text-status-warning-fg");
    expect(screen.getByText(/^Designer has \d+m left$/)).toBeInTheDocument();
  });

  it("renders the expired sentinel + error tone past cutoff", () => {
    const createdAt = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(); // expired 1h ago
    const { container } = render(<ResponseCountdown createdAt={createdAt} />);

    expect(screen.getByText("Response window expired")).toBeInTheDocument();
    const span = container.querySelector("span[role='status']");
    expect(span?.className).toContain("text-status-error-fg");
  });

  it("re-renders every minute as the window narrows", () => {
    // 58m 59s remaining → ceil(58.98m) = "59m left". After 1 minute the
    // component's setInterval fires, the chip recomputes against the new
    // wall-clock, and the label drops to "58m left".
    const createdAt = new Date(
      Date.now() - 23 * 60 * 60 * 1000 - 1 * 60 * 1000 - 1 * 1000
    ).toISOString();
    const { container } = render(<ResponseCountdown createdAt={createdAt} />);

    expect(container.textContent).toContain("Designer has 59m left");

    // `advanceTimersByTime` advances both the fake timer clock AND
    // Date.now() — the component's setInterval fires at +60s and
    // `new Date()` inside the callback reads the same advanced clock.
    act(() => {
      vi.advanceTimersByTime(60 * 1000);
    });

    expect(container.textContent).toContain("Designer has 58m left");
  });

  it("declares aria-live polite + role=status for screen readers", () => {
    const createdAt = new Date().toISOString();
    const { container } = render(<ResponseCountdown createdAt={createdAt} />);

    const span = container.querySelector("span[role='status']");
    expect(span).not.toBeNull();
    expect(span?.getAttribute("aria-live")).toBe("polite");
  });

  it("clears the interval on unmount (no leak on route change)", () => {
    const clearSpy = vi.spyOn(globalThis, "clearInterval");
    const createdAt = new Date().toISOString();
    const { unmount } = render(<ResponseCountdown createdAt={createdAt} />);

    unmount();
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });

  it("respects a custom windowHours override", () => {
    // 2h window, created 30m ago → 1.5h remaining → "2h left" (Math.ceil).
    const createdAt = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    render(<ResponseCountdown createdAt={createdAt} windowHours={2} />);

    expect(screen.getByText("Designer has 2h left")).toBeInTheDocument();
  });
});
