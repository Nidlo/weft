import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock next/navigation BEFORE importing the page so `useRouter()` resolves
// to a controllable spy. The carousel only depends on `router.push` for
// the "Get started" tail action.
const pushSpy = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushSpy }),
}));

import WelcomePage from "./page";

describe("<WelcomePage />", () => {
  beforeEach(() => {
    pushSpy.mockReset();
  });

  it("renders the first slide on initial mount", () => {
    render(<WelcomePage />);
    expect(screen.getByText("Find your designer")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /get started/i })).toBeNull();
  });

  it("Skip link points at /auth/phone", () => {
    render(<WelcomePage />);
    const skip = screen.getByRole("link", { name: /skip to sign-in/i });
    expect(skip.getAttribute("href")).toBe("/auth/phone");
  });

  it("Next advances through every slide and the last shows Get started", () => {
    render(<WelcomePage />);

    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText("Get the perfect fit")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText("Pay your way")).toBeInTheDocument();

    // Last slide swaps the CTA label.
    expect(screen.getByRole("button", { name: /get started/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^next$/i })).toBeNull();
  });

  it("Get started routes to /auth/phone via router.push", () => {
    render(<WelcomePage />);

    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    fireEvent.click(screen.getByRole("button", { name: /get started/i }));

    expect(pushSpy).toHaveBeenCalledTimes(1);
    expect(pushSpy).toHaveBeenCalledWith("/auth/phone");
  });

  it("Back button is disabled on slide 1 and enabled afterwards", () => {
    render(<WelcomePage />);

    const backBtn = screen.getByRole("button", { name: /previous slide/i });
    expect(backBtn).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByRole("button", { name: /previous slide/i })).not.toBeDisabled();
  });

  it("Back returns to the previous slide", () => {
    render(<WelcomePage />);

    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText("Pay your way")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /previous slide/i }));
    expect(screen.getByText("Get the perfect fit")).toBeInTheDocument();
  });

  it("indicator dots jump directly to the chosen slide", () => {
    render(<WelcomePage />);

    fireEvent.click(screen.getByRole("button", { name: /go to slide 3/i }));
    expect(screen.getByText("Pay your way")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /get started/i })).toBeInTheDocument();
  });

  it("aria-current marks the active slide indicator", () => {
    render(<WelcomePage />);

    expect(screen.getByRole("button", { name: /go to slide 1/i })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(screen.getByRole("button", { name: /go to slide 2/i })).not.toHaveAttribute(
      "aria-current",
    );

    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByRole("button", { name: /go to slide 2/i })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("carousel region has the documented a11y attributes + slide-position label", () => {
    const { container } = render(<WelcomePage />);

    const region = container.querySelector("[role='region']");
    expect(region).not.toBeNull();
    expect(region?.getAttribute("aria-roledescription")).toBe("carousel");
    expect(region?.getAttribute("aria-label")).toBe("Welcome slide 1 of 3");

    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    const updated = container.querySelector("[role='region']");
    expect(updated?.getAttribute("aria-label")).toBe("Welcome slide 2 of 3");
  });
});
