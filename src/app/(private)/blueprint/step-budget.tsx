"use client";

import { CalendarIcon, Flame } from "lucide-react";

import { useBlueprintStore } from "@/lib/stores/blueprint";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const MIN_DEADLINE_DAYS = 3;
const RUSH_THRESHOLD_DAYS = 7;

function getMinDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + MIN_DEADLINE_DAYS);
  return d.toISOString().split("T")[0];
}

function getDaysFromNow(dateStr: string): number {
  if (!dateStr) return 0;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function StepBudget() {
  const { budgetMin, budgetMax, deadline, notes, setField } =
    useBlueprintStore();

  const daysFromNow = getDaysFromNow(deadline);
  const isRush =
    deadline && daysFromNow > 0 && daysFromNow < RUSH_THRESHOLD_DAYS;
  const isInverted =
    budgetMin && budgetMax && Number(budgetMax) < Number(budgetMin);

  return (
    <div className="space-y-7">
      <div>
        <Label className="flex items-center gap-1.5 text-sm">
          Budget range
          <span className="text-copper" aria-label="required">
            *
          </span>
        </Label>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
          <div className="space-y-2">
            <Label
              htmlFor="budget-min"
              className="text-muted-foreground text-xs"
            >
              Minimum
            </Label>
            <div className="relative">
              <span
                className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-xs font-semibold"
                aria-hidden
              >
                GHS
              </span>
              <Input
                id="budget-min"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                placeholder="200"
                value={budgetMin}
                onChange={(e) => setField("budgetMin", e.target.value)}
                className="h-11 pl-12 tabular-nums"
              />
            </div>
          </div>
          <div
            className="via-copper/60 hidden h-px w-full bg-linear-to-r from-transparent to-transparent sm:block sm:h-11 sm:w-12 sm:bg-linear-to-b"
            aria-hidden
          />
          <div className="space-y-2">
            <Label
              htmlFor="budget-max"
              className="text-muted-foreground text-xs"
            >
              Maximum
            </Label>
            <div className="relative">
              <span
                className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-xs font-semibold"
                aria-hidden
              >
                GHS
              </span>
              <Input
                id="budget-max"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                placeholder="500"
                value={budgetMax}
                onChange={(e) => setField("budgetMax", e.target.value)}
                className="h-11 pl-12 tabular-nums"
              />
            </div>
          </div>
        </div>
        {isInverted && (
          <p className="text-status-error-fg mt-2 text-sm">
            Maximum budget must be at least the minimum.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="deadline" className="flex items-center gap-1.5 text-sm">
          Deadline
          <span className="text-copper" aria-label="required">
            *
          </span>
        </Label>
        <div className="relative">
          <CalendarIcon
            className="text-copper pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
            aria-hidden
          />
          <Input
            id="deadline"
            type="date"
            min={getMinDate()}
            value={deadline}
            onChange={(e) => setField("deadline", e.target.value)}
            className="h-11 pl-9 tabular-nums"
          />
        </div>
        {deadline && daysFromNow > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-muted-foreground text-sm tabular-nums">
              <span className="text-foreground font-semibold">
                {daysFromNow}
              </span>{" "}
              day{daysFromNow !== 1 ? "s" : ""} from now
            </span>
            {isRush && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5",
                  "text-[10px] font-semibold tracking-wider uppercase",
                  "bg-copper/15 text-copper-soft ring-copper/30 ring-1"
                )}
              >
                <Flame className="h-3 w-3" aria-hidden />
                Rush order
              </span>
            )}
          </div>
        )}
        <p className="text-muted-foreground text-xs">
          Minimum {MIN_DEADLINE_DAYS} days from today. Orders under{" "}
          {RUSH_THRESHOLD_DAYS} days are marked as rush.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm">
          Additional notes{" "}
          <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="notes"
          placeholder="Any other details for the designer..."
          value={notes}
          onChange={(e) => setField("notes", e.target.value)}
          maxLength={500}
          rows={3}
          className="resize-none"
        />
        <p className="text-muted-foreground text-xs tabular-nums">
          {notes.length} / 500 characters
        </p>
      </div>
    </div>
  );
}
