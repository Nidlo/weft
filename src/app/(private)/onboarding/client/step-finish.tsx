"use client";

import { Check, PartyPopper } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { GlassCard } from "@/components/ui/glass-card";
import { useClientOnboardingStore } from "@/lib/stores/client-onboarding";
import { cn } from "@/lib/utils";

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
    <div className="space-y-7">
      <div className="flex items-start gap-3">
        <span className="bg-secondary text-foreground flex size-9 shrink-0 items-center justify-center rounded-xl">
          <PartyPopper className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <h2 className="text-display text-lg font-semibold tracking-tight">
            Almost there.
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            One last thing - help us understand how you discovered Nidlo, and
            agree to our terms.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm">How did you hear about us?</Label>
        <div className="flex flex-wrap gap-2">
          {REFERRAL_OPTIONS.map((opt) => {
            const isActive = referralSource === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setField("referralSource", isActive ? "" : opt.value)
                }
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium",
                  "transition-all duration-200 hover:-translate-y-0.5",
                  isActive
                    ? "bg-foreground text-background shadow-(--shadow-2)"
                    : "border-border bg-card hover:border-foreground/30 border"
                )}
              >
                {isActive && <Check className="h-3 w-3" aria-hidden />}
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <GlassCard variant="ghost" className="flex items-start gap-3 p-4">
        <Checkbox
          id="terms"
          checked={termsAccepted}
          onCheckedChange={(checked) =>
            setField("termsAccepted", checked === true)
          }
          className="mt-0.5"
        />
        <label
          htmlFor="terms"
          className="text-foreground/90 cursor-pointer text-sm leading-relaxed"
        >
          I agree to the{" "}
          <a
            href="/terms"
            target="_blank"
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            target="_blank"
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            Privacy Policy
          </a>
          .
        </label>
      </GlassCard>
    </div>
  );
}
