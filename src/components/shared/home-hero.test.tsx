import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Stub the lookbook — its infinite-loop motion.div hangs JSDOM and the test
// is concerned with hero copy, not the marquee.
vi.mock("@/components/shared/auth-lookbook", () => ({
  AuthLookbook: () => null,
}));

import { useAuthStore } from "@/lib/stores/auth";
import { HomeHero } from "./home-hero";

beforeEach(() => {
  // Hero CTA shows guest copy when unauthenticated + hydrated.
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    _hasHydrated: true,
  });
});

describe("HomeHero", () => {
  it("renders the global headline (no Ghana-only framing)", () => {
    render(<HomeHero />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /clothes made the way you want them/i,
      }),
    ).toBeInTheDocument();
  });

  it("shows the guest CTA when unauthenticated", () => {
    render(<HomeHero />);
    expect(screen.getByRole("link", { name: /get started/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /browse designers/i }),
    ).toBeInTheDocument();
  });

  it("does NOT mention 'Ghana' in marketing copy", () => {
    const { container } = render(<HomeHero />);
    expect(container.textContent ?? "").not.toMatch(/ghana/i);
  });
});
