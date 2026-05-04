"use client";

import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface MessageLightboxProps {
  src: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MessageLightbox({ src, open, onOpenChange }: MessageLightboxProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] border-0 bg-transparent p-0 shadow-none"
        showCloseButton
      >
        <DialogTitle className="sr-only">Photo</DialogTitle>
        <Image
          src={src}
          alt="Full-size photo"
          width={1600}
          height={1600}
          sizes="95vw"
          className="mx-auto h-auto max-h-[90vh] w-auto max-w-full rounded-lg object-contain"
        />
      </DialogContent>
    </Dialog>
  );
}
