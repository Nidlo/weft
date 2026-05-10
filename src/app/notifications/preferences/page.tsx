"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "@apollo/client/react";
import { ArrowLeft, Check, Loader2, Moon } from "lucide-react";
import { toast } from "sonner";

import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/ui/glass-card";
import { MY_NOTIFICATION_PREFERENCES } from "@/lib/graphql/queries/notification";
import {
  UPDATE_NOTIFICATION_PREFERENCES,
  UPDATE_QUIET_HOURS,
} from "@/lib/graphql/mutations/notification";
import type {
  GqlNotificationPreferences,
  NotificationChannels,
  MyNotificationPreferencesData,
  UpdateNotificationPreferencesData,
  UpdateQuietHoursData,
} from "@/types/graphql";

// Channel-toggle category keys only — excludes the quiet-hours string fields
// added to `GqlNotificationPreferences` for the quiet-window query payload.
type CategoryKey = {
  [K in keyof GqlNotificationPreferences]: GqlNotificationPreferences[K] extends NotificationChannels
    ? K
    : never;
}[keyof GqlNotificationPreferences];

interface CategoryConfig {
  key: CategoryKey;
  label: string;
  description: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    key: "orderCreated",
    label: "New orders",
    description: "When a new order is placed",
  },
  {
    key: "orderStatusChanged",
    label: "Order updates",
    description: "When an order status changes",
  },
  {
    key: "messageReceived",
    label: "New messages",
    description: "When you receive a message",
  },
  {
    key: "paymentReceived",
    label: "Payment received",
    description: "When a payment is received",
  },
  {
    key: "paymentConfirmed",
    label: "Payment confirmed",
    description: "When your payment is confirmed",
  },
  {
    key: "reviewReceived",
    label: "New reviews",
    description: "When you receive a review",
  },
  {
    key: "payoutProcessed",
    label: "Payout processed",
    description: "When a payout is completed",
  },
  {
    key: "externalPaymentRecorded",
    label: "Offline payments",
    description: "When an offline payment is recorded",
  },
];

export default function NotificationPreferencesPage() {
  const { user, isReady } = useAuthGuard({ requireOnboarded: true });

  const { data, loading } = useQuery<MyNotificationPreferencesData>(
    MY_NOTIFICATION_PREFERENCES,
    { skip: !isReady || !user, fetchPolicy: "network-only" }
  );

  // Local edits override the server snapshot until saved or dropped. Deriving
  // `prefs` from `(override ?? data)` avoids the React 19 cascading-render
  // anti-pattern of syncing fetched data into state via useEffect.
  const [overridePrefs, setOverridePrefs] =
    useState<GqlNotificationPreferences | null>(null);
  const [quietStart, setQuietStart] = useState("");
  const [quietEnd, setQuietEnd] = useState("");

  const [updatePrefs, { loading: savingPrefs }] =
    useMutation<UpdateNotificationPreferencesData>(
      UPDATE_NOTIFICATION_PREFERENCES
    );
  const [updateQuiet, { loading: savingQuiet }] =
    useMutation<UpdateQuietHoursData>(UPDATE_QUIET_HOURS);

  const prefs = overridePrefs ?? data?.myNotificationPreferences ?? null;

  const handleToggle = (
    category: CategoryKey,
    channel: keyof NotificationChannels,
    value: boolean
  ) => {
    if (!prefs) return;
    setOverridePrefs({
      ...prefs,
      [category]: { ...prefs[category], [channel]: value },
    });
  };

  const handleSavePreferences = async () => {
    if (!prefs) return;

    const input: Record<string, { push: boolean; sms: boolean }> = {};
    for (const cat of CATEGORIES) {
      const channels = prefs[cat.key];
      input[cat.key] = {
        push: channels.push,
        sms: channels.sms,
      };
    }

    try {
      await updatePrefs({ variables: { input } });
      toast.success("Notification preferences saved");
    } catch {
      toast.error("Failed to save preferences");
    }
  };

  const handleSaveQuietHours = async () => {
    try {
      const start = quietStart || null;
      const end = quietEnd || null;
      await updateQuiet({ variables: { start, end } });
      toast.success(start ? "Quiet hours updated" : "Quiet hours disabled");
    } catch {
      toast.error("Failed to update quiet hours");
    }
  };

  if (!isReady || !user) {
    return (
      <AppShell>
        <div className="space-y-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-96 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-7">
        <div>
          <Link
            href="/notifications"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to notifications
          </Link>
          <header className="mt-4">
            <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
              Inbox
            </p>
            <h1 className="text-display mt-2 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
              Notification settings
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Choose how you want to be notified for each event.
            </p>
          </header>
        </div>

        {/* Channel preferences */}
        <section>
          <header className="mb-4">
            <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
              Channels
            </p>
            <h2 className="text-display mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">
              Per-event preferences
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Toggle push notifications and SMS for each category below.
            </p>
          </header>

          <GlassCard variant="solid" className="p-5 sm:p-6">
            {loading || !prefs ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-5">
                <div className="border-border/60 text-muted-foreground flex items-center justify-end gap-8 border-b pb-3 text-[10px] font-semibold tracking-[0.16em] uppercase">
                  <span className="w-12 text-center">Push</span>
                  <span className="w-12 text-center">SMS</span>
                </div>

                {CATEGORIES.map((cat) => (
                  <div
                    key={cat.key}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <Label className="text-display text-sm font-semibold tracking-tight">
                        {cat.label}
                      </Label>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {cat.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="flex w-12 justify-center">
                        <Switch
                          checked={prefs[cat.key].push}
                          onCheckedChange={(v) =>
                            handleToggle(cat.key, "push", v)
                          }
                          aria-label={`Push notifications for ${cat.label}`}
                        />
                      </div>
                      <div className="flex w-12 justify-center">
                        <Switch
                          checked={prefs[cat.key].sms}
                          onCheckedChange={(v) =>
                            handleToggle(cat.key, "sms", v)
                          }
                          aria-label={`SMS notifications for ${cat.label}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  variant="luxe"
                  size="lg"
                  onClick={handleSavePreferences}
                  disabled={savingPrefs}
                  className="w-full gap-1.5"
                >
                  {savingPrefs ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Check className="h-4 w-4" aria-hidden />
                  )}
                  {savingPrefs ? "Saving..." : "Save preferences"}
                </Button>
              </div>
            )}
          </GlassCard>
        </section>

        {/* Quiet hours */}
        <section>
          <header className="mb-4">
            <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
              Do not disturb
            </p>
            <h2 className="text-display mt-1.5 flex items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl">
              <Moon className="text-foreground/80 h-5 w-5" aria-hidden />
              Quiet hours
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Pause push and SMS during specific hours. In-app notifications are
              still saved.
            </p>
          </header>

          <GlassCard variant="solid" className="space-y-4 p-5 sm:p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quiet-start" className="text-sm">
                  Start
                </Label>
                <Input
                  id="quiet-start"
                  type="time"
                  value={quietStart}
                  onChange={(e) => setQuietStart(e.target.value)}
                  placeholder="22:00"
                  className="h-11 tabular-nums"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiet-end" className="text-sm">
                  End
                </Label>
                <Input
                  id="quiet-end"
                  type="time"
                  value={quietEnd}
                  onChange={(e) => setQuietEnd(e.target.value)}
                  placeholder="07:00"
                  className="h-11 tabular-nums"
                />
              </div>
            </div>
            <p className="text-muted-foreground text-xs">
              Leave both empty to disable. Supports overnight windows (e.g.
              22:00 → 07:00).
            </p>
            <div className="flex flex-col gap-2 sm:flex-row-reverse">
              <Button
                variant="luxe"
                size="lg"
                onClick={handleSaveQuietHours}
                disabled={savingQuiet}
                className="gap-1.5 sm:flex-1"
              >
                {savingQuiet ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Check className="h-4 w-4" aria-hidden />
                )}
                {savingQuiet ? "Saving..." : "Save quiet hours"}
              </Button>
              {(quietStart || quietEnd) && (
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-muted-foreground"
                  onClick={() => {
                    setQuietStart("");
                    setQuietEnd("");
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </GlassCard>
        </section>
      </div>
    </AppShell>
  );
}
