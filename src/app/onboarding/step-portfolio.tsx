"use client";

import Image from "next/image";
import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertCircle, RefreshCw, X } from "lucide-react";
import { useAddPortfolioImage } from "@/lib/hooks/use-profile-mutations";

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
  const inputRef = useRef<HTMLInputElement>(null);
  const { addImage } = useAddPortfolioImage();

  const uploadOne = useCallback(
    async (file: File): Promise<{ ok: true } | { ok: false; reason: string }> => {
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
        // Reset the input so the same file can be re-selected if it failed.
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
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium">Portfolio Images</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload photos of your best work to attract clients ({images.length}/
          {MAX_IMAGES}).
        </p>
      </div>

      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/50"
      >
        <svg
          className="mx-auto h-10 w-10 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 16v-8m0 0l-3 3m3-3l3 3M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="mt-2 text-sm text-muted-foreground">
          Drag & drop images here, or
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          disabled={uploading || images.length >= MAX_IMAGES}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Uploading..." : "Choose Files"}
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
        <p className="mt-1 text-xs text-muted-foreground">
          JPEG, PNG, or WebP. Max 10MB each.
        </p>
      </div>

      {/* Failed uploads — persistent, with retry */}
      {failed.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-status-error-fg">
            {failed.length} upload{failed.length === 1 ? "" : "s"} failed
          </p>
          <ul className="space-y-2">
            {failed.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center gap-3 rounded-lg border border-status-error-soft bg-status-error-soft/40 p-3"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-status-error" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {entry.file.name}
                  </p>
                  <p className="text-xs text-status-error-fg">{entry.reason}</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRetry(entry)}
                  disabled={retrying === entry.id}
                >
                  <RefreshCw
                    className={`mr-1 h-3 w-3 ${
                      retrying === entry.id ? "animate-spin" : ""
                    }`}
                  />
                  Retry
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Dismiss ${entry.file.name}`}
                  className="h-8 w-8"
                  onClick={() => handleDismissFailure(entry.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, i) => (
            <div
              key={i}
              className="relative aspect-square overflow-hidden rounded-md"
            >
              <Image
                src={img.thumbnailUrl}
                alt={`Portfolio ${i + 1}`}
                fill
                sizes="(max-width: 640px) 33vw, 200px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <PortfolioTips />
    </div>
  );
}

function PortfolioTips() {
  return (
    <div className="rounded-lg border border-border bg-muted/50 p-4">
      <p className="text-sm font-medium">Photo tips</p>
      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
        <li>Use well-lit photos showing the full garment</li>
        <li>Include close-ups of detailed work and stitching</li>
        <li>Show garments being worn when possible</li>
        <li>Profiles with 3+ photos get 5x more inquiries</li>
      </ul>
    </div>
  );
}
