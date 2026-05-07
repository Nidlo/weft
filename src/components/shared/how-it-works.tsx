import { Compass, Ruler, Sparkles } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { Section } from "@/components/ui/section";
import { ThreadDivider } from "@/components/ui/thread-divider";

const STEPS = [
  {
    icon: Compass,
    eyebrow: "01",
    title: "Find a designer",
    body: "Browse by craft, city, or rating. See real portfolios. If you'd rather meet in person, filter for designers near you and visit the shop.",
  },
  {
    icon: Ruler,
    eyebrow: "02",
    title: "Send measurements",
    body: "Type them in, copy them from a previous order, or scan with Fitscan, our in-house body-scan AI, for a more accurate fit.",
  },
  {
    icon: Sparkles,
    eyebrow: "03",
    title: "Track and receive",
    body: "Watch progress from sketch to delivery. Pay deposit and balance at the right moments. Receive the finished piece.",
  },
];

export function HowItWorks() {
  return (
    <Section
      density="loose"
      eyebrow="How it works"
      title="Three steps."
      description="A simple commission flow that works whether you're around the corner from your designer or on the other side of the world."
      centered
    >
      <ThreadDivider tone="copper" className="mb-12" />

      <div className="grid gap-6 md:grid-cols-3">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <GlassCard
              key={step.eyebrow}
              variant="solid"
              className="flex flex-col gap-4 p-6"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-display text-2xl font-semibold text-muted-foreground/70 tabular-nums">
                  {step.eyebrow}
                </span>
              </div>
              <h3 className="text-display text-2xl font-semibold tracking-tight">
                {step.title}
              </h3>
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </GlassCard>
          );
        })}
      </div>
    </Section>
  );
}
