import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { MaintenanceBanner } from "./maintenance-banner";

const renderWithQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MaintenanceBanner />
    </QueryClientProvider>
  );
};

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

    const { container } = renderWithQueryClient();

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

    renderWithQueryClient();

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

    renderWithQueryClient();

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

    const { container } = renderWithQueryClient();

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledTimes(1));
    expect(
      container.querySelector('[data-testid="maintenance-banner"]')
    ).toBeNull();
  });
});
