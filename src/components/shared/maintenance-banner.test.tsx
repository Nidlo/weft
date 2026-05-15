import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";

import { MaintenanceBanner } from "./maintenance-banner";

describe("MaintenanceBanner", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders nothing while the maintenance flag is off", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ active: false, message: null, since: null }),
    });

    const { container } = render(<MaintenanceBanner />);

    // Wait for the initial fetch settle, then assert no banner rendered.
    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledTimes(1));
    expect(
      container.querySelector('[data-testid="maintenance-banner"]')
    ).toBeNull();
  });

  it("renders the banner with the operator message when active=true", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        active: true,
        message: "Brief deploy in progress.",
        since: "2026-05-07T10:30:00Z",
      }),
    });

    render(<MaintenanceBanner />);

    await waitFor(() =>
      expect(screen.getByTestId("maintenance-banner")).toBeInTheDocument()
    );
    expect(screen.getByText(/Maintenance:/)).toBeInTheDocument();
    expect(screen.getByText(/Brief deploy in progress\./)).toBeInTheDocument();
  });

  it("falls back to a default message when the server returns no copy", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ active: true, message: null, since: null }),
    });

    render(<MaintenanceBanner />);

    await waitFor(() =>
      expect(screen.getByTestId("maintenance-banner")).toBeInTheDocument()
    );
    expect(screen.getByText(/Nidlo is briefly offline\./)).toBeInTheDocument();
  });

  it("treats a failed fetch as off-state instead of stranding users on a permanent banner", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => {
        throw new Error("should not be called");
      },
    });

    const { container } = render(<MaintenanceBanner />);

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledTimes(1));
    expect(
      container.querySelector('[data-testid="maintenance-banner"]')
    ).toBeNull();
  });
});
