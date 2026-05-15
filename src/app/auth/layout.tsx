"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft } from "lucide-react";

import { NidloMark } from "@/components/brand/nidlo-mark";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  AuthLookbook,
  AuthTagMarquee,
} from "@/components/shared/auth-lookbook";
import { useAuthStore } from "@/lib/stores/auth";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!_hasHydrated || isLoading) return;

    if (isAuthenticated) {
      if (pathname === "/auth/phone" || pathname === "/auth/verify") {
        router.replace(user?.isOnboarded ? "/dashboard" : "/auth/role");
        return;
      }

      if (pathname === "/auth/role" && user?.isOnboarded) {
        router.replace("/dashboard");
        return;
      }
    } else {
      if (pathname === "/auth/role") {
        router.replace("/auth/phone");
        return;
      }
    }
  }, [_hasHydrated, isAuthenticated, isLoading, user, pathname, router]);

  return (
    <div className="bg-thread-mesh relative flex min-h-dvh flex-col overflow-hidden">
      {/* Top-bar — back link + theme toggle. No sticky header on auth pages
          to keep the focus on the form. */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-4 sm:px-6 sm:pt-6">
        <Link
          href="/"
          className="text-muted-foreground hover:bg-background/60 hover:text-foreground inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          <span>Home</span>
        </Link>
        <ThemeToggle size="icon-sm" />
      </div>

      {/* Main grid: lookbook column · auth card · lookbook column.
          The columns are decorative — they hide on smaller viewports and
          are replaced by a horizontal tag marquee underneath the card. */}
      <div className="relative z-10 grid flex-1 grid-cols-1 items-center gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)_minmax(0,1fr)] lg:gap-12 lg:px-12 lg:py-10">
        {/* LEFT lookbook — scrolls up. Hidden under lg. */}
        <div className="hidden h-[min(100vh-7rem,720px)] items-stretch lg:flex">
          <motion.div
            initial={reduced ? false : { opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[16rem] xl:max-w-[18rem]"
          >
            <AuthLookbook direction="up" duration={70} />
          </motion.div>
        </div>

        {/* CENTER — the actual auth card */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-full max-w-md"
        >
          <div className="mb-8 flex flex-col items-center text-center">
            <NidloMark variant="wordmark" size={36} />
            <p className="text-muted-foreground mt-3 text-[11px] font-semibold tracking-[0.18em] uppercase">
              Where every stitch begins
            </p>
          </div>

          {children}
        </motion.div>

        {/* RIGHT lookbook — scrolls down. Hidden under lg. */}
        <div className="hidden h-[min(100vh-7rem,720px)] items-stretch justify-end lg:flex">
          <motion.div
            initial={reduced ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="w-full max-w-[16rem] xl:max-w-[18rem]"
          >
            <AuthLookbook direction="down" duration={80} />
          </motion.div>
        </div>
      </div>

      {/* Mobile / tablet companion — horizontal craft-tag marquee fills in
          for the missing vertical lookbooks under lg. */}
      <div className="relative z-10 pb-6 lg:hidden">
        <AuthTagMarquee />
      </div>

      {/* Hairline accent at the bottom — subtle copper glow */}
      <div
        className="via-copper/40 pointer-events-none h-px w-full bg-gradient-to-r from-transparent to-transparent"
        aria-hidden
      />
    </div>
  );
}
