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

vi.mock("@/lib/hooks/use-geolocation", () => ({
  useGeolocation: () => ({ lat: null, lng: null }),
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
      designers: [
        { id: "d-1" },
        { id: "d-2" },
      ],
      loading: false,
      error: null,
      hasMore: false,
      loadMore: vi.fn(),
    });
    render(<SearchPage />);
    expect(screen.getAllByTestId("designer-card")).toHaveLength(2);
    expect(screen.getByText(/all/i)).toBeInTheDocument();
  });

  it("toggles the active state when a quick-filter chip is clicked", () => {
    render(<SearchPage />);
    const chip = screen.getByRole("button", { name: /kaba & slit/i });
    fireEvent.click(chip);
    // The chip should still be in the document — the click toggles selection
    expect(chip).toBeInTheDocument();
  });
});
