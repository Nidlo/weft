"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Upload,
  Video,
  X,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { classifyPose, type PoseVariant } from "@/lib/pose/classify-pose";
import { fileToImage, usePoseDetector } from "@/lib/pose/use-pose-detector";
import { cn } from "@/lib/utils";

// Camera capture pulls in the MediaPipe VIDEO landmarker. Keep it out of
// this field's chunk; only fetch it when the user taps "Use camera".
const PoseCameraCapture = dynamic(
  () => import("./pose-camera-capture").then((m) => m.PoseCameraCapture),
  { ssr: false }
);

interface Props {
  id: string;
  label: string;
  required?: boolean;
  /** Which pose this photo should contain - drives the on-device check. */
  variant: PoseVariant;
  file: File | null;
  onChange: (file: File | null) => void;
}

type CheckState =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "ok" }
  | { kind: "warn"; issue: string }
  // Model unavailable / decode failed - we silently accept the file. The
  // server still runs its own pose checks (`degradedModes`); this is only
  // an early nudge, never a gate.
  | { kind: "skipped" };

/**
 * File-picker for a Fitscan photo that runs an on-device pose sanity
 * check after selection. The check is advisory only: the file is accepted
 * immediately on pick, and any warning is dismissible. Detection runs
 * 100% locally - the picked image is only ever uploaded later via the
 * existing measurement mutation, never sent anywhere by this component.
 */
export function PoseCheckedPhotoField({
  id,
  label,
  required,
  variant,
  file,
  onChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { ensureReady, detectImage } = usePoseDetector();
  const [check, setCheck] = useState<CheckState>({ kind: "idle" });
  const [cameraOpen, setCameraOpen] = useState(false);

  const runCheck = useCallback(
    async (picked: File) => {
      setCheck({ kind: "checking" });
      const ready = await ensureReady();
      if (!ready) {
        setCheck({ kind: "skipped" });
        return;
      }
      const img = await fileToImage(picked);
      if (!img) {
        setCheck({ kind: "skipped" });
        return;
      }
      const landmarks = detectImage(img);
      const result = classifyPose(landmarks, variant);
      setCheck(
        result.ok
          ? { kind: "ok" }
          : { kind: "warn", issue: result.issues[0] ?? "" }
      );
    },
    [ensureReady, detectImage, variant]
  );

  const handlePick = (picked: File | null) => {
    // Accept immediately - never block the user on the check.
    onChange(picked);
    if (picked) {
      void runCheck(picked);
    } else {
      setCheck({ kind: "idle" });
    }
  };

  const reopenPicker = () => {
    onChange(null);
    setCheck({ kind: "idle" });
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  };

  const handleCameraCapture = (captured: File) => {
    setCameraOpen(false);
    onChange(captured);
    // The live overlay only fires the capture once the pose held correct,
    // so it's already validated - mark it good without re-running the
    // still check.
    setCheck({ kind: "ok" });
  };

  if (cameraOpen) {
    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-1 text-sm">
          {label}
          {required && (
            <span className="text-copper" aria-label="required">
              *
            </span>
          )}
        </Label>
        <PoseCameraCapture
          variant={variant}
          onCapture={handleCameraCapture}
          onCancel={() => setCameraOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-1 text-sm">
        {label}
        {required && (
          <span className="text-copper" aria-label="required">
            *
          </span>
        )}
      </Label>
      <label
        htmlFor={id}
        className={cn(
          "border-border bg-card/40 flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed p-4",
          "hover:border-copper/50 hover:bg-card transition-colors",
          file && "border-foreground/30 bg-card"
        )}
      >
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl ring-1",
            file
              ? "bg-foreground text-background ring-transparent"
              : "bg-secondary text-foreground ring-border"
          )}
        >
          {file ? (
            <CheckCircle2 className="h-4 w-4" aria-hidden />
          ) : (
            <Camera className="h-4 w-4" aria-hidden />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">
            {file ? file.name : "Tap to choose a photo"}
          </p>
          <p className="text-muted-foreground text-xs">
            {check.kind === "checking"
              ? "Checking your pose..."
              : check.kind === "ok"
                ? "Pose looks good"
                : file
                  ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                  : "JPEG, PNG, or WebP"}
          </p>
        </div>
        <Upload
          className="text-muted-foreground h-4 w-4 shrink-0"
          aria-hidden
        />
      </label>
      <Input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => handlePick(e.target.files?.[0] ?? null)}
      />

      <button
        type="button"
        onClick={() => setCameraOpen(true)}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
      >
        <Video className="h-3.5 w-3.5" aria-hidden />
        Use camera with a live pose guide
      </button>

      {check.kind === "warn" && (
        <div
          role="status"
          className="border-status-warning-soft bg-status-warning-soft/40 flex items-start gap-3 rounded-xl border p-3"
        >
          <AlertTriangle
            className="text-status-warning-fg mt-0.5 h-4 w-4 shrink-0"
            aria-hidden
          />
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-sm font-medium">
              This doesn&apos;t look like the {label.toLowerCase()} yet
            </p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {check.issue} You can still use this photo - accuracy may just be
              lower.
            </p>
            <div className="flex items-center gap-2 pt-0.5">
              <Button
                type="button"
                variant="luxe-outline"
                size="sm"
                onClick={reopenPicker}
              >
                Pick another
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCheck({ kind: "ok" })}
              >
                <X className="mr-1 h-3 w-3" aria-hidden />
                Use anyway
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
