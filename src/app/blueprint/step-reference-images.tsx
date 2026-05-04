"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { useBlueprintStore, type ReferenceImage } from "@/lib/stores/blueprint";
import { useMutation } from "@apollo/client/react";
import { UPLOAD_REFERENCE_IMAGE } from "@/lib/graphql/mutations/order";
import type { UploadReferenceImageData } from "@/types/graphql";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const MAX_IMAGES = 5;
const MAX_SIZE_MB = 10;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function StepReferenceImages() {
  const { referenceImages, setField } = useBlueprintStore();
  const [uploading, setUploading] = useState(false);
  const [uploadReferenceImage] = useMutation<UploadReferenceImageData>(UPLOAD_REFERENCE_IMAGE);

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
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <div className="space-y-6">
      <div>
        <Label className="mb-2 block text-base font-semibold">
          Reference Images (optional)
        </Label>
        <p className="text-sm text-muted-foreground">
          Upload up to {MAX_IMAGES} images to show the designer what you have in mind.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="flex min-h-[120px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary/50"
      >
        {uploading ? (
          <p className="text-sm text-muted-foreground">Uploading...</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Drag & drop images here, or
            </p>
            <label className="mt-2 cursor-pointer">
              <span className="text-sm font-medium text-primary underline">
                browse files
              </span>
              <input
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </label>
            <p className="mt-2 text-xs text-muted-foreground">
              JPEG, PNG, WebP — Max {MAX_SIZE_MB}MB each
            </p>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {referenceImages.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {referenceImages.map((img, i) => (
            <div
              key={i}
              className="group relative aspect-square overflow-hidden rounded-lg"
            >
              <Image
                src={img.url}
                alt={img.name}
                fill
                sizes="(max-width: 640px) 33vw, 20vw"
                className="object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute right-1 top-1 h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => handleRemove(i)}
              >
                &times;
              </Button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {referenceImages.length} / {MAX_IMAGES} images
      </p>
    </div>
  );
}
