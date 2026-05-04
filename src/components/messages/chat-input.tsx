"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImagePlus, Loader2, Send, X } from "lucide-react";
import { useMutation } from "@apollo/client/react";
import { UPLOAD_REFERENCE_IMAGE } from "@/lib/graphql/mutations/order";
import type { UploadReferenceImageData } from "@/types/graphql";
import { toast } from "sonner";

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
    setText("");
    await onSend(body);
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
      <div className="border-t bg-background">
        <div className="relative mx-3 mt-3 inline-block">
          {/* Object-URL preview can't be served by next/image's optimiser. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pendingImage.previewUrl}
            alt="Preview"
            className="max-h-48 rounded-lg object-contain"
          />
          {uploading && (
            <div
              role="status"
              aria-live="polite"
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-black/50 text-white"
            >
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-xs font-medium">Uploading...</span>
            </div>
          )}
          {!uploading && (
            <Button
              variant="secondary"
              size="icon"
              aria-label="Remove attached image"
              className="absolute -right-2 -top-2 h-7 w-7 rounded-full shadow-md"
              onClick={handleCancelImage}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 p-3">
          <Input
            placeholder="Add a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className="flex-1"
            autoFocus
          />
          <Button
            type="button"
            size="icon"
            onClick={handleSendImage}
            disabled={disabled}
            title="Send photo"
            aria-label="Send photo"
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 border-t bg-background p-3">
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
      >
        <ImagePlus className="h-5 w-5" />
      </Button>

      <Input
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="flex-1"
      />

      <Button
        type="button"
        size="icon"
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        title="Send message"
        aria-label="Send message"
      >
        {sending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Send className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}
