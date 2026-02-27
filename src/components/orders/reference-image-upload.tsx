"use client";

import { useCallback, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { UPLOAD_REFERENCE_IMAGE } from "@/lib/graphql/mutations/order";
import type { UploadReferenceImageData } from "@/types/graphql";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

const MAX_IMAGES = 5;
const MAX_SIZE_MB = 10;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface ReferenceImageUploadProps {
  images: string[];
  onChange: (urls: string[]) => void;
}

export function ReferenceImageUpload({
  images,
  onChange,
}: ReferenceImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadMutation] = useMutation<UploadReferenceImageData>(
    UPLOAD_REFERENCE_IMAGE
  );

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      const remaining = MAX_IMAGES - images.length;
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
      const newUrls: string[] = [];

      for (const file of validFiles) {
        try {
          const { data } = await uploadMutation({ variables: { file } });
          if (data?.uploadReferenceImage) {
            newUrls.push(data.uploadReferenceImage.url);
          }
        } catch {
          toast.error(`Failed to upload ${file.name}.`);
        }
      }

      if (newUrls.length > 0) {
        onChange([...images, ...newUrls]);
      }
      setUploading(false);
    },
    [images, onChange, uploadMutation]
  );

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <div className="space-y-3">
      {/* Thumbnails */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {images.map((url, i) => (
            <div key={i} className="group relative aspect-square">
              <img
                src={url}
                alt={`Reference ${i + 1}`}
                className="h-full w-full rounded-lg object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-1 top-1 h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => handleRemove(i)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {images.length < MAX_IMAGES && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="flex min-h-[80px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-4 text-center transition-colors hover:border-primary/50"
        >
          {uploading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </div>
          ) : (
            <>
              <ImagePlus className="mb-1 h-5 w-5 text-muted-foreground" />
              <label className="cursor-pointer">
                <span className="text-sm font-medium text-primary underline">
                  Upload reference images
                </span>
                <input
                  type="file"
                  accept={ACCEPTED_TYPES.join(",")}
                  multiple
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </label>
              <p className="mt-1 text-xs text-muted-foreground">
                {images.length}/{MAX_IMAGES} — JPEG, PNG, WebP up to{" "}
                {MAX_SIZE_MB}MB
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
