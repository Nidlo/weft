import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const createVideoLandmarkerSpy = vi.fn();

vi.mock("@/lib/pose/use-pose-detector", () => ({
  createVideoLandmarker: () => createVideoLandmarkerSpy(),
}));

vi.mock("@/lib/pose/classify-pose", () => ({
  classifyPose: () => ({ ok: false, issues: ["Line up with the guide."] }),
}));

import { PoseCameraCapture } from "./pose-camera-capture";

beforeEach(() => {
  createVideoLandmarkerSpy.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("<PoseCameraCapture />", () => {
  it("falls back gracefully when the browser has no camera API", async () => {
    // jsdom has no navigator.mediaDevices by default → unsupported path.
    const onCancel = vi.fn();
    createVideoLandmarkerSpy.mockResolvedValue({
      detectForVideo: vi.fn(),
      close: vi.fn(),
    });

    render(
      <PoseCameraCapture
        variant="front"
        onCapture={vi.fn()}
        onCancel={onCancel}
      />
    );

    await waitFor(() =>
      expect(
        screen.getByText(/live camera isn't available here/i)
      ).toBeInTheDocument()
    );
    fireEvent.click(
      screen.getByRole("button", { name: /choose a photo instead/i })
    );
    expect(onCancel).toHaveBeenCalled();
  });

  it("shows the blocked-permission fallback when getUserMedia is denied", async () => {
    const close = vi.fn();
    createVideoLandmarkerSpy.mockResolvedValue({
      detectForVideo: vi.fn(),
      close,
    });
    vi.stubGlobal("navigator", {
      mediaDevices: {
        getUserMedia: vi
          .fn()
          .mockRejectedValue(new DOMException("denied", "NotAllowedError")),
      },
    });

    const onCancel = vi.fn();
    render(
      <PoseCameraCapture
        variant="side"
        onCapture={vi.fn()}
        onCancel={onCancel}
      />
    );

    await waitFor(() =>
      expect(screen.getByText(/camera access was blocked/i)).toBeInTheDocument()
    );
    fireEvent.click(
      screen.getByRole("button", { name: /choose a photo instead/i })
    );
    expect(onCancel).toHaveBeenCalled();
  });

  it("treats a failed model load as unsupported (keeps file upload available)", async () => {
    createVideoLandmarkerSpy.mockResolvedValue(null);
    vi.stubGlobal("navigator", {
      mediaDevices: { getUserMedia: vi.fn() },
    });

    render(
      <PoseCameraCapture
        variant="front"
        onCapture={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    await waitFor(() =>
      expect(
        screen.getByText(/live camera isn't available here/i)
      ).toBeInTheDocument()
    );
  });
});
