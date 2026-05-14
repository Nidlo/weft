"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Loader2,
  Receipt,
} from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { formatPesewas } from "@/lib/utils/order";
import { cn } from "@/lib/utils";
import type {
  GqlEarningsBreakdownItem,
  PayoutStatusValue,
} from "@/types/graphql";

interface Props {
  rows: GqlEarningsBreakdownItem[];
  loading: boolean;
}

// Per-order breakdown that replaces the old wallet ledger.
// One row per payout — clicking through opens the order detail page.
// "Status" is the source of truth for what actually happened (success
// = money landed; wallet_pending = stuck on payout setup; etc.).
export function EarningsBreakdown({ rows, loading }: Props) {
  return (
    <section>
      <header className="mb-4">
        <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
          Per-order breakdown
        </p>
        <h2 className="text-display mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">
          Transaction history
        </h2>
      </header>

      {loading && rows.length === 0 ? (
        <GlassCard variant="ghost" className="p-4">
          <p className="text-muted-foreground text-sm">Loading...</p>
        </GlassCard>
      ) : rows.length === 0 ? (
        <GlassCard
          variant="solid"
          className="flex flex-col items-center py-12 text-center"
        >
          <span className="bg-secondary text-foreground flex size-14 items-center justify-center rounded-2xl">
            <Receipt className="h-6 w-6" aria-hidden />
          </span>
          <h3 className="text-display mt-4 text-xl font-semibold tracking-tight">
            No transactions in this period.
          </h3>
          <p className="text-muted-foreground mx-auto mt-1.5 max-w-xs text-sm">
            Settled orders will appear here as soon as a client pays.
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <BreakdownRow key={row.payoutId} row={row} />
          ))}
        </div>
      )}
    </section>
  );
}

function BreakdownRow({ row }: { row: GqlEarningsBreakdownItem }) {
  const tone = statusTone(row.status);
  const label = statusLabel(row.status);
  const reachedMomo = row.status === "success";

  return (
    <Link
      href={`/orders/${row.orderId}`}
      className="group block focus:outline-none"
      aria-label={`Order ${row.orderId.slice(0, 8)} · ${label}`}
    >
      <GlassCard
        variant="solid"
        className={cn(
          "flex items-center justify-between gap-3 p-4",
          "ring-border group-hover:ring-copper/30 transition-shadow group-focus-visible:ring-2"
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl ring-1",
              tone === "success" &&
                "bg-status-success-soft text-status-success ring-status-success/20",
              tone === "warn" &&
                "bg-status-warning-soft text-status-warning-fg ring-status-warning/30",
              tone === "danger" &&
                "bg-status-error-soft text-status-error ring-status-error/20",
              tone === "muted" &&
                "bg-secondary text-muted-foreground ring-border"
            )}
          >
            <StatusIcon status={row.status} />
          </span>
          <div className="min-w-0">
            <p className="text-display truncate text-sm font-semibold tracking-tight">
              Order · {row.orderId.slice(0, 8)}
            </p>
            <p className="text-muted-foreground text-xs tabular-nums">
              {label} ·{" "}
              {new Date(
                reachedMomo
                  ? (row.transferredAt ?? row.createdAt)
                  : row.createdAt
              ).toLocaleDateString("en-GH", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="text-right">
            <p
              className={cn(
                "text-sm font-semibold tabular-nums",
                reachedMomo ? "text-status-success-fg" : "text-foreground"
              )}
            >
              {formatPesewas(row.netPesewas)}
            </p>
            <p className="text-muted-foreground text-[10px] tabular-nums">
              gross {formatPesewas(row.grossPesewas)} − fee{" "}
              {formatPesewas(row.feePesewas)}
            </p>
          </div>
          <ArrowUpRight
            className="text-muted-foreground/60 group-hover:text-foreground h-4 w-4 transition-colors"
            aria-hidden
          />
        </div>
      </GlassCard>
    </Link>
  );
}

function statusLabel(status: PayoutStatusValue): string {
  switch (status) {
    case "success":
      return "Reached your MoMo";
    case "wallet_pending":
      return "Awaiting payout setup";
    case "failed":
      return "Transfer failed — retry from Orders";
    case "processing":
      return "Transferring…";
    case "pending":
    default:
      return "Pending";
  }
}

function statusTone(
  status: PayoutStatusValue
): "success" | "warn" | "danger" | "muted" {
  switch (status) {
    case "success":
      return "success";
    case "wallet_pending":
      return "warn";
    case "failed":
      return "danger";
    case "processing":
    case "pending":
    default:
      return "muted";
  }
}

function StatusIcon({ status }: { status: PayoutStatusValue }) {
  switch (status) {
    case "success":
      return <CheckCircle2 className="h-4 w-4" aria-hidden />;
    case "wallet_pending":
    case "failed":
      return <AlertTriangle className="h-4 w-4" aria-hidden />;
    case "processing":
      return <Loader2 className="h-4 w-4 animate-spin" aria-hidden />;
    case "pending":
    default:
      return <Clock className="h-4 w-4" aria-hidden />;
  }
}
