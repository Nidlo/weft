import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "next-themes";

import { ThemeToggle } from "./theme-toggle";

beforeEach(() => {
  // jsdom has no matchMedia by default; next-themes calls it.
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

function renderWithTheme(ui: React.ReactNode) {
  return render(
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {ui}
    </ThemeProvider>
  );
}

describe("ThemeToggle", () => {
  it("exposes a labelled button after mount", async () => {
    renderWithTheme(<ThemeToggle />);
    const btn = await screen.findByRole("button", {
      name: /switch to (light|dark) theme/i,
    });
    expect(btn).toBeInTheDocument();
  });

  it("flips the label after a click", async () => {
    renderWithTheme(<ThemeToggle />);
    const btn = await screen.findByRole("button", {
      name: /switch to dark theme/i,
    });
    fireEvent.click(btn);
    const flipped = await screen.findByRole("button", {
      name: /switch to light theme/i,
    });
    expect(flipped).toBeInTheDocument();
  });
});
