"use client";

import { useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";

const MAX_PHOTOS = 3;
const MAX_SIZE_MB = 10;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface ReviewPhotoUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
}

export function ReviewPhotoUpload({ files, onChange }: ReviewPhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (selected: FileList | null) => {
      if (!selected) return;

      const newFiles: File[] = [];
      for (const file of Array.from(selected)) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          toast.error(`${file.name} is not a supported image format.`);
          continue;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          toast.error(`${file.name} exceeds ${MAX_SIZE_MB}MB limit.`);
          continue;
        }
        newFiles.push(file);
      }

      const combined = [...files, ...newFiles].slice(0, MAX_PHOTOS);
      if (files.length + newFiles.length > MAX_PHOTOS) {
        toast.error(`Maximum ${MAX_PHOTOS} photos allowed.`);
      }
      onChange(combined);
    },
    [files, onChange]
  );

  const handleRemove = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 overflow-x-auto">
        {files.map((file, i) => (
          <div
            key={i}
            className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-lg"
          >
            {/* Local File preview via createObjectURL - unoptimisable by next/image. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={URL.createObjectURL(file)}
              alt={`Photo ${i + 1}`}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(i)}
              className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {files.length < MAX_PHOTOS && (
          <Button
            type="button"
            variant="outline"
            className="h-20 w-20 shrink-0"
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus className="text-muted-foreground h-5 w-5" />
          </Button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <p className="text-muted-foreground text-xs">
        {files.length}/{MAX_PHOTOS} photos (optional)
      </p>
    </div>
  );
}
