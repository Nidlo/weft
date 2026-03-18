"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useClientOnboardingStore } from "@/lib/stores/client-onboarding";

const REFERRAL_OPTIONS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "friend", label: "A friend" },
  { value: "designer", label: "A designer" },
  { value: "search", label: "Google search" },
  { value: "other", label: "Other" },
];

export function StepFinish() {
  const { referralSource, termsAccepted, setField } =
    useClientOnboardingStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Almost done!</h2>
        <p className="text-sm text-muted-foreground">
          Just a couple more things before you start exploring designers.
        </p>
      </div>

      <div className="space-y-3">
        <Label>How did you hear about StitchHub?</Label>
        <div className="flex flex-wrap gap-2">
          {REFERRAL_OPTIONS.map((opt) => (
            <Badge
              key={opt.value}
              variant={referralSource === opt.value ? "default" : "outline"}
              className="cursor-pointer px-3 py-1.5 text-sm"
              onClick={() =>
                setField(
                  "referralSource",
                  referralSource === opt.value ? "" : opt.value
                )
              }
            >
              {opt.label}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-lg border p-4">
        <Checkbox
          id="terms"
          checked={termsAccepted}
          onCheckedChange={(checked) =>
            setField("termsAccepted", checked === true)
          }
          className="mt-0.5"
        />
        <label htmlFor="terms" className="cursor-pointer text-sm leading-relaxed">
          I agree to the{" "}
          <a
            href="/terms"
            target="_blank"
            className="text-primary underline underline-offset-2"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            target="_blank"
            className="text-primary underline underline-offset-2"
          >
            Privacy Policy
          </a>
        </label>
      </div>
    </div>
  );
}
