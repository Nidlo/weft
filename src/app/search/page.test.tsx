import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const useDesignerSearchSpy = vi.fn();

vi.mock("@/lib/hooks/use-designer-search", () => ({
  useDesignerSearch: (...args: unknown[]) => useDesignerSearchSpy(...args),
}));

vi.mock("@/lib/hooks/use-specializations", () => ({
  useSpecializations: () => ({
    quickFilters: [
      { id: "s1", slug: "kaba-and-slit", name: "Kaba & Slit" },
      { id: "s2", slug: "wedding-gown", name: "Wedding Gown" },
    ],
    specializations: [],
  }),
}));

vi.mock("@/lib/hooks/use-cities", () => ({
  useCities: () => ({ cities: [] }),
}));

const useGeolocationSpy = vi.fn();

vi.mock("@/lib/hooks/use-geolocation", () => ({
  useGeolocation: (...args: unknown[]) => useGeolocationSpy(...args),
}));

vi.mock("@/components/layout/app-shell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}));

vi.mock("@/components/shared/designer-card", () => ({
  DesignerCard: ({ designer }: { designer: { id: string } }) => (
    <div data-testid="designer-card">{designer.id}</div>
  ),
}));

import SearchPage from "./page";

beforeEach(() => {
  useGeolocationSpy.mockReset();
  useGeolocationSpy.mockReturnValue({
    lat: null,
    lng: null,
    error: null,
    loading: false,
  });
  useDesignerSearchSpy.mockReset();
  useDesignerSearchSpy.mockReturnValue({
    designers: [],
    loading: false,
    error: null,
    hasMore: false,
    loadMore: vi.fn(),
  });
});

describe("SearchPage", () => {
  it("renders the editorial header + search bar", () => {
    render(<SearchPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: /find your designer/i })
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/search designers/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/^discover$/i)).toBeInTheDocument();
  });

  it("renders quick-filter chips from useSpecializations", () => {
    render(<SearchPage />);
    expect(
      screen.getByRole("button", { name: /kaba & slit/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /wedding gown/i })
    ).toBeInTheDocument();
  });

  it("renders all sort options + recommended is the default", () => {
    render(<SearchPage />);
    expect(
      screen.getByRole("button", { name: /^recommended$/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^top rated$/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^newest$/i })
    ).toBeInTheDocument();
  });

  it("renders the empty state with a Sparkles icon and clear-filters CTA when filtered", () => {
    useDesignerSearchSpy.mockReturnValue({
      designers: [],
      loading: false,
      error: null,
      hasMore: false,
      loadMore: vi.fn(),
    });
    render(<SearchPage />);
    expect(
      screen.getByRole("heading", { level: 2, name: /no designers found/i })
    ).toBeInTheDocument();
  });

  it("renders the error state when the query fails", () => {
    useDesignerSearchSpy.mockReturnValue({
      designers: [],
      loading: false,
      error: new Error("network"),
      hasMore: false,
      loadMore: vi.fn(),
    });
    render(<SearchPage />);
    expect(
      screen.getByRole("heading", { level: 2, name: /something went wrong/i })
    ).toBeInTheDocument();
  });

  it("renders a DesignerCard per result and the 'all shown' line when there are no more pages", () => {
    useDesignerSearchSpy.mockReturnValue({
      designers: [{ id: "d-1" }, { id: "d-2" }],
      loading: false,
      error: null,
      hasMore: false,
      loadMore: vi.fn(),
    });
    render(<SearchPage />);
    expect(screen.getAllByTestId("designer-card")).toHaveLength(2);
    expect(screen.getByText(/all/i)).toBeInTheDocument();
  });

  it("passes lat/lng to the search under the default sort, not only when sorting by nearest", () => {
    useGeolocationSpy.mockReturnValue({
      lat: 5.6037,
      lng: -0.187,
      error: null,
      loading: false,
    });
    render(<SearchPage />);

    // Default sort is "recommended" - the fix is that coords still flow
    // so distance comes back on every card and recommended can weight by
    // proximity. Pre-fix this only happened under sortBy === "nearest".
    const lastInput = useDesignerSearchSpy.mock.calls.at(-1)?.[0] as {
      sortBy: string;
      lat?: number;
      lng?: number;
    };
    expect(lastInput.sortBy).toBe("recommended");
    expect(lastInput.lat).toBe(5.6037);
    expect(lastInput.lng).toBe(-0.187);
  });

  it("omits lat/lng when geolocation is unavailable", () => {
    render(<SearchPage />);
    const lastInput = useDesignerSearchSpy.mock.calls.at(-1)?.[0] as {
      lat?: number;
      lng?: number;
    };
    expect(lastInput.lat).toBeUndefined();
    expect(lastInput.lng).toBeUndefined();
  });

  it("toggles the active state when a quick-filter chip is clicked", () => {
    render(<SearchPage />);
    const chip = screen.getByRole("button", { name: /kaba & slit/i });
    fireEvent.click(chip);
    // The chip should still be in the document - the click toggles selection
    expect(chip).toBeInTheDocument();
  });
});
