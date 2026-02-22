"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAddPortfolioImage } from "@/lib/hooks/use-profile-mutations";

interface UploadedImage {
  url: string;
  thumbnailUrl: string;
}

const MAX_IMAGES = 20;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function StepPortfolio() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addImage } = useAddPortfolioImage();

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const remaining = MAX_IMAGES - images.length;
      const toUpload = Array.from(files).slice(0, remaining);

      if (toUpload.length === 0) {
        toast.error(`Maximum ${MAX_IMAGES} images allowed`);
        return;
      }

      for (const file of toUpload) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          toast.error(`${file.name}: Only JPEG, PNG, and WebP are accepted`);
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name}: File exceeds 10MB limit`);
          continue;
        }

        setUploading(true);
        try {
          const result = await addImage(file);
          if (result?.portfolioImages) {
            const latest =
              result.portfolioImages[result.portfolioImages.length - 1];
            setImages((prev) => [
              ...prev,
              {
                url: latest.url,
                thumbnailUrl: latest.thumbnail_url,
              },
            ]);
          }
        } catch {
          toast.error(`Failed to upload ${file.name}`);
        } finally {
          setUploading(false);
        }
      }

      // Reset the input
      if (inputRef.current) inputRef.current.value = "";
    },
    [images.length, addImage]
  );

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

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, i) => (
            <div
              key={i}
              className="relative aspect-square overflow-hidden rounded-md"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.thumbnailUrl}
                alt={`Portfolio ${i + 1}`}
                className="h-full w-full object-cover"
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
