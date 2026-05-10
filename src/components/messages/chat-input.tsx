"use client";

import { useRef, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { ImagePlus, Loader2, Send, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UPLOAD_REFERENCE_IMAGE } from "@/lib/graphql/mutations/order";
import type { UploadReferenceImageData } from "@/types/graphql";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface ChatInputProps {
  onSend: (body?: string, mediaUrl?: string) => Promise<void>;
  sending?: boolean;
}

export function ChatInput({ onSend, sending }: ChatInputProps) {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pendingImage, setPendingImage] = useState<{
    file: File;
    previewUrl: string;
  } | null>(null);
  const [caption, setCaption] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [uploadImage] = useMutation<UploadReferenceImageData>(
    UPLOAD_REFERENCE_IMAGE
  );

  const handleSend = async () => {
    const body = text.trim();
    if (!body) return;
    // Clear optimistically, but restore + toast on failure so the user
    // doesn't silently lose a typed message when the network drops.
    setText("");
    try {
      await onSend(body);
    } catch {
      setText(body);
      toast.error("Couldn't send your message. Please try again.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (pendingImage) {
        handleSendImage();
      } else {
        handleSend();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be under 5MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPendingImage({ file, previewUrl });
    setCaption("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleCancelImage = () => {
    if (pendingImage) {
      URL.revokeObjectURL(pendingImage.previewUrl);
    }
    setPendingImage(null);
    setCaption("");
  };

  const handleSendImage = async () => {
    if (!pendingImage) return;

    setUploading(true);
    try {
      const result = await uploadImage({
        variables: { file: pendingImage.file },
      });
      const url = result.data?.uploadReferenceImage.url;
      if (url) {
        await onSend(caption.trim() || undefined, url);
      }
    } catch {
      toast.error("Failed to upload image.");
    } finally {
      setUploading(false);
      handleCancelImage();
    }
  };

  const disabled = sending || uploading;

  // Image preview mode — Telegram-style preview with caption input
  if (pendingImage) {
    return (
      <div className="border-border/60 bg-background/70 supports-backdrop-filter:bg-background/55 border-t backdrop-blur-xl backdrop-saturate-150">
        <div className="px-3 pt-3 sm:px-4">
          <div className="relative inline-block">
            {/* Object-URL preview can't be served by next/image's optimiser. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pendingImage.previewUrl}
              alt="Preview"
              className="ring-border max-h-48 rounded-2xl object-contain ring-1"
            />
            {uploading && (
              <div
                role="status"
                aria-live="polite"
                className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-black/55 text-white backdrop-blur-sm"
              >
                <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
                <span className="text-[11px] font-semibold tracking-[0.16em] uppercase">
                  Uploading...
                </span>
              </div>
            )}
            {!uploading && (
              <Button
                variant="secondary"
                size="icon-sm"
                aria-label="Remove attached image"
                className="ring-background absolute -top-2 -right-2 size-7 rounded-full shadow-(--shadow-2) ring-2"
                onClick={handleCancelImage}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 sm:p-4">
          <Input
            placeholder="Add a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className="bg-card h-11 flex-1 rounded-full px-4"
            autoFocus
          />
          <SendButton
            disabled={disabled}
            loading={uploading}
            onClick={handleSendImage}
            ready
            label="Send photo"
          />
        </div>
      </div>
    );
  }

  const isReady = text.trim().length > 0 && !disabled;

  return (
    <div className="border-border/60 bg-background/70 supports-backdrop-filter:bg-background/55 flex items-center gap-2 border-t p-3 backdrop-blur-xl backdrop-saturate-150 sm:p-4">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => fileRef.current?.click()}
        disabled={disabled}
        title="Attach photo"
        aria-label="Attach photo"
        className="text-muted-foreground hover:text-copper shrink-0"
      >
        <ImagePlus className="h-5 w-5" />
      </Button>

      <Input
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="bg-card h-11 flex-1 rounded-full px-4"
      />

      <SendButton
        disabled={disabled || !text.trim()}
        loading={!!sending}
        onClick={handleSend}
        ready={isReady}
        label="Send message"
      />
    </div>
  );
}

interface SendButtonProps {
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
  ready: boolean;
  label: string;
}

/**
 * The send affordance toggles between a muted `bg-secondary` ghost when
 * empty/disabled and a solid ink chip with a copper glow when there's
 * actually something to send. The state change reads as deliberate intent.
 */
function SendButton({
  disabled,
  loading,
  onClick,
  ready,
  label,
}: SendButtonProps) {
  return (
    <Button
      type="button"
      size="icon"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn(
        "shrink-0 rounded-full transition-all duration-200",
        ready
          ? "bg-foreground text-background hover:bg-foreground/90 shadow-(--shadow-glow)"
          : "bg-secondary text-muted-foreground hover:bg-secondary"
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Send className="h-4 w-4" />
      )}
    </Button>
  );
}
