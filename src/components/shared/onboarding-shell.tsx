"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

interface OnboardingShellProps {
  eyebrow: string;
  title: string;
  steps: readonly string[];
  step: number;
  /** The currently-rendered step content. Wrapped in AnimatePresence — pass a stable `key` per step. */
  children: React.ReactNode;
  onBack: () => void;
  onNext: () => void;
  onComplete: () => void;
  /** Optional skip handler — when present, a Skip button is rendered. */
  onSkip?: () => void;
  /** Disables the Next/Complete button. */
  canProceed: boolean;
  /** True while the final mutation is in flight. */
  saving?: boolean;
  /** Override the final button label (e.g. "Get started", "Complete setup"). */
  completeLabel?: string;
}

/**
 * Shared chrome for both onboarding wizards (designer + client).
 *
 *  - Editorial header (eyebrow → display title → live step caption)
 *  - Animated step indicator: numbered chips with a copper thread that
 *    "stitches" forward as the user advances. Done steps show a check.
 *  - AnimatePresence-wrapped content slot so steps slide in/out cleanly.
 *  - Glass action bar with Back / Skip / Continue (or Complete).
 *
 *  Wizards keep their own state + mutation logic; this component is
 *  presentational only.
 */
export function OnboardingShell({
  eyebrow,
  title,
  steps,
  step,
  children,
  onBack,
  onNext,
  onComplete,
  onSkip,
  canProceed,
  saving = false,
  completeLabel = "Complete setup",
}: OnboardingShellProps) {
  const reduced = useReducedMotion();
  const isLastStep = step === steps.length - 1;
  const isFirstStep = step === 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
      <header className="mb-8 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">
          {eyebrow}
        </p>
        <h1 className="text-display mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Step {step + 1} of {steps.length} ·{" "}
          <span className="font-medium text-foreground">{steps[step]}</span>
        </p>
      </header>

      <StepIndicator steps={steps} step={step} />

      <GlassCard variant="solid" className="mt-8 p-6 sm:p-8">
        <div className="min-h-[420px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={reduced ? false : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-border/60 pt-6">
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={onBack}
            disabled={isFirstStep || saving}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back
          </Button>

          <div className="flex items-center gap-2">
            {onSkip && !isLastStep && (
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={onSkip}
                disabled={saving}
              >
                Skip
              </Button>
            )}
            {isLastStep ? (
              <Button
                type="button"
                variant="luxe"
                size="lg"
                onClick={onComplete}
                disabled={!canProceed || saving}
                className="gap-1.5"
              >
                {saving ? "Saving..." : completeLabel}
                {!saving && <Check className="h-4 w-4" aria-hidden />}
              </Button>
            ) : (
              <Button
                type="button"
                variant="luxe"
                size="lg"
                onClick={onNext}
                disabled={!canProceed}
                className="gap-1.5"
              >
                Continue
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

interface StepIndicatorProps {
  steps: readonly string[];
  step: number;
}

/**
 * Numbered chip row + animated thread connector. The connector's
 * `width` snaps to the appropriate fraction whenever `step` changes,
 * giving the user a clear sense of progress.
 */
function StepIndicator({ steps, step }: StepIndicatorProps) {
  const reduced = useReducedMotion();
  const fillPct =
    steps.length > 1 ? (step / (steps.length - 1)) * 100 : 0;

  return (
    <div className="relative" aria-label={`Progress: step ${step + 1} of ${steps.length}`}>
      {/* Background thread */}
      <div
        className="absolute left-0 right-0 top-4 h-px bg-border"
        aria-hidden
      />
      {/* Animated copper thread that grows with progress */}
      <motion.div
        className="absolute left-0 top-4 h-px bg-copper"
        initial={false}
        animate={{ width: `${fillPct}%` }}
        transition={
          reduced
            ? { duration: 0 }
            : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
        }
        aria-hidden
      />

      <ol className="relative flex items-start justify-between">
        {steps.map((label, i) => {
          const state =
            i < step ? "done" : i === step ? "active" : "upcoming";
          return (
            <li
              key={label}
              className="flex flex-col items-center gap-2"
              aria-current={state === "active" ? "step" : undefined}
            >
              <motion.span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-xs font-semibold tabular-nums ring-2 ring-background",
                  state === "done" &&
                    "bg-copper text-background",
                  state === "active" &&
                    "bg-foreground text-background shadow-(--shadow-glow)",
                  state === "upcoming" &&
                    "bg-card text-muted-foreground border border-border"
                )}
                initial={false}
                animate={
                  reduced || state !== "active"
                    ? { scale: 1 }
                    : { scale: [1, 1.08, 1] }
                }
                transition={{ duration: 0.45 }}
              >
                {state === "done" ? (
                  <Check className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  i + 1
                )}
              </motion.span>
              <span
                className={cn(
                  "max-w-20 truncate text-center text-[11px] font-medium uppercase tracking-[0.12em]",
                  state === "active"
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
