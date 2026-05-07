"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import type { Landmarks } from "@/types/graphql";
import { cn } from "@/lib/utils";

interface LandmarkOverlayProps {
  /** Local File or remote URL to render as the underlay. */
  photo: File | string;
  /** Normalized 0-1 coords from the AI service. Names match MediaPipe taxonomy. */
  landmarks: Landmarks | null;
  /**
   * Visibility threshold below which a landmark is rendered with the
   * "occluded" treatment (open ring instead of filled dot). Mirrors the
   * fitscan default in `PoseDetector.find_occluded_landmarks`.
   */
  occludedThreshold?: number;
  /**
   * When true, dots become draggable via pointer events. Each move fires
   * `onLandmarksChange` with the FULL updated landmark map (sparse-merge
   * keeps any unchanged entries' visibility unchanged). When false, the
   * overlay is read-only — same render path, no pointer wiring.
   */
  editable?: boolean;
  /** Called on every pointer-up after a drag with the full updated map. */
  onLandmarksChange?: (next: Landmarks) => void;
  className?: string;
}

interface DragState {
  name: string;
  pointerId: number;
}

/**
 * Photo + per-landmark overlay. Read-only by default (S2.5); set
 * `editable` to surface draggable dots that fire `onLandmarksChange`
 * with the full updated coordinate map (S2.5b). Recompute-from-coords
 * (the affected measurement values changing as the user drags) is
 * still deferred to S2.5c — this component only persists positions.
 *
 * The component handles:
 *   - Local `File` photos (creates an object URL, revokes on unmount)
 *   - Remote URLs (rendered as-is)
 *   - Null landmarks (renders the photo with no overlay, no error)
 *   - Editable mode: pointer-driven drag with capture so the cursor
 *     can leave the dot during a move without losing the gesture
 */
export function LandmarkOverlay({
  photo,
  landmarks,
  occludedThreshold = 0.3,
  editable = false,
  onLandmarksChange,
  className,
}: LandmarkOverlayProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);

  // For File photos we generate an object URL once via useMemo and revoke
  // it on cleanup. useMemo runs during render which is fine here:
  // URL.createObjectURL is referentially stable for the same File reference,
  // and React 19's purity rule allows side effects inside useMemo's factory
  // (its contract is "compute lazily, cache on deps").
  const src = useMemo(() => {
    if (typeof photo === "string") return photo;
    return URL.createObjectURL(photo);
  }, [photo]);

  useEffect(() => {
    if (typeof photo === "string") return;
    return () => {
      URL.revokeObjectURL(src);
    };
  }, [src, photo]);

  const dots = useMemo(() => {
    if (!landmarks)
      return [] as Array<{
        name: string;
        x: number;
        y: number;
        occluded: boolean;
      }>;
    return Object.entries(landmarks).map(([name, kp]) => ({
      name,
      x: kp.x,
      y: kp.y,
      occluded: kp.visibility < occludedThreshold,
    }));
  }, [landmarks, occludedThreshold]);

  /** Map a pointer event to normalised 0-1 coords within the container. */
  const pointerToNormalised = useCallback(
    (e: ReactPointerEvent<HTMLElement>): { x: number; y: number } | null => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0 || rect.height === 0) return null;
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      return {
        x: Math.min(Math.max(x, 0), 1),
        y: Math.min(Math.max(y, 0), 1),
      };
    },
    [],
  );

  const handleDotPointerDown = (
    e: ReactPointerEvent<HTMLButtonElement>,
    name: string,
  ) => {
    if (!editable || !onLandmarksChange) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ name, pointerId: e.pointerId });
  };

  const handleDotPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag || drag.pointerId !== e.pointerId) return;
    if (!landmarks || !onLandmarksChange) return;
    const next = pointerToNormalised(e);
    if (!next) return;
    const existing = landmarks[drag.name];
    onLandmarksChange({
      ...landmarks,
      [drag.name]: {
        x: next.x,
        y: next.y,
        // Preserve the original visibility — dragging signals user
        // confidence regardless of what MediaPipe scored.
        visibility: existing?.visibility ?? 1.0,
      },
    });
  };

  const handleDotPointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (drag && drag.pointerId === e.pointerId) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Some browsers throw when releasing a pointer that's already gone.
      }
      setDrag(null);
    }
  };

  if (!src) {
    return (
      <div
        className={cn(
          "aspect-[3/4] w-full animate-pulse rounded-2xl bg-muted",
          className,
        )}
        aria-hidden
      />
    );
  }

  return (
    <div
      ref={containerRef}
      // Aspect ratio nudges the overlay to match the typical body-photo shape.
      // The image inside scales to fit; the absolute-positioned dots use
      // 0-1 coords against the container box, which matches MediaPipe's
      // normalised output relative to the full image frame.
      className={cn(
        "relative aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-card",
        editable && "touch-none select-none",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Body scan"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {dots.length === 0 ? null : (
        <div className="absolute inset-0">
          {dots.map((dot) => {
            const isDragging = drag?.name === dot.name;
            const commonStyle = {
              left: `${dot.x * 100}%`,
              top: `${dot.y * 100}%`,
            } as const;
            const dotLabel = `${dot.name.replace(/_/g, " ")}${dot.occluded ? " (low confidence)" : ""}`;

            if (editable && onLandmarksChange) {
              return (
                <button
                  key={dot.name}
                  type="button"
                  onPointerDown={(e) => handleDotPointerDown(e, dot.name)}
                  onPointerMove={handleDotPointerMove}
                  onPointerUp={handleDotPointerUp}
                  onPointerCancel={handleDotPointerUp}
                  className={cn(
                    "absolute -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-background transition-transform",
                    "cursor-grab focus:outline-none focus-visible:ring-foreground active:cursor-grabbing",
                    isDragging && "scale-150",
                    dot.occluded
                      ? "h-3.5 w-3.5 border-2 border-status-warning bg-background"
                      : "h-3 w-3 bg-copper",
                  )}
                  style={commonStyle}
                  aria-label={`Drag to reposition ${dotLabel}`}
                  title={dot.name.replace(/_/g, " ")}
                />
              );
            }
            return (
              <span
                key={dot.name}
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-background",
                  dot.occluded
                    ? "h-3 w-3 border-2 border-status-warning bg-transparent"
                    : "h-2.5 w-2.5 bg-copper",
                )}
                style={commonStyle}
                role="img"
                aria-label={dotLabel}
                title={dot.name.replace(/_/g, " ")}
              />
            );
          })}
        </div>
      )}

      {(editable || dots.some((d) => d.occluded)) && (
        <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-background/85 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground backdrop-blur">
          {editable
            ? "Drag any dot to reposition it. Measurements stay editable below — recompute coming in a follow-up."
            : "Hollow rings = AI saw the landmark at low confidence."}
        </div>
      )}
    </div>
  );
}
