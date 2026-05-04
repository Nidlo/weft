"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Chromium fires `beforeinstallprompt` with a custom event that exposes a
// `prompt()` method we can call later. The DOM lib types ship without it.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const DISMISSED_FLAG = "nidlo:pwa:install-dismissed";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // Safari iOS exposes a non-standard property when launched from home screen.
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

export function PwaInstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;

    let stored = false;
    try {
      stored = localStorage.getItem(DISMISSED_FLAG) === "1";
    } catch {
      // localStorage unavailable — treat as not dismissed.
    }
    setDismissed(stored);

    const handler = (e: Event) => {
      // Stop the browser's default mini-infobar; we'll surface our own.
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    const installedHandler = () => {
      setEvent(null);
      try {
        localStorage.setItem(DISMISSED_FLAG, "1");
      } catch {
        // Best-effort — non-fatal.
      }
    };
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!event) return;
    await event.prompt();
    const choice = await event.userChoice;
    setEvent(null);
    if (choice.outcome === "accepted" || choice.outcome === "dismissed") {
      try {
        localStorage.setItem(DISMISSED_FLAG, "1");
      } catch {
        // Best-effort — non-fatal.
      }
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISSED_FLAG, "1");
    } catch {
      // Best-effort — non-fatal.
    }
  };

  if (!event || dismissed) return null;

  return (
    <div
      className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-md items-center gap-3 rounded-xl border bg-background p-3 shadow-lg sm:bottom-4"
      role="region"
      aria-label="Install Nidlo"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Download className="h-5 w-5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">Install Nidlo</p>
        <p className="text-xs text-muted-foreground">
          Faster launch and push notifications.
        </p>
      </div>
      <Button size="sm" onClick={handleInstall}>
        Install
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Dismiss install prompt"
        className="h-8 w-8"
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
