import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { LandmarkOverlay } from "./landmark-overlay";
import type { Landmarks } from "@/types/graphql";

beforeAll(() => {
  // jsdom doesn't implement object-URL APIs; the component creates one
  // for File-photos and revokes it on unmount.
  Object.defineProperty(URL, "createObjectURL", {
    value: vi.fn(() => "blob:mock-url"),
    configurable: true,
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    value: vi.fn(),
    configurable: true,
  });
  // jsdom doesn't implement pointer-capture; stub so editable-mode drags
  // can fire without throwing. (Same shim Radix-Select tests use.)
  if (!HTMLElement.prototype.setPointerCapture) {
    HTMLElement.prototype.setPointerCapture = vi.fn();
  }
  if (!HTMLElement.prototype.releasePointerCapture) {
    HTMLElement.prototype.releasePointerCapture = vi.fn();
  }
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
  }
});

beforeEach(() => {
  // The container's bounding rect drives the drag-coord math. jsdom
  // returns zeroes by default; stub so a pointer move at (200, 400)
  // resolves to normalised (0.5, 0.5) in a 400x800 box.
  Element.prototype.getBoundingClientRect = vi.fn(() => ({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 400,
    bottom: 800,
    width: 400,
    height: 800,
    toJSON: () => ({}),
  })) as unknown as Element["getBoundingClientRect"];
});

const SAMPLE_LANDMARKS: Landmarks = {
  left_shoulder: { x: 0.35, y: 0.21, visibility: 0.92 },
  right_shoulder: { x: 0.65, y: 0.21, visibility: 0.91 },
  left_hip: { x: 0.4, y: 0.55, visibility: 0.78 },
  right_hip_low_vis: { x: 0.6, y: 0.55, visibility: 0.15 },
};

describe("LandmarkOverlay", () => {
  it("renders the photo with one dot per landmark", () => {
    render(
      <LandmarkOverlay
        photo="https://example.com/scan.jpg"
        landmarks={SAMPLE_LANDMARKS}
      />
    );

    const img = screen.getByAltText("Body scan") as HTMLImageElement;
    expect(img.getAttribute("src")).toBe("https://example.com/scan.jpg");

    // Four landmarks → four dots, each with an aria-label
    expect(
      screen.getByRole("img", { name: /left shoulder/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /right shoulder/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /left hip/i })).toBeInTheDocument();
  });

  it("flags landmarks below the threshold as low confidence", () => {
    render(
      <LandmarkOverlay
        photo="https://example.com/scan.jpg"
        landmarks={SAMPLE_LANDMARKS}
      />
    );

    expect(
      screen.getByRole("img", {
        name: /right hip low vis.*low confidence/i,
      })
    ).toBeInTheDocument();
  });

  it("renders no dots and no warning when landmarks is null", () => {
    render(
      <LandmarkOverlay photo="https://example.com/scan.jpg" landmarks={null} />
    );

    // Photo still renders
    expect(screen.getByAltText("Body scan")).toBeInTheDocument();
    // No landmark dots
    expect(screen.queryByRole("img", { name: /shoulder/i })).toBeNull();
    // No warning banner
    expect(screen.queryByText(/low confidence/i)).toBeNull();
  });

  it("creates an object URL for File photos", () => {
    const file = new File(["x"], "scan.jpg", { type: "image/jpeg" });
    render(<LandmarkOverlay photo={file} landmarks={null} />);

    const img = screen.getByAltText("Body scan") as HTMLImageElement;
    expect(img.getAttribute("src")).toBe("blob:mock-url");
    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
  });

  it("positions each dot at the normalised coordinates", () => {
    render(
      <LandmarkOverlay
        photo="https://example.com/scan.jpg"
        landmarks={{
          left_shoulder: { x: 0.35, y: 0.21, visibility: 0.92 },
        }}
      />
    );

    const dot = screen.getByRole("img", { name: /left shoulder/i });
    expect(dot.getAttribute("style")).toContain("left: 35%");
    expect(dot.getAttribute("style")).toContain("top: 21%");
  });

  // ────────────────────── Editable mode (S2.5b) ──────────────────────

  describe("editable mode", () => {
    it("renders dots as buttons (drag handles) and not as static images", () => {
      render(
        <LandmarkOverlay
          photo="https://example.com/scan.jpg"
          landmarks={{
            left_shoulder: { x: 0.35, y: 0.21, visibility: 0.92 },
          }}
          editable
          onLandmarksChange={vi.fn()}
        />
      );

      // Editable dots are buttons with a drag-affordance aria-label
      expect(
        screen.getByRole("button", {
          name: /drag to reposition.*left shoulder/i,
        })
      ).toBeInTheDocument();
      // No role=img dot in editable mode (each dot is a button instead)
      expect(screen.queryByRole("img", { name: /left shoulder/i })).toBeNull();
    });

    it("calls onLandmarksChange with updated coords on drag", () => {
      const onChange = vi.fn();
      render(
        <LandmarkOverlay
          photo="https://example.com/scan.jpg"
          landmarks={{
            left_shoulder: { x: 0.35, y: 0.21, visibility: 0.92 },
            right_hip: { x: 0.6, y: 0.55, visibility: 0.85 },
          }}
          editable
          onLandmarksChange={onChange}
        />
      );

      const dot = screen.getByRole("button", {
        name: /drag to reposition.*left shoulder/i,
      });

      // Simulate a pointer-down then pointer-move to (200, 400) within
      // the stubbed 400x800 bounding rect → normalised (0.5, 0.5)
      fireEvent.pointerDown(dot, { pointerId: 1, clientX: 0, clientY: 0 });
      fireEvent.pointerMove(dot, { pointerId: 1, clientX: 200, clientY: 400 });

      expect(onChange).toHaveBeenCalled();
      const lastArg = onChange.mock.calls.at(-1)?.[0];
      expect(lastArg.left_shoulder.x).toBe(0.5);
      expect(lastArg.left_shoulder.y).toBe(0.5);
      // Visibility preserved from the original entry
      expect(lastArg.left_shoulder.visibility).toBe(0.92);
      // Other landmarks untouched
      expect(lastArg.right_hip.x).toBe(0.6);
      expect(lastArg.right_hip.y).toBe(0.55);
    });

    it("clamps drag coordinates to the [0, 1] range", () => {
      const onChange = vi.fn();
      render(
        <LandmarkOverlay
          photo="https://example.com/scan.jpg"
          landmarks={{ left_shoulder: { x: 0.5, y: 0.5, visibility: 0.9 } }}
          editable
          onLandmarksChange={onChange}
        />
      );

      const dot = screen.getByRole("button", { name: /left shoulder/i });
      fireEvent.pointerDown(dot, { pointerId: 1, clientX: 200, clientY: 400 });
      // Way outside the 400x800 box - clamps to (1, 1)
      fireEvent.pointerMove(dot, {
        pointerId: 1,
        clientX: 10000,
        clientY: 10000,
      });

      const lastArg = onChange.mock.calls.at(-1)?.[0];
      expect(lastArg.left_shoulder.x).toBe(1);
      expect(lastArg.left_shoulder.y).toBe(1);
    });

    it("ignores pointer-move when no drag is active (no onChange)", () => {
      const onChange = vi.fn();
      render(
        <LandmarkOverlay
          photo="https://example.com/scan.jpg"
          landmarks={{ left_shoulder: { x: 0.5, y: 0.5, visibility: 0.9 } }}
          editable
          onLandmarksChange={onChange}
        />
      );

      const dot = screen.getByRole("button", { name: /left shoulder/i });
      // No pointerDown first - move alone shouldn't trigger anything
      fireEvent.pointerMove(dot, { pointerId: 1, clientX: 200, clientY: 400 });

      expect(onChange).not.toHaveBeenCalled();
    });
  });
});
