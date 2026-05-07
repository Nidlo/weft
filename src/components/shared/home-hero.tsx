"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "motion/react";

import { HeroCta } from "@/components/shared/hero-cta";
import { cn } from "@/lib/utils";

// Lazy-load the lookbook so the heavy marquee + motion machinery aren't
// in the home page's initial bundle (matters on mobile) and don't fire on
// viewports that hide it (lg:block-only).
const AuthLookbook = dynamic(
  () =>
    import("@/components/shared/auth-lookbook").then((m) => ({
      default: m.AuthLookbook,
    })),
  { ssr: false, loading: () => null },
);

/**
 * Home hero. Copy is global: the platform is for designers and clients
 * anywhere, with Ghana as the launch market rather than the only market.
 *
 * Layout intentionally splits at lg: a copy column on the left, a slow
 * lookbook marquee on the right. The marquee is hidden on small screens
 * (where the copy carries the page) so mobile loads stay fast.
 */
export function HomeHero() {
  const reduced = useReducedMotion();

  return (
    <section
      className={cn(
        "relative overflow-hidden",
        "bg-thread-mesh",
        "px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16"
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-copper/40 to-transparent"
        aria-hidden
      />

      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex max-w-2xl flex-col items-start"
        >
          <span className="rounded-full border border-border bg-background/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/80 backdrop-blur">
            Nidlo
          </span>

          <h1 className="text-display mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Clothes made the way you want them.
          </h1>

          <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Nidlo connects you with custom fashion designers, tailors, and
            seamstresses. Find one near you to visit in person, or work with
            one anywhere through your phone. Measurements, fittings, progress
            updates, and payment all happen in one place.
          </p>

          <HeroCta />
        </motion.div>

        <div className="relative hidden h-[460px] lg:block">
          <AuthLookbook direction="up" />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-transparent to-background"
            aria-hidden
          />
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-copper/40 to-transparent"
        aria-hidden
      />
    </section>
  );
}
