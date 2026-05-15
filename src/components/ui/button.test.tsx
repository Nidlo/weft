import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button } from "./button";

describe("Button", () => {
  it("renders children as the button label", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  it("triggers onClick when idle", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  describe("loading state", () => {
    it("renders a spinner alongside the original label by default", () => {
      render(<Button loading>Save</Button>);
      const btn = screen.getByRole("button", { name: /save/i });
      expect(btn).toHaveAttribute("data-loading", "true");
      expect(btn.querySelector("svg")).toBeInTheDocument();
    });

    it("swaps the label when `loadingLabel` is provided", () => {
      render(
        <Button loading loadingLabel="Saving...">
          Save
        </Button>
      );
      expect(
        screen.getByRole("button", { name: /saving/i })
      ).toBeInTheDocument();
      expect(screen.queryByText("Save")).not.toBeInTheDocument();
    });

    it("disables the button and sets aria-busy", () => {
      render(<Button loading>Save</Button>);
      const btn = screen.getByRole("button");
      expect(btn).toBeDisabled();
      expect(btn).toHaveAttribute("aria-busy", "true");
    });

    it("does not invoke onClick when loading", async () => {
      const onClick = vi.fn();
      render(
        <Button loading onClick={onClick}>
          Save
        </Button>
      );
      // Clicking a disabled button silently no-ops; this proves the disabled
      // state actually gates the handler (not a stale aria attribute).
      await userEvent.click(screen.getByRole("button"));
      expect(onClick).not.toHaveBeenCalled();
    });

    it("preserves the button footprint (size class still applies)", () => {
      const { rerender } = render(<Button size="lg">Save</Button>);
      const idleClass = screen.getByRole("button").className;
      rerender(
        <Button size="lg" loading>
          Save
        </Button>
      );
      const loadingClass = screen.getByRole("button").className;
      // Size-related classes (h-11, rounded-lg, etc.) must persist so the
      // loading state doesn't trigger a layout shift in the surrounding row.
      expect(loadingClass).toContain("h-11");
      expect(idleClass).toContain("h-11");
    });
  });

  it("respects an explicit `disabled` prop without loading", () => {
    render(<Button disabled>Save</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).not.toHaveAttribute("aria-busy", "true");
    expect(btn).not.toHaveAttribute("data-loading");
  });
});
