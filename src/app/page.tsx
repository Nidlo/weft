import Link from "next/link";
import {
  ArrowUpRight,
  Facebook,
  Instagram,
  LifeBuoy,
  Scissors,
  ShoppingBag,
  Twitter,
  type LucideIcon,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { HomeHero } from "@/components/shared/home-hero";
import { HomeDiscovery } from "@/components/shared/home-discovery";
import { HowItWorks } from "@/components/shared/how-it-works";
import { GlassCard } from "@/components/ui/glass-card";
import { Section } from "@/components/ui/section";
import { APP_VERSION } from "@/lib/config";

interface SocialLink {
  icon: LucideIcon;
  label: string;
  href: string;
}

// Real handles fill these in once accounts are live. Empty strings hide the
// link from the UI (see `SOCIALS.filter(...)` below).
const SOCIALS: SocialLink[] = [
  { icon: Instagram, label: "Instagram", href: "https://instagram.com/nidlo" },
  { icon: Twitter, label: "X", href: "https://x.com/nidlo" },
  { icon: Facebook, label: "Facebook", href: "https://facebook.com/nidlo" },
];

export default function Home() {
  return (
    <AppShell bare>
      <HomeHero />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <HomeDiscovery />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <HowItWorks />
      </div>

      <AboutSection />
      <ContactSection />
      <LegalFooter />
    </AppShell>
  );
}

function AboutSection() {
  return (
    <div id="about" className="mx-auto max-w-7xl px-4 sm:px-6">
      <Section
        density="loose"
        eyebrow="About"
        title="Built for designers and the people who wear them."
        description="The team is based in Ghana, where we started. The platform is open to designers and clients anywhere. Bring your craft, bring your wardrobe."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <GlassCard variant="solid" className="p-6">
            <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-foreground ring-1 ring-border">
              <Scissors className="h-4 w-4" aria-hidden />
            </span>
            <h3 className="text-display mt-4 text-xl font-semibold tracking-tight">
              For designers
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              A portfolio, an order pipeline, and instant payouts to the wallet
              you already use. Grow beyond word-of-mouth and walk-in traffic
              without giving up control of your craft.
            </p>
          </GlassCard>

          <GlassCard variant="solid" className="p-6">
            <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-foreground ring-1 ring-border">
              <ShoppingBag className="h-4 w-4" aria-hidden />
            </span>
            <h3 className="text-display mt-4 text-xl font-semibold tracking-tight">
              For clients
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Find a designer near you or anywhere in the world. Send a brief,
              share measurements, see progress as it happens, and pay at each
              stage instead of all upfront.
            </p>
          </GlassCard>
        </div>
      </Section>
    </div>
  );
}

function ContactSection() {
  const visibleSocials = SOCIALS.filter((s) => s.href.trim().length > 0);

  return (
    <div id="contact" className="mx-auto max-w-7xl px-4 sm:px-6">
      <Section
        density="loose"
        eyebrow="Contact"
        title="Get in touch."
        description="Questions about an order, your account, or anything else on the platform? Reach out and we'll get back within one or two business days."
      >
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <a
            href="mailto:support@nidlo.com"
            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/30"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-foreground ring-1 ring-border">
              <LifeBuoy className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Support</p>
              <p className="truncate text-xs text-muted-foreground">
                support@nidlo.com
              </p>
            </div>
            <ArrowUpRight
              className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-copper"
              aria-hidden
            />
          </a>

          {visibleSocials.length > 0 && (
            <div className="flex items-center gap-2 md:gap-3">
              {visibleSocials.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex size-11 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:border-foreground/30 hover:bg-foreground hover:text-background"
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}

function LegalFooter() {
  return (
    <footer className="mt-12 border-t border-border/60">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>&copy; {new Date().getFullYear()} Nidlo</p>
        <nav className="flex flex-wrap gap-x-6 gap-y-1">
          <Link
            href="/terms"
            className="inline-flex min-h-11 items-center hover:text-foreground"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="inline-flex min-h-11 items-center hover:text-foreground"
          >
            Privacy
          </Link>
          <a
            href="#contact"
            className="inline-flex min-h-11 items-center hover:text-foreground"
          >
            Contact
          </a>
        </nav>
        <p className="text-[11px] uppercase tracking-[0.16em] tabular-nums">
          Build {APP_VERSION}
        </p>
      </div>
    </footer>
  );
}
