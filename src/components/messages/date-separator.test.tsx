import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";

import { DateSeparator } from "./date-separator";

afterEach(() => {
  vi.useRealTimers();
});

describe("DateSeparator", () => {
  it("renders 'Today' for the current date", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-07T12:00:00Z"));
    render(<DateSeparator date="2026-05-07T15:30:00Z" />);
    expect(screen.getByText("Today")).toBeInTheDocument();
  });

  it("renders 'Yesterday' for the previous day", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-07T12:00:00Z"));
    render(<DateSeparator date="2026-05-06T10:00:00Z" />);
    expect(screen.getByText("Yesterday")).toBeInTheDocument();
  });

  it("renders an absolute date for older dates", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-07T12:00:00Z"));
    render(<DateSeparator date="2026-04-12T10:00:00Z" />);
    // Format may vary by locale: "12 Apr"
    expect(screen.getByText(/Apr/i)).toBeInTheDocument();
  });
});
