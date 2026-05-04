"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface AnthropicConsentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => Promise<void> | void;
  onDecline?: () => void;
  saving?: boolean;
}

/**
 * Consent gate before forwarding the user's body-scan photo to Anthropic for
 * style classification + garment recommendations. Required by FS-NIDLO-MEAS-03.
 * The acceptance handler should persist `anthropic_consent_at` on the user
 * profile so we don't ask again on every scan.
 */
export function AnthropicConsentDialog({
  open,
  onOpenChange,
  onAccept,
  onDecline,
  saving = false,
}: AnthropicConsentDialogProps) {
  const [agreed, setAgreed] = useState(false);

  const handleAccept = async () => {
    if (!agreed) return;
    await onAccept();
  };

  const handleDecline = () => {
    setAgreed(false);
    onOpenChange(false);
    onDecline?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-status-info-soft">
            <ShieldCheck className="h-6 w-6 text-status-info" />
          </div>
          <DialogTitle className="text-center">
            Forward your photo for style help?
          </DialogTitle>
          <DialogDescription className="text-center">
            To suggest cuts, fabrics, and silhouettes that flatter your shape,
            we send your front photo to Anthropic&apos;s Claude. Your photo is
            used once for the analysis and not retained for training.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-sm">
          <ul className="list-inside list-disc space-y-1.5 text-muted-foreground">
            <li>The photo never leaves the request — no advertising, no resale.</li>
            <li>You can withdraw consent any time from Settings.</li>
            <li>
              Measurements stay computed in our own service. This step is
              <em> only</em> for style suggestions.
            </li>
          </ul>

          <div className="flex items-start gap-2 rounded-lg border bg-muted/40 p-3">
            <Checkbox
              id="anthropic-consent"
              checked={agreed}
              onCheckedChange={(v) => setAgreed(v === true)}
              className="mt-0.5"
            />
            <Label
              htmlFor="anthropic-consent"
              className="text-xs font-normal leading-relaxed"
            >
              I&apos;m happy for Nidlo to send this single photo to Anthropic
              for style analysis. I&apos;ve read the{" "}
              <a
                href="/privacy"
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                privacy policy
              </a>
              .
            </Label>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={handleDecline} disabled={saving}>
            No thanks
          </Button>
          <Button onClick={handleAccept} disabled={!agreed || saving}>
            {saving ? "Saving..." : "Accept & continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
