"use client";

import Image from "next/image";
import { useState, useRef, useCallback } from "react";
import {
  AlertCircle,
  Camera,
  Lightbulb,
  RefreshCw,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { useAddPortfolioImage } from "@/lib/hooks/use-profile-mutations";
import { cn } from "@/lib/utils";

interface UploadedImage {
  url: string;
  thumbnailUrl: string;
}

interface FailedUpload {
  id: string;
  file: File;
  reason: string;
}

const MAX_IMAGES = 20;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function StepPortfolio() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [failed, setFailed] = useState<FailedUpload[]>([]);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addImage } = useAddPortfolioImage();

  const uploadOne = useCallback(
    async (
      file: File
    ): Promise<{ ok: true } | { ok: false; reason: string }> => {
      try {
        const result = await addImage(file);
        if (result?.portfolioImages) {
          const latest =
            result.portfolioImages[result.portfolioImages.length - 1];
          setImages((prev) => [
            ...prev,
            { url: latest.url, thumbnailUrl: latest.thumbnail_url },
          ]);
          return { ok: true };
        }
        return { ok: false, reason: "Server didn't return the new image." };
      } catch (err) {
        const reason =
          err instanceof Error
            ? err.message
            : "Upload failed. Check your connection and try again.";
        return { ok: false, reason };
      }
    },
    [addImage]
  );

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const remaining = MAX_IMAGES - images.length;
      const toUpload = Array.from(files).slice(0, remaining);

      if (toUpload.length === 0) {
        toast.error(`Maximum ${MAX_IMAGES} images allowed`);
        return;
      }

      setUploading(true);
      try {
        for (const file of toUpload) {
          if (!ACCEPTED_TYPES.includes(file.type)) {
            setFailed((prev) => [
              ...prev,
              {
                id: `${file.name}-${Date.now()}-${Math.random()}`,
                file,
                reason: "Only JPEG, PNG, and WebP are accepted.",
              },
            ]);
            continue;
          }
          if (file.size > MAX_FILE_SIZE) {
            setFailed((prev) => [
              ...prev,
              {
                id: `${file.name}-${Date.now()}-${Math.random()}`,
                file,
                reason: "File exceeds the 10MB limit.",
              },
            ]);
            continue;
          }

          const result = await uploadOne(file);
          if (!result.ok) {
            setFailed((prev) => [
              ...prev,
              {
                id: `${file.name}-${Date.now()}-${Math.random()}`,
                file,
                reason: result.reason,
              },
            ]);
          }
        }
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [images.length, uploadOne]
  );

  const handleRetry = useCallback(
    async (entry: FailedUpload) => {
      setRetrying(entry.id);
      const result = await uploadOne(entry.file);
      setRetrying(null);
      if (result.ok) {
        setFailed((prev) => prev.filter((f) => f.id !== entry.id));
      } else {
        setFailed((prev) =>
          prev.map((f) =>
            f.id === entry.id ? { ...f, reason: result.reason } : f
          )
        );
      }
    },
    [uploadOne]
  );

  const handleDismissFailure = (id: string) => {
    setFailed((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const isFull = images.length >= MAX_IMAGES;

  return (
    <div className="space-y-7">
      <div className="flex items-start gap-3">
        <span className="bg-secondary text-foreground flex size-9 shrink-0 items-center justify-center rounded-xl">
          <Camera className="h-4 w-4" aria-hidden />
        </span>
        <div className="flex-1">
          <h2 className="text-display text-lg font-semibold tracking-tight">
            Show your best work.
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            <span className="text-foreground font-medium tabular-nums">
              {images.length}
            </span>
            <span className="text-muted-foreground/70">/{MAX_IMAGES}</span>{" "}
            uploaded · designers with 3+ photos get 5× more inquiries.
          </p>
        </div>
      </div>

      {/* Upload zone — copper-tinted dashed border, hover/drag affordance */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        className={cn(
          "relative rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200",
          dragOver
            ? "border-copper bg-copper/5"
            : "border-border hover:border-foreground/30 hover:bg-card/40",
          isFull && "pointer-events-none opacity-60"
        )}
      >
        <span className="bg-secondary text-foreground mx-auto flex size-14 items-center justify-center rounded-2xl">
          <Upload className="h-6 w-6" aria-hidden />
        </span>
        <p className="mt-4 text-sm font-medium">
          Drag & drop images, or pick from your device
        </p>
        <Button
          type="button"
          variant="luxe-outline"
          size="sm"
          className="mt-4"
          disabled={uploading || isFull}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Uploading..." : "Choose files"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          aria-label="Upload portfolio images"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <p className="text-muted-foreground mt-2 text-xs">
          JPEG, PNG, or WebP · max 10MB each
        </p>
      </div>

      {/* Failed uploads — persistent, with retry */}
      {failed.length > 0 && (
        <div className="space-y-2">
          <p className="text-status-error-fg text-sm font-medium">
            {failed.length} upload{failed.length === 1 ? "" : "s"} failed
          </p>
          <ul className="space-y-2">
            {failed.map((entry) => (
              <li
                key={entry.id}
                className="border-status-error-soft bg-status-error-soft/40 flex items-center gap-3 rounded-2xl border p-3"
              >
                <AlertCircle className="text-status-error h-4 w-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {entry.file.name}
                  </p>
                  <p className="text-status-error-fg text-xs">{entry.reason}</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRetry(entry)}
                  disabled={retrying === entry.id}
                >
                  <RefreshCw
                    className={cn(
                      "mr-1 h-3 w-3",
                      retrying === entry.id && "animate-spin"
                    )}
                  />
                  Retry
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Dismiss ${entry.file.name}`}
                  onClick={() => handleDismissFailure(entry.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((img, i) => (
            <div
              key={i}
              className="ring-border relative aspect-square overflow-hidden rounded-xl ring-1"
            >
              <Image
                src={img.thumbnailUrl}
                alt={`Portfolio ${i + 1}`}
                fill
                sizes="(max-width: 640px) 33vw, 200px"
                className="object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
          ))}
        </div>
      )}

      <GlassCard variant="ghost" className="p-5">
        <div className="flex items-start gap-3">
          <Lightbulb
            className="text-copper mt-0.5 h-4 w-4 shrink-0"
            aria-hidden
          />
          <div>
            <p className="text-sm font-medium">Photo tips</p>
            <ul className="text-muted-foreground marker:text-copper mt-2 list-disc space-y-1 pl-4 text-sm">
              <li>Well-lit photos showing the full garment</li>
              <li>Close-ups of detailed work and stitching</li>
              <li>Garments being worn, when possible</li>
              <li>Profiles with 3+ photos get 5× more inquiries</li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
