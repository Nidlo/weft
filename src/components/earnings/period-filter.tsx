"use client";

import { useMemo } from "react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type PeriodKey = "today" | "month" | "year" | "all";

export interface PeriodRange {
  from: Date | undefined;
  to: Date | undefined;
  label: string;
}

interface Props {
  value: PeriodKey;
  onChange: (value: PeriodKey) => void;
}

// Period chooser for the earnings report. "All" omits both `from` and
// `to` so the backend returns lifetime totals. Other options snap to
// start-of-period for `from` and "now" for `to`.
export function PeriodFilter({ value, onChange }: Props) {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => onChange(v as PeriodKey)}
      aria-label="Earnings period"
    >
      <TabsList className="w-full sm:w-auto">
        <TabsTrigger value="today" className="flex-1 sm:flex-none">
          Today
        </TabsTrigger>
        <TabsTrigger value="month" className="flex-1 sm:flex-none">
          This month
        </TabsTrigger>
        <TabsTrigger value="year" className="flex-1 sm:flex-none">
          This year
        </TabsTrigger>
        <TabsTrigger value="all" className="flex-1 sm:flex-none">
          All time
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

export function usePeriodRange(key: PeriodKey): PeriodRange {
  return useMemo(() => buildRange(key), [key]);
}

function buildRange(key: PeriodKey): PeriodRange {
  const now = new Date();

  switch (key) {
    case "today": {
      const from = new Date(now);
      from.setHours(0, 0, 0, 0);
      return { from, to: now, label: "Today" };
    }
    case "month": {
      const from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      return {
        from,
        to: now,
        label: from.toLocaleDateString("en-GH", {
          month: "long",
          year: "numeric",
        }),
      };
    }
    case "year": {
      const from = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
      return { from, to: now, label: String(now.getFullYear()) };
    }
    case "all":
    default:
      return { from: undefined, to: undefined, label: "All time" };
  }
}
