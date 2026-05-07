"use client";

import { useQuery } from "@tanstack/react-query";

interface MaintenanceStatus {
  active: boolean;
  message: string | null;
  since: string | null;
}

const POLL_INTERVAL_MS = 30_000;

/**
 * QA-AD-OPS-011 (frontend half) — Sticky red banner shown across all
 * PWA tabs when the backend's maintenance flag is on. Polls
 * `/api/system/maintenance` every 30s so an operator who flips the
 * toggle in the admin panel sees the banner appear without a manual
 * page refresh on user devices. Renders nothing when the flag is off
 * (the common case), so cost on the happy path is one fetch every
 * 30s + a cheap render-bail.
 */
export function MaintenanceBanner() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
  const statusUrl =
    apiUrl.replace(/\/graphql$/, "") + "/api/system/maintenance";

  const { data } = useQuery<MaintenanceStatus>({
    queryKey: ["system-maintenance"],
    queryFn: async () => {
      const response = await fetch(statusUrl, {
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        // A failed poll shouldn't shout "maintenance!" — fall through to
        // off-state so a single network hiccup doesn't strand users on
        // a banner with no escape.
        return { active: false, message: null, since: null };
      }
      return (await response.json()) as MaintenanceStatus;
    },
    refetchInterval: POLL_INTERVAL_MS,
    refetchOnWindowFocus: true,
    retry: 1,
    staleTime: 0,
  });

  if (!data?.active) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      data-testid="maintenance-banner"
      className="sticky top-0 z-50 w-full border-b border-red-300 bg-red-100 text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-100"
    >
      <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center gap-x-3 px-4 py-2 text-sm">
        <span className="font-semibold">Maintenance:</span>
        <span>{data.message ?? "Nidlo is briefly offline."}</span>
        {data.since && (
          <span className="ml-auto font-mono text-xs opacity-75">
            since {formatSince(data.since)}
          </span>
        )}
      </div>
    </div>
  );
}

function formatSince(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return iso;
  }
  // Local time, no seconds — operators care about "started 3 min ago",
  // not exact ISO precision. The full ISO is in the audit log.
  return parsed.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}
