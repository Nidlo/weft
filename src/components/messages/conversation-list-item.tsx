"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { GqlConversation } from "@/types/graphql";
import { useAuthStore } from "@/lib/stores/auth";
import { getImageKitThumbnail } from "@/lib/utils/imagekit";
import { ImageIcon } from "lucide-react";

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
        latest.body.length > 50
          ? latest.body.substring(0, 50) + "..."
          : latest.body;
    }
  }

  return (
    <Link
      href={`/messages/${conversation.id}`}
      className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
    >
      <Avatar className="h-12 w-12 shrink-0">
        {other.avatarUrl && (
          <AvatarImage
            src={getImageKitThumbnail(other.avatarUrl, 100)}
            alt={other.fullName ?? ""}
          />
        )}
        <AvatarFallback>{getInitials(other.fullName)}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <span className="truncate font-medium">{other.fullName}</span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatRelativeTime(conversation.lastMessageAt)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm text-muted-foreground">
            {latest?.mediaUrl && !latest.body && (
              <ImageIcon className="mr-1 inline h-3.5 w-3.5" />
            )}
            {preview || "No messages yet"}
          </span>
          {conversation.unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="h-5 min-w-5 shrink-0 justify-center rounded-full px-1.5 text-xs"
            >
              {conversation.unreadCount}
            </Badge>
          )}
        </div>
        {garmentType && (
          <span className="mt-0.5 text-xs text-muted-foreground/70">
            Order — {garmentType}
          </span>
        )}
      </div>
    </Link>
  );
}
