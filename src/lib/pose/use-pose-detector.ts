"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { PoseLandmark } from "./classify-pose";

/**
 * Lazy MediaPipe PoseLandmarker wrapper.
 *
 * The MediaPipe JS (~100 KB) and the WASM + .task model (~17 MB combined)
 * are self-hosted under `/public/mediapipe` and only fetched the first
 * time something calls `ensureReady()` - never at app boot, never in the
 * main bundle. Self-hosting (vs the Google CDN) keeps the scan flow
 * working offline-ish in the PWA and avoids a runtime third-party
 * dependency / supply-chain surface.
 *
 * Detection runs 100% on-device. No frame ever leaves the browser here -
 * only the final captured still goes through the existing upload mutation.
 *
 * All failure modes (no WebAssembly/SIMD, model fetch failed, slow
 * network) resolve to `status: "error"`; callers fall back to the plain
 * file-upload path. We never block the user on this.
 */

const WASM_BASE = "/mediapipe/wasm";
const MODEL_URL = "/mediapipe/pose_landmarker_lite.task";

type Status = "idle" | "loading" | "ready" | "error";

// Minimal shape of what we use from @mediapipe/tasks-vision. Kept local so
// the heavy types aren't pulled into the main bundle's type graph.
interface PoseLandmarkerLike {
  detect: (image: HTMLImageElement | HTMLCanvasElement) => {
    landmarks?: PoseLandmark[][];
  };
  close: () => void;
}

let cached: PoseLandmarkerLike | null = null;
let inflight: Promise<PoseLandmarkerLike> | null = null;

async function loadLandmarker(): Promise<PoseLandmarkerLike> {
  if (cached) return cached;
  if (inflight) return inflight;

  inflight = (async () => {
    // Dynamic import → separate chunk, only pulled when a pose surface
    // actually mounts.
    const vision = await import("@mediapipe/tasks-vision");
    const fileset = await vision.FilesetResolver.forVisionTasks(WASM_BASE);
    const landmarker = await vision.PoseLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
      runningMode: "IMAGE",
      numPoses: 1,
    });
    cached = landmarker as unknown as PoseLandmarkerLike;
    return cached;
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

export interface UsePoseDetectorResult {
  status: Status;
  /** Kick off the (idempotent, cached) model load. Safe to call repeatedly. */
  ensureReady: () => Promise<boolean>;
  /**
   * Detect landmarks in a still image. Returns the first person's 33
   * landmarks, or null if nothing usable was found / model not ready.
   */
  detectImage: (
    image: HTMLImageElement | HTMLCanvasElement
  ) => PoseLandmark[] | null;
}

export function usePoseDetector(): UsePoseDetectorResult {
  const [status, setStatus] = useState<Status>(cached ? "ready" : "idle");
  // Guards setState-after-unmount when the model resolves late.
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const ensureReady = useCallback(async () => {
    if (cached) {
      if (mounted.current) setStatus("ready");
      return true;
    }
    if (mounted.current) setStatus("loading");
    try {
      await loadLandmarker();
      if (mounted.current) setStatus("ready");
      return true;
    } catch (err) {
      if (typeof console !== "undefined") {
        console.error("Pose detector failed to load:", err);
      }
      if (mounted.current) setStatus("error");
      return false;
    }
  }, []);

  const detectImage = useCallback(
    (image: HTMLImageElement | HTMLCanvasElement): PoseLandmark[] | null => {
      if (!cached) return null;
      try {
        const result = cached.detect(image);
        return result.landmarks?.[0] ?? null;
      } catch (err) {
        if (typeof console !== "undefined") {
          console.error("Pose detect (image) failed:", err);
        }
        return null;
      }
    },
    []
  );

  return { status, ensureReady, detectImage };
}

/**
 * Decode a `File` into an `HTMLImageElement` for one-shot still detection.
 * Resolves null on any decode error (corrupt file, unsupported type) so
 * callers degrade gracefully instead of throwing.
 */
export function fileToImage(file: File): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}
