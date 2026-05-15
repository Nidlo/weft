"use client";

import Link from "next/link";
import { ImageIcon, Package } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/lib/stores/auth";
import { getImageKitThumbnail } from "@/lib/utils/imagekit";
import { cn } from "@/lib/utils";
import type { GqlConversation } from "@/types/graphql";

function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface ConversationListItemProps {
  conversation: GqlConversation;
}

export function ConversationListItem({
  conversation,
}: ConversationListItemProps) {
  const userId = useAuthStore((s) => s.user?.id);
  const other =
    conversation.designerId === userId
      ? conversation.client
      : conversation.designer;

  const latest = conversation.latestMessage;
  const garmentType = (
    conversation.order.blueprint as Record<string, unknown> | null
  )?.garment_type as string | undefined;

  let preview = "";
  if (latest) {
    if (latest.mediaUrl && !latest.body) {
      preview = "Sent a photo";
    } else if (latest.body) {
      preview =
        latest.body.length > 60
          ? latest.body.substring(0, 60) + "..."
          : latest.body;
    }
  }

  const isUnread = conversation.unreadCount > 0;

  return (
    <Link
      href={`/messages/${conversation.id}`}
      className={cn(
        "group flex items-center gap-3 px-4 py-3.5 transition-colors duration-200",
        "hover:bg-card focus-visible:bg-card focus-visible:outline-none"
      )}
    >
      <Avatar className="ring-border size-12 shrink-0 ring-1">
        {other.avatarUrl && (
          <AvatarImage
            src={getImageKitThumbnail(other.avatarUrl, 100)}
            alt={other.fullName ?? ""}
          />
        )}
        <AvatarFallback className="bg-secondary font-medium">
          {getInitials(other.fullName)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "truncate text-sm tracking-tight",
              isUnread
                ? "text-foreground font-semibold"
                : "text-foreground/90 font-medium"
            )}
          >
            {other.fullName}
          </span>
          <span
            className={cn(
              "shrink-0 text-[11px] font-medium tabular-nums",
              isUnread ? "text-copper" : "text-muted-foreground"
            )}
          >
            {formatRelativeTime(conversation.lastMessageAt)}
          </span>
        </div>

        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span
            className={cn(
              "flex min-w-0 items-center gap-1 truncate text-sm",
              isUnread ? "text-foreground/85" : "text-muted-foreground"
            )}
          >
            {latest?.mediaUrl && !latest.body && (
              <ImageIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
            )}
            <span className="truncate">{preview || "No messages yet"}</span>
          </span>
          {isUnread && (
            <span className="bg-copper text-foreground ring-card inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold tabular-nums ring-2">
              {conversation.unreadCount}
            </span>
          )}
        </div>

        {garmentType && (
          <span className="text-muted-foreground/80 mt-1 inline-flex items-center gap-1 text-[11px] tracking-[0.14em] uppercase">
            <Package className="text-copper h-3 w-3" aria-hidden />
            <span className="capitalize">{garmentType.replace(/_/g, " ")}</span>
          </span>
        )}
      </div>
    </Link>
  );
}
