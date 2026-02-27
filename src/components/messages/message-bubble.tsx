"use client";

import { cn } from "@/lib/utils";
import { getImageKitThumbnail } from "@/lib/utils/imagekit";
import { linkify } from "@/lib/utils/linkify";
import type { GqlMessage } from "@/types/graphql";
import { Check, CheckCheck } from "lucide-react";
import { useState } from "react";
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
            // Rounded corners with tail on last message of group
            isGroupTail
              ? isOwn
                ? "rounded-2xl rounded-br-sm"
                : "rounded-2xl rounded-bl-sm"
              : "rounded-2xl",
            // Padding varies for media-only vs text
            isMediaOnly ? "p-1" : "px-3 py-1.5",
            // Colors
            isOwn
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          )}
        >
          {hasMedia && (
            <button
              type="button"
              className={cn(
                "block overflow-hidden rounded-xl",
                hasBody && "mb-1"
              )}
              onClick={() => setLightboxOpen(true)}
            >
              <img
                src={getImageKitThumbnail(message.mediaUrl!, 400)}
                alt="Photo message"
                className="max-w-[220px] rounded-xl"
                loading="lazy"
              />
            </button>
          )}

          {hasBody && (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {linkify(
                message.body!,
                cn(
                  "underline break-all",
                  isOwn
                    ? "text-primary-foreground/90 hover:text-primary-foreground"
                    : "text-foreground/90 hover:text-foreground"
                )
              )}
            </p>
          )}

          {/* Timestamp + read receipt */}
          <div
            className={cn(
              "flex items-center gap-1",
              isOwn ? "justify-end" : "justify-start",
              hasBody ? "-mb-0.5 mt-0.5" : "mt-1 px-1"
            )}
          >
            <span
              className={cn(
                "text-[10px] leading-none",
                isOwn
                  ? "text-primary-foreground/60"
                  : "text-muted-foreground"
              )}
            >
              {formatTime(message.createdAt)}
            </span>
            {isOwn && showReadReceipt && (
              <span
                className={cn(
                  message.readAt
                    ? "text-blue-300"
                    : "text-primary-foreground/60"
                )}
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

      {hasMedia && lightboxOpen && (
        <MessageLightbox
          src={message.mediaUrl!}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
