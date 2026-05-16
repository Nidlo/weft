"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface LightboxImage {
  url: string;
  caption?: string | null;
}

interface ImageLightboxProps {
  images: LightboxImage[];
  /** The image to show. `null` = closed. */
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

/**
 * Full-screen in-app image viewer. Replaces the old per-surface pattern
 * of wrapping thumbnails in `<a href={rawUrl} target="_blank">`, which on
 * mobile DOWNLOADS the file (and signals "take this image") instead of
 * letting the client just look at it. There is deliberately NO download
 * affordance and no anchor to the raw file -- you cannot truly stop an OS
 * "save image", but we don't hand it to them, and the work isn't a
 * one-tap download. Swipe (touch) / arrow keys / on-screen buttons cycle
 * the set; Esc, the close button, or the backdrop exits.
 */
export function ImageLightbox({
  images,
  index,
  onIndexChange,
  onClose,
}: ImageLightboxProps) {
  const reduced = useReducedMotion();
  const open = index !== null && images.length > 0;
  const safeIndex = index ?? 0;
  const total = images.length;

  const go = React.useCallback(
    (delta: number) => {
      if (total === 0) return;
      onIndexChange((safeIndex + delta + total) % total);
    },
    [safeIndex, total, onIndexChange]
  );

  // Arrow-key navigation while open. Esc/backdrop are handled by Radix
  // Dialog's onOpenChange.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  if (!open) return null;

  const current = images[safeIndex];
  if (!current) return null;

  const caption = current.caption ?? undefined;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent
        className="max-w-4xl overflow-hidden p-0"
        aria-describedby={undefined}
      >
        {/* Radix requires a title for a11y; the image is the content so
            the title is screen-reader-only. */}
        <DialogTitle className="sr-only">
          {caption || `Image ${safeIndex + 1} of ${total}`}
        </DialogTitle>

        <div className="bg-card">
          <motion.div
            key={safeIndex}
            className="relative w-full touch-pan-y select-none"
            drag={total > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={(_, info) => {
              const threshold = 80;
              if (info.offset.x <= -threshold) go(1);
              else if (info.offset.x >= threshold) go(-1);
            }}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0 : 0.18 }}
          >
            <Image
              src={current.url}
              alt={caption || `Image ${safeIndex + 1} of ${total}`}
              width={1200}
              height={1200}
              sizes="(max-width: 768px) 100vw, 768px"
              draggable={false}
              className="pointer-events-none h-auto max-h-[80vh] w-full object-contain"
              priority
            />
          </motion.div>

          {caption && (
            <p className="border-border/60 text-foreground/80 border-t px-5 pt-4 text-sm">
              {caption}
            </p>
          )}

          {total > 1 && (
            <div
              className={cn(
                "border-border/60 flex items-center justify-between gap-3 border-t p-4"
              )}
            >
              <Button
                type="button"
                variant="luxe-outline"
                size="sm"
                onClick={() => go(-1)}
                aria-label="Previous image"
                className="gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                Previous
              </Button>
              <span className="text-muted-foreground text-xs font-medium tabular-nums">
                <span className="text-foreground">{safeIndex + 1}</span> /{" "}
                {total}
              </span>
              <Button
                type="button"
                variant="luxe-outline"
                size="sm"
                onClick={() => go(1)}
                aria-label="Next image"
                className="gap-1"
              >
                Next
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
