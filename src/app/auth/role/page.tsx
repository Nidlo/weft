"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import {
  ArrowRight,
  Building2,
  Scissors,
  Shirt,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { BECOME_DESIGNER } from "@/lib/graphql/mutations/auth";
import type { BecomeDesignerData } from "@/types/graphql";
import { useAuthStore } from "@/lib/stores/auth";
import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface RoleOption {
  key: "CLIENT" | "DESIGNER" | "ORGANIZATION";
  title: string;
  description: string;
  icon: LucideIcon;
  disabled?: boolean;
}

const ROLES: RoleOption[] = [
  {
    key: "CLIENT",
    title: "I want clothes made",
    description: "Find designers, place orders, and track your garments.",
    icon: Shirt,
  },
  {
    key: "DESIGNER",
    title: "I'm a designer",
    description: "Get clients, manage orders, and grow your fashion business.",
    icon: Scissors,
  },
  {
    key: "ORGANIZATION",
    title: "I run a workshop",
    description: "Manage a team of designers and handle bulk orders.",
    icon: Building2,
    disabled: true,
  },
];

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function RoleSelectionPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  // The role chooser is the authed-but-not-onboarded interstitial. Anyone
  // already onboarded gets bounced to /dashboard by the guard itself —
  // this page no longer rolls its own redirect / loading state.
  // (FE-NIDLO-AUTH-18 / audit H6)
  const { isReady } = useAuthGuard({ redirectOnboardedTo: "/dashboard" });
  const [becomeDesigner, { loading }] = useMutation(BECOME_DESIGNER);
  const reduced = useReducedMotion();

  if (!isReady) {
    return (
      <GlassCard variant="solid" className="p-8">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="mt-2 h-4 w-72" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      </GlassCard>
    );
  }

  const handleSelect = async (key: RoleOption["key"]) => {
    if (key === "ORGANIZATION") {
      toast.info("Organization accounts are coming soon! Join the waitlist.");
      return;
    }

    try {
      if (key === "DESIGNER") {
        const { data } = await becomeDesigner();
        const result = data as BecomeDesignerData | undefined;

        if (result?.becomeDesigner) {
          setUser({
            ...user!,
            isDesigner: true,
          });
          toast.success("Welcome to Nidlo!");
          router.push("/onboarding");
        }
      } else {
        toast.success("Welcome to Nidlo!");
        router.push("/onboarding/client");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error(message);
    }
  };

  return (
    <GlassCard variant="solid" className="p-8">
      <header className="mb-7">
        <h1 className="text-display text-2xl leading-tight font-semibold tracking-tight sm:text-3xl">
          How will you use Nidlo?
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Pick one to get started — you can switch later.
        </p>
      </header>

      <motion.div
        initial={reduced ? "show" : "hidden"}
        animate="show"
        variants={containerVariants}
        className="space-y-3"
      >
        {ROLES.map((option) => {
          const Icon = option.icon;
          const isDisabled = loading || option.disabled;
          return (
            <motion.button
              key={option.key}
              variants={itemVariants}
              onClick={() => handleSelect(option.key)}
              disabled={isDisabled}
              whileHover={!isDisabled && !reduced ? { y: -2 } : undefined}
              whileTap={!isDisabled ? { scale: 0.98 } : undefined}
              className={cn(
                "group border-border bg-background/60 relative flex w-full items-center gap-4 rounded-2xl border p-5 text-left",
                "transition-[border-color,box-shadow,background-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
                "focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                !isDisabled &&
                  "hover:border-foreground/30 hover:bg-background hover:shadow-(--shadow-glow)",
                option.disabled && "cursor-not-allowed opacity-60",
                loading && "pointer-events-none"
              )}
            >
              <span
                className={cn(
                  "bg-secondary text-foreground flex size-12 shrink-0 items-center justify-center rounded-xl transition-all",
                  !isDisabled &&
                    "group-hover:bg-foreground group-hover:text-background"
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-display text-base font-semibold tracking-tight">
                    {option.title}
                  </span>
                  {option.disabled && (
                    <Badge
                      variant="outline"
                      className="border-copper/40 bg-copper/10 text-copper-soft rounded-full text-[10px] font-medium tracking-wider uppercase"
                    >
                      Soon
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mt-1 text-sm">
                  {option.description}
                </p>
              </div>
              {!option.disabled && (
                <ArrowRight
                  className={cn(
                    "text-muted-foreground h-4 w-4 shrink-0 transition-all duration-200",
                    "group-hover:text-copper group-hover:translate-x-0.5"
                  )}
                  aria-hidden
                />
              )}
            </motion.button>
          );
        })}
      </motion.div>

      <p className="text-muted-foreground mt-7 text-center text-xs">
        Designers and clients can both browse and place orders.
      </p>
    </GlassCard>
  );
}
