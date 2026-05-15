"use client";

import Image from "next/image";
import { useState } from "react";
import { Check, CheckCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { getImageKitThumbnail } from "@/lib/utils/imagekit";
import { linkify } from "@/lib/utils/linkify";
import type { GqlMessage } from "@/types/graphql";
import { MessageLightbox } from "./message-lightbox";

interface MessageBubbleProps {
  message: GqlMessage;
  isOwn: boolean;
  showReadReceipt?: boolean;
  /** Whether this message is the last in a consecutive group from the same sender */
  isGroupTail?: boolean;
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageBubble({
  message,
  isOwn,
  showReadReceipt,
  isGroupTail = true,
}: MessageBubbleProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const hasMedia = !!message.mediaUrl;
  const hasBody = !!message.body;
  const isMediaOnly = hasMedia && !hasBody;

  return (
    <>
      <div
        className={cn(
          "flex max-w-[80%]",
          isOwn ? "ml-auto justify-end" : "mr-auto justify-start",
          !isGroupTail && "mb-0.5"
        )}
      >
        <div
          className={cn(
            "relative overflow-hidden",
            // Rounded corners with subtle tail on the last message of a group
            isGroupTail
              ? isOwn
                ? "rounded-2xl rounded-br-md"
                : "rounded-2xl rounded-bl-md"
              : "rounded-2xl",
            // Padding varies for media-only vs text
            isMediaOnly ? "p-1" : "px-3.5 py-2",
            // Surfaces: own bubble = ink, theirs = soft secondary chip
            isOwn
              ? "bg-foreground text-background shadow-(--shadow-1)"
              : "bg-secondary text-foreground ring-border/50 ring-1"
          )}
        >
          {hasMedia && (
            <button
              type="button"
              aria-label="View photo full size"
              className={cn(
                "block overflow-hidden rounded-xl",
                hasBody && "mb-1.5"
              )}
              onClick={() => setLightboxOpen(true)}
            >
              <Image
                src={getImageKitThumbnail(message.mediaUrl!, 400)}
                alt="Photo message"
                width={220}
                height={220}
                sizes="220px"
                className="h-auto max-w-[220px] rounded-xl"
              />
            </button>
          )}

          {hasBody && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {linkify(
                message.body!,
                cn(
                  "break-all underline underline-offset-2",
                  isOwn
                    ? "text-background/80 hover:text-background"
                    : "text-foreground/80 hover:text-foreground decoration-copper"
                )
              )}
            </p>
          )}

          {/* Timestamp + read receipt */}
          <div
            className={cn(
              "flex items-center gap-1",
              isOwn ? "justify-end" : "justify-start",
              hasBody ? "mt-1 -mb-0.5" : "mt-1.5 px-1"
            )}
          >
            <span
              className={cn(
                "text-[10px] leading-none font-medium tabular-nums",
                isOwn ? "text-background/55" : "text-muted-foreground"
              )}
            >
              {formatTime(message.createdAt)}
            </span>
            {isOwn && showReadReceipt && (
              <span
                className={cn(
                  message.readAt ? "text-copper" : "text-background/50"
                )}
                aria-label={message.readAt ? "Read" : "Sent"}
              >
                {message.readAt ? (
                  <CheckCheck className="h-3.5 w-3.5" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {hasMedia && (
        <MessageLightbox
          src={message.mediaUrl!}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
        />
      )}
    </>
  );
}
