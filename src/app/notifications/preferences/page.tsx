"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { ArrowLeft, Loader2, Moon } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
    label: "New Orders",
    description: "When a new order is placed",
  },
  {
    key: "orderStatusChanged",
    label: "Order Updates",
    description: "When an order status changes",
  },
  {
    key: "messageReceived",
    label: "New Messages",
    description: "When you receive a message",
  },
  {
    key: "paymentReceived",
    label: "Payment Received",
    description: "When a payment is received",
  },
  {
    key: "paymentConfirmed",
    label: "Payment Confirmed",
    description: "When your payment is confirmed",
  },
  {
    key: "reviewReceived",
    label: "New Reviews",
    description: "When you receive a review",
  },
  {
    key: "payoutProcessed",
    label: "Payout Processed",
    description: "When a payout is completed",
  },
  {
    key: "externalPaymentRecorded",
    label: "Offline Payments",
    description: "When an offline payment is recorded",
  },
];

export default function NotificationPreferencesPage() {
  const { user, isReady } = useAuthGuard({ requireOnboarded: true });

  const { data, loading } = useQuery<MyNotificationPreferencesData>(
    MY_NOTIFICATION_PREFERENCES,
    { skip: !isReady || !user, fetchPolicy: "network-only" }
  );

  const [prefs, setPrefs] = useState<GqlNotificationPreferences | null>(null);
  const [quietStart, setQuietStart] = useState("");
  const [quietEnd, setQuietEnd] = useState("");

  const [updatePrefs, { loading: savingPrefs }] =
    useMutation<UpdateNotificationPreferencesData>(
      UPDATE_NOTIFICATION_PREFERENCES
    );
  const [updateQuiet, { loading: savingQuiet }] =
    useMutation<UpdateQuietHoursData>(UPDATE_QUIET_HOURS);

  useEffect(() => {
    if (data?.myNotificationPreferences) {
      setPrefs(data.myNotificationPreferences);
    }
  }, [data]);

  const handleToggle = (
    category: CategoryKey,
    channel: keyof NotificationChannels,
    value: boolean
  ) => {
    if (!prefs) return;
    setPrefs({
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
      toast.success(
        start ? "Quiet hours updated" : "Quiet hours disabled"
      );
    } catch {
      toast.error("Failed to update quiet hours");
    }
  };

  if (!isReady || !user) {
    return (
      <AppShell>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/notifications" aria-label="Back to notifications">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Notification Settings</h1>
            <p className="text-sm text-muted-foreground">
              Choose how you want to be notified
            </p>
          </div>
        </div>

        {/* Channel Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notification Channels</CardTitle>
            <CardDescription>
              Toggle push notifications and SMS for each category
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading || !prefs ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Column headers */}
                <div className="flex items-center justify-end gap-8 border-b pb-2 text-xs font-medium text-muted-foreground">
                  <span className="w-12 text-center">Push</span>
                  <span className="w-12 text-center">SMS</span>
                </div>

                {CATEGORIES.map((cat) => (
                  <div
                    key={cat.key}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <Label className="text-sm font-medium">
                        {cat.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">
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
                        />
                      </div>
                      <div className="flex w-12 justify-center">
                        <Switch
                          checked={prefs[cat.key].sms}
                          onCheckedChange={(v) =>
                            handleToggle(cat.key, "sms", v)
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  onClick={handleSavePreferences}
                  disabled={savingPrefs}
                  className="w-full"
                >
                  {savingPrefs && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Preferences
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quiet Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Moon className="h-5 w-5" />
              Quiet Hours
            </CardTitle>
            <CardDescription>
              Pause push and SMS notifications during specific hours. In-app
              notifications are still saved.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quiet-start" className="text-sm">
                  Start Time
                </Label>
                <Input
                  id="quiet-start"
                  type="time"
                  value={quietStart}
                  onChange={(e) => setQuietStart(e.target.value)}
                  placeholder="22:00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiet-end" className="text-sm">
                  End Time
                </Label>
                <Input
                  id="quiet-end"
                  type="time"
                  value={quietEnd}
                  onChange={(e) => setQuietEnd(e.target.value)}
                  placeholder="07:00"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Leave both empty to disable quiet hours. Supports overnight
              windows (e.g., 22:00 to 07:00).
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleSaveQuietHours}
                disabled={savingQuiet}
                className="flex-1"
              >
                {savingQuiet && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Quiet Hours
              </Button>
              {(quietStart || quietEnd) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuietStart("");
                    setQuietEnd("");
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
