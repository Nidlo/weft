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
  { ssr: false, loading: () => null }
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
        "px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20"
      )}
    >
      <div
        className="via-copper/40 pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent"
        aria-hidden
      />

      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex max-w-2xl flex-col items-start"
        >
          <span className="border-border bg-background/60 text-foreground/80 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase backdrop-blur">
            Nidlo
          </span>

          <h1 className="text-display mt-5 text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Clothes made the way you want them.
          </h1>

          <p className="text-muted-foreground mt-5 max-w-xl text-base leading-relaxed text-pretty sm:text-lg">
            Nidlo connects you with custom fashion designers, tailors, and
            seamstresses. Find one near you to visit in person, or work with one
            anywhere through your phone. Measurements, fittings, progress
            updates, and payment all happen in one place.
          </p>

          <HeroCta />
        </motion.div>

        <div className="relative hidden h-[460px] lg:block">
          <AuthLookbook direction="up" />
          <div
            className="from-background to-background pointer-events-none absolute inset-0 bg-gradient-to-t via-transparent"
            aria-hidden
          />
        </div>
      </div>

      <div
        className="via-copper/40 pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent to-transparent"
        aria-hidden
      />
    </section>
  );
}
