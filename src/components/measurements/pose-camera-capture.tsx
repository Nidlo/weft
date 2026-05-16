"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  classifyPose,
  type PoseLandmark,
  type PoseVariant,
} from "@/lib/pose/classify-pose";
import {
  createVideoLandmarker,
  type VideoPoseLandmarker,
} from "@/lib/pose/use-pose-detector";

interface Props {
  variant: PoseVariant;
  /** Receives the captured still as a JPEG File, ready for the upload mutation. */
  onCapture: (file: File) => void;
  /** User backed out / camera unavailable - parent should keep file upload. */
  onCancel: () => void;
}

// MediaPipe BlazePose skeleton edges we draw. Subset that communicates the
// pose (limbs + torso); we skip face mesh - it adds noise, not signal.
const BONES: Array<[number, number]> = [
  [11, 12], // shoulders
  [11, 13],
  [13, 15], // left arm
  [12, 14],
  [14, 16], // right arm
  [11, 23],
  [12, 24], // torso sides
  [23, 24], // hips
  [23, 25],
  [25, 27], // left leg
  [24, 26],
  [26, 28], // right leg
];

type Phase = "loading" | "denied" | "unsupported" | "live" | "captured";

// Pose must hold correct for this long before we auto-capture, so a
// momentary correct frame mid-movement doesn't fire.
const HOLD_MS = 1500;

export function PoseCameraCapture({ variant, onCapture, onCancel }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<VideoPoseLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const okSinceRef = useRef<number | null>(null);
  // Avoids a stale-closure capture firing twice during the same session.
  const capturedRef = useRef(false);

  const [phase, setPhase] = useState<Phase>("loading");
  const [hint, setHint] = useState<string>("Getting the camera ready...");
  const [matched, setMatched] = useState(false);

  const stopEverything = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    landmarkerRef.current?.close();
    landmarkerRef.current = null;
  }, []);

  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video || capturedRef.current) return;
    capturedRef.current = true;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          capturedRef.current = false;
          return;
        }
        const file = new File([blob], `fitscan-${variant}.jpg`, {
          type: "image/jpeg",
        });
        setPhase("captured");
        stopEverything();
        onCapture(file);
      },
      "image/jpeg",
      0.92
    );
  }, [variant, onCapture, stopEverything]);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices?.getUserMedia
      ) {
        setPhase("unsupported");
        return;
      }

      const landmarker = await createVideoLandmarker();
      if (cancelled) {
        landmarker?.close();
        return;
      }
      if (!landmarker) {
        setPhase("unsupported");
        return;
      }
      landmarkerRef.current = landmarker;

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
      } catch {
        // Permission denied, or no camera. Either way the parent keeps
        // the working file-upload path; we just surface the choice.
        if (!cancelled) setPhase("denied");
        return;
      }
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play().catch(() => {});
      if (cancelled) return;

      setPhase("live");
      setHint("Stand back so your whole body fits the frame.");

      const tick = () => {
        const v = videoRef.current;
        const canvas = canvasRef.current;
        const lm = landmarkerRef.current;
        if (!v || !canvas || !lm || capturedRef.current) return;

        const result = lm.detectForVideo(v, performance.now());
        const landmarks: PoseLandmark[] | undefined = result.landmarks?.[0];

        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.width = v.videoWidth || canvas.width;
          canvas.height = v.videoHeight || canvas.height;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          if (landmarks) drawSkeleton(ctx, landmarks, canvas);
        }

        const verdict = classifyPose(landmarks, variant);
        setMatched(verdict.ok);
        setHint(
          verdict.ok
            ? "Hold it right there..."
            : (verdict.issues[0] ?? "Line up with the guide.")
        );

        const now = performance.now();
        if (verdict.ok) {
          if (okSinceRef.current === null) okSinceRef.current = now;
          if (now - okSinceRef.current >= HOLD_MS) {
            capture();
            return;
          }
        } else {
          okSinceRef.current = null;
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }

    void start();
    return () => {
      cancelled = true;
      stopEverything();
    };
  }, [variant, capture, stopEverything]);

  const handleCancel = () => {
    stopEverything();
    onCancel();
  };

  if (phase === "unsupported" || phase === "denied") {
    return (
      <div className="border-border bg-card/40 space-y-3 rounded-2xl border p-5 text-center">
        <p className="text-sm font-medium">
          {phase === "denied"
            ? "Camera access was blocked"
            : "Live camera isn't available here"}
        </p>
        <p className="text-muted-foreground text-xs leading-relaxed">
          No problem - you can still pick a photo from your device and
          we&apos;ll check the pose the same way.
        </p>
        <Button
          type="button"
          variant="luxe-outline"
          size="sm"
          onClick={handleCancel}
        >
          Choose a photo instead
        </Button>
      </div>
    );
  }

  return (
    <div className="border-border bg-foreground/95 relative overflow-hidden rounded-2xl border">
      <div className="relative aspect-3/4 w-full">
        <video
          ref={videoRef}
          playsInline
          muted
          aria-label="Live camera preview for pose guidance"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <canvas
          ref={canvasRef}
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />

        {phase === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 text-white">
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
            <p className="text-sm">Getting the camera ready...</p>
          </div>
        )}

        {phase === "live" && (
          <>
            <div
              role="status"
              aria-live="polite"
              className={`absolute inset-x-3 top-3 rounded-xl px-3 py-2 text-center text-sm font-medium backdrop-blur-sm ${
                matched
                  ? "bg-status-success/80 text-white"
                  : "bg-black/55 text-white"
              }`}
            >
              {hint}
            </div>
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 p-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="bg-black/40 text-white hover:bg-black/60"
                onClick={handleCancel}
              >
                <X className="mr-1 h-4 w-4" aria-hidden />
                Cancel
              </Button>
              <Button type="button" variant="luxe" size="sm" onClick={capture}>
                <Camera className="mr-1 h-4 w-4" aria-hidden />
                Capture now
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Draw the pose skeleton onto the overlay canvas. Copper bones + joint
 * dots so the user can see the model is tracking them; purely
 * informational, never blocks capture.
 */
function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: PoseLandmark[],
  canvas: HTMLCanvasElement
) {
  const px = (n: number, dim: number) => n * dim;
  ctx.lineWidth = Math.max(2, canvas.width * 0.006);
  ctx.strokeStyle = "rgba(214, 137, 78, 0.9)"; // copper
  ctx.fillStyle = "rgba(214, 137, 78, 0.95)";

  for (const [a, b] of BONES) {
    const pa = landmarks[a];
    const pb = landmarks[b];
    if (!pa || !pb) continue;
    if ((pa.visibility ?? 1) < 0.4 || (pb.visibility ?? 1) < 0.4) continue;
    ctx.beginPath();
    ctx.moveTo(px(pa.x, canvas.width), px(pa.y, canvas.height));
    ctx.lineTo(px(pb.x, canvas.width), px(pb.y, canvas.height));
    ctx.stroke();
  }

  const r = Math.max(3, canvas.width * 0.008);
  for (const p of landmarks) {
    if ((p.visibility ?? 1) < 0.4) continue;
    ctx.beginPath();
    ctx.arc(px(p.x, canvas.width), px(p.y, canvas.height), r, 0, Math.PI * 2);
    ctx.fill();
  }
}
