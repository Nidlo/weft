"use client";

import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Eye,
  Plus,
  Ruler,
  Scissors,
  Search,
  Share2,
  Star,
  TrendingUp,
  User as UserIcon,
  type LucideIcon,
} from "lucide-react";

import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { ThreadDivider } from "@/components/ui/thread-divider";
import { Compass, Sparkles } from "lucide-react";
import { useOrders } from "@/lib/hooks/use-orders";
import { OrderCard } from "@/components/order/order-card";
import { ShareButtons } from "@/components/shared/share-buttons";
import { ACTIVE_STATUSES } from "@/lib/utils/order";
import { cn } from "@/lib/utils";
import type { User as AuthUser } from "@/lib/stores/auth";

interface QuickAction {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

const CLIENT_ACTIONS: QuickAction[] = [
  {
    href: "/search",
    icon: Search,
    title: "Find a designer",
    description: "Browse talented tailors and seamstresses near you.",
  },
  {
    href: "/measurements",
    icon: Ruler,
    title: "Body Vault",
    description: "Save your measurements for faster ordering.",
  },
  {
    href: "/orders",
    icon: ClipboardList,
    title: "My orders",
    description: "Track your garment orders and progress.",
  },
  {
    href: "/profile",
    icon: UserIcon,
    title: "My profile",
    description: "Manage your account and preferences.",
  },
];

const CLIENT_STEPS = [
  {
    icon: Compass,
    title: "Find a designer",
    body: "Search by craft, location, or price range.",
  },
  {
    icon: Sparkles,
    title: "Submit your blueprint",
    body: "Specify garment details, measurements, and budget.",
  },
  {
    icon: Ruler,
    title: "Track production",
    body: "Follow every stitch from cutting to delivery.",
  },
];

function ClientDashboard({ firstName }: { firstName: string | null }) {
  return (
    <div className="space-y-12">
      <Greeting
        eyebrow="Your Nidlo"
        title={`Welcome${firstName ? `, ${firstName}` : ""}.`}
        subtitle="Find the perfect designer for your next outfit."
      />

      <section>
        <SectionHeader eyebrow="Get started" title="Quick actions" />
        <div className="grid gap-3 sm:grid-cols-2">
          {CLIENT_ACTIONS.map((action) => (
            <QuickActionCard key={action.href} action={action} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          eyebrow="The Nidlo way"
          title="Three steps from idea to wardrobe."
        />
        <ThreadDivider tone="copper" className="mb-8" />
        <div className="grid gap-4 sm:grid-cols-3">
          {CLIENT_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <GlassCard
                key={step.title}
                variant="solid"
                className="flex flex-col gap-3 p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="bg-secondary text-foreground flex size-10 items-center justify-center rounded-xl">
                    <Icon className="h-4.5 w-4.5" aria-hidden />
                  </span>
                  <span className="text-display text-muted-foreground/70 text-2xl font-semibold tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="text-display text-lg font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
                  {step.body}
                </p>
              </GlassCard>
            );
          })}
        </div>
      </section>
    </div>
  );
}

const DESIGNER_ACTIONS: QuickAction[] = [
  {
    href: "/orders/new",
    icon: Plus,
    title: "Create order",
    description: "Add an order for a walk-in client.",
  },
  {
    href: "/orders",
    icon: ClipboardList,
    title: "My orders",
    description: "View and manage incoming orders.",
  },
  {
    href: "/profile",
    icon: UserIcon,
    title: "My profile",
    description: "Update your portfolio and settings.",
  },
];

function DesignerDashboard({ user }: { user: AuthUser }) {
  const firstName = user.firstName;
  const slug = user.designerProfile?.slug;
  const viewsThisWeek = user.designerProfile?.profileViewsThisWeek ?? 0;
  const viewsTotal = user.designerProfile?.profileViewsCount ?? 0;
  const profileUrl = slug
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/designer/${slug}`
    : "";
  const { orders } = useOrders(undefined, 5);
  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const pendingOrders = orders.filter((o) => o.status === "pending");

  return (
    <div className="space-y-12">
      <Greeting
        eyebrow="Designer dashboard"
        title={`Welcome${firstName ? `, ${firstName}` : ""}.`}
        subtitle="Track orders, grow your reputation, get paid."
      />

      {/* Stats grid */}
      <div className="grid gap-3 sm:grid-cols-3">
        <DesignerStat
          icon={ClipboardList}
          label="Active orders"
          value={`${activeOrders.length}`}
          accent={
            pendingOrders.length > 0 ? (
              <Badge
                variant="outline"
                className="border-copper/40 bg-copper/10 text-copper-soft rounded-full text-[10px] font-semibold tracking-wider uppercase"
              >
                {pendingOrders.length} pending
              </Badge>
            ) : null
          }
        />
        <DesignerStat
          icon={Star}
          label="Rating"
          value="-"
          accent={
            <span className="text-muted-foreground text-[11px] tracking-[0.16em] uppercase">
              No reviews yet
            </span>
          }
        />
        <DesignerStat
          icon={TrendingUp}
          label="Profile views"
          value={`${viewsTotal}`}
          accent={
            <span className="text-muted-foreground text-[11px] tracking-[0.16em] uppercase">
              <span className="text-foreground font-semibold tabular-nums">
                {viewsThisWeek}
              </span>{" "}
              this week
            </span>
          }
        />
      </div>

      {/* Profile completeness */}
      <section>
        <SectionHeader eyebrow="Reputation" title="Complete your profile." />
        <GlassCard variant="solid" className="p-6">
          <p className="text-muted-foreground text-sm leading-relaxed">
            A complete profile helps clients find and trust you. Update your
            bio, specializations, pricing, and portfolio to stand out.
          </p>
          <div
            className="bg-border mt-4 h-1.5 w-full overflow-hidden rounded-full"
            aria-hidden
          >
            <div
              className="bg-copper h-full transition-[width] duration-500 ease-out"
              style={{ width: "0%" }}
            />
          </div>
          <Button
            variant="luxe-outline"
            size="sm"
            className="mt-5 gap-1.5"
            asChild
          >
            <Link href="/profile">
              <Scissors className="h-3.5 w-3.5" aria-hidden />
              Edit profile
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </Button>
        </GlassCard>
      </section>

      {/* Share your profile */}
      {slug && (
        <section>
          <SectionHeader
            eyebrow="Reach"
            title="Share your profile."
            action={<Share2 className="text-copper h-4 w-4" aria-hidden />}
          />
          <GlassCard variant="solid" className="space-y-4 p-6">
            <div className="border-border bg-background/60 flex items-center gap-2 rounded-xl border px-3 py-2.5">
              <Eye
                className="text-muted-foreground h-4 w-4 shrink-0"
                aria-hidden
              />
              <span className="text-foreground/80 truncate font-mono text-sm">
                {profileUrl.replace(/^https?:\/\//, "")}
              </span>
            </div>
            {viewsThisWeek > 0 && (
              <p className="text-muted-foreground text-sm">
                Viewed{" "}
                <span className="text-foreground font-semibold tabular-nums">
                  {viewsThisWeek}
                </span>{" "}
                time{viewsThisWeek !== 1 ? "s" : ""} this week
              </p>
            )}
            <ShareButtons
              url={profileUrl}
              title={user.fullName ?? "My Profile"}
            />
            <p className="text-muted-foreground text-xs">
              Share your profile to attract more clients.
            </p>
          </GlassCard>
        </section>
      )}

      {/* Recent orders */}
      {orders.length > 0 && (
        <section>
          <SectionHeader
            eyebrow="In flight"
            title="Recent orders"
            action={
              <Link
                href="/orders"
                className="text-foreground/80 hover:text-foreground inline-flex items-center gap-1 text-sm font-medium transition-colors"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            }
          />
          <div className="space-y-2">
            {orders.slice(0, 3).map((order) => (
              <OrderCard
                key={order.id}
                order={order as Parameters<typeof OrderCard>[0]["order"]}
                viewAs="designer"
              />
            ))}
          </div>
        </section>
      )}

      {/* Quick actions */}
      <section>
        <SectionHeader eyebrow="Tools" title="Quick actions" />
        <div className="grid gap-3 sm:grid-cols-3">
          {DESIGNER_ACTIONS.map((action) => (
            <QuickActionCard key={action.href} action={action} />
          ))}
        </div>
      </section>
    </div>
  );
}

interface GreetingProps {
  eyebrow: string;
  title: string;
  subtitle: string;
}

function Greeting({ eyebrow, title, subtitle }: GreetingProps) {
  return (
    <header>
      <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
        {eyebrow}
      </p>
      <h1 className="text-display mt-2 text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
        {title}
      </h1>
      <p className="text-muted-foreground mt-2 max-w-2xl text-sm text-pretty sm:text-base">
        {subtitle}
      </p>
    </header>
  );
}

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
}

function SectionHeader({ eyebrow, title, action }: SectionHeaderProps) {
  return (
    <header className="mb-5 flex items-end justify-between gap-3">
      <div>
        <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
          {eyebrow}
        </p>
        <h2 className="text-display mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">
          {title}
        </h2>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

function QuickActionCard({ action }: { action: QuickAction }) {
  const Icon = action.icon;
  return (
    <Link
      href={action.href}
      className="group focus-visible:ring-ring focus-visible:ring-offset-background block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      <GlassCard
        variant="solid"
        interactive
        glow="copper"
        className="flex h-full items-start gap-4 p-5"
      >
        <span
          className={cn(
            "bg-secondary text-foreground flex size-11 shrink-0 items-center justify-center rounded-xl",
            "group-hover:bg-foreground group-hover:text-background transition-all duration-200"
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-display text-base font-semibold tracking-tight">
            {action.title}
          </h3>
          <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
            {action.description}
          </p>
        </div>
        <ArrowRight
          className="text-muted-foreground group-hover:text-copper mt-1 h-4 w-4 shrink-0 transition-all duration-200 group-hover:translate-x-0.5"
          aria-hidden
        />
      </GlassCard>
    </Link>
  );
}

interface DesignerStatProps {
  icon: LucideIcon;
  label: string;
  value: string;
  accent?: React.ReactNode;
}

function DesignerStat({ icon: Icon, label, value, accent }: DesignerStatProps) {
  return (
    <GlassCard variant="solid" className="p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Icon className="text-copper h-4 w-4" aria-hidden />
        <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.16em] uppercase">
          {label}
        </span>
      </div>
      <p className="text-display mt-3 text-3xl font-semibold tabular-nums sm:text-4xl">
        {value}
      </p>
      {accent && <div className="mt-2">{accent}</div>}
    </GlassCard>
  );
}

export default function DashboardPage() {
  const { user, isReady } = useAuthGuard({ requireOnboarded: true });

  if (!isReady || !user) {
    return (
      <AppShell>
        <div className="space-y-12">
          <div>
            <Skeleton className="h-3 w-32" />
            <Skeleton className="mt-3 h-10 w-72" />
            <Skeleton className="mt-3 h-5 w-96" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {user.isDesigner ? (
        <DesignerDashboard user={user} />
      ) : (
        <ClientDashboard firstName={user.firstName} />
      )}
    </AppShell>
  );
}
