"use client";

import Image from "next/image";
import { useCallback, useState, useRef } from "react";
import { useMutation } from "@apollo/client/react";
import { ImageIcon, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { useBlueprintStore, type ReferenceImage } from "@/lib/stores/blueprint";
import { UPLOAD_REFERENCE_IMAGE } from "@/lib/graphql/mutations/order";
import type { UploadReferenceImageData } from "@/types/graphql";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const MAX_IMAGES = 5;
const MAX_SIZE_MB = 10;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function StepReferenceImages() {
  const { referenceImages, setField } = useBlueprintStore();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadReferenceImage] =
    useMutation<UploadReferenceImageData>(UPLOAD_REFERENCE_IMAGE);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      const remaining = MAX_IMAGES - referenceImages.length;
      if (remaining <= 0) {
        toast.error(`Maximum ${MAX_IMAGES} images allowed.`);
        return;
      }

      const validFiles: File[] = [];

      for (let i = 0; i < Math.min(files.length, remaining); i++) {
        const file = files[i];

        if (!ACCEPTED_TYPES.includes(file.type)) {
          toast.error(`${file.name}: Only JPEG, PNG, and WebP are accepted.`);
          continue;
        }

        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          toast.error(`${file.name}: File exceeds ${MAX_SIZE_MB}MB limit.`);
          continue;
        }

        validFiles.push(file);
      }

      if (validFiles.length === 0) return;

      setUploading(true);
      const newImages: ReferenceImage[] = [];

      for (const file of validFiles) {
        try {
          const { data } = await uploadReferenceImage({
            variables: { file },
          });

          if (data?.uploadReferenceImage) {
            newImages.push({
              url: data.uploadReferenceImage.url,
              publicId: "",
              name: file.name,
            });
          }
        } catch {
          toast.error(`Failed to upload ${file.name}. Please try again.`);
        }
      }

      if (newImages.length > 0) {
        setField("referenceImages", [...referenceImages, ...newImages]);
      }
      setUploading(false);
    },
    [referenceImages, setField, uploadReferenceImage]
  );

  const handleRemove = (index: number) => {
    const updated = referenceImages.filter((_, i) => i !== index);
    setField("referenceImages", updated);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const isFull = referenceImages.length >= MAX_IMAGES;

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm">
          Reference images{" "}
          <span className="text-muted-foreground">(optional)</span>
        </Label>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload up to {MAX_IMAGES} images so the designer can see what you have
          in mind.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "relative flex min-h-32 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200",
          dragOver
            ? "border-copper bg-copper/5"
            : "border-border hover:border-foreground/30 hover:bg-card/40",
          isFull && "pointer-events-none opacity-60"
        )}
      >
        {uploading ? (
          <p className="text-sm font-medium text-muted-foreground">
            Uploading...
          </p>
        ) : (
          <>
            <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-foreground">
              <Upload className="h-5 w-5" aria-hidden />
            </span>
            <p className="mt-3 text-sm font-medium">
              Drag &amp; drop images, or pick from your device
            </p>
            <Button
              type="button"
              variant="luxe-outline"
              size="sm"
              className="mt-3"
              disabled={uploading || isFull}
              onClick={() => inputRef.current?.click()}
            >
              Choose files
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              multiple
              aria-label="Upload reference images"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              JPEG, PNG, WebP · max {MAX_SIZE_MB}MB each
            </p>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {referenceImages.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {referenceImages.map((img, i) => (
            <div
              key={i}
              className="group relative aspect-square overflow-hidden rounded-xl ring-1 ring-border"
            >
              <Image
                src={img.url}
                alt={img.name}
                fill
                sizes="(max-width: 640px) 33vw, 20vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                aria-label={`Remove ${img.name}`}
                className="absolute right-1.5 top-1.5 size-7 rounded-full bg-background/80 opacity-0 shadow-(--shadow-2) backdrop-blur transition-opacity group-hover:opacity-100"
                onClick={() => handleRemove(i)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        <ImageIcon className="h-3 w-3 text-copper" aria-hidden />
        <span className="tabular-nums text-foreground">
          {referenceImages.length}
        </span>
        <span>/ {MAX_IMAGES} images</span>
      </p>
    </div>
  );
}
