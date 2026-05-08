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
 * Consent gate for the body-scan measurement-validation pass. When the
 * user opts in, the photo is sent to our AI partner to sanity-check the
 * measurements our own pipeline extracted. The user-facing copy stays
 * vendor-neutral on purpose; the privacy policy is the place that names
 * the third parties involved.
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
            Use AI to double-check your measurements?
          </DialogTitle>
          <DialogDescription className="text-center">
            With your permission, we&apos;ll send your front photo to our AI
            assistant for a quick second look. It&apos;s used once for this
            check and is not kept or used to train any model.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-sm">
          <ul className="list-inside list-disc space-y-1.5 text-muted-foreground">
            <li>Used only for this measurement check. No ads. No resale.</li>
            <li>You can switch this off any time in Settings.</li>
            <li>
              Style suggestions on your profile use only your saved
              measurements and interests, never your photo.
            </li>
          </ul>

          <div className="flex items-start gap-2 rounded-lg border bg-muted/40 p-3">
            <Checkbox
              id="ai-consent"
              checked={agreed}
              onCheckedChange={(v) => setAgreed(v === true)}
              className="mt-0.5"
            />
            <Label
              htmlFor="ai-consent"
              className="text-xs font-normal leading-relaxed"
            >
              I&apos;m happy for Nidlo to use this single photo with our AI
              assistant for measurement checking. I&apos;ve read the{" "}
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
            {saving ? "Saving..." : "Accept and continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
