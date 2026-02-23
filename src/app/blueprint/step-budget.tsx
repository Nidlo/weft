"use client";

import { useBlueprintStore } from "@/lib/stores/blueprint";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

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
  const isRush = deadline && daysFromNow > 0 && daysFromNow < RUSH_THRESHOLD_DAYS;

  return (
    <div className="space-y-6">
      <div>
        <Label className="mb-3 block text-base font-semibold">
          Budget Range (GHS)
        </Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="budget-min">Minimum</Label>
            <Input
              id="budget-min"
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 200"
              value={budgetMin}
              onChange={(e) => setField("budgetMin", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget-max">Maximum</Label>
            <Input
              id="budget-max"
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 500"
              value={budgetMax}
              onChange={(e) => setField("budgetMax", e.target.value)}
            />
          </div>
        </div>
        {budgetMin && budgetMax && Number(budgetMax) < Number(budgetMin) && (
          <p className="mt-2 text-sm text-destructive">
            Maximum budget must be at least the minimum.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="deadline" className="text-base font-semibold">
          Deadline
        </Label>
        <Input
          id="deadline"
          type="date"
          min={getMinDate()}
          value={deadline}
          onChange={(e) => setField("deadline", e.target.value)}
        />
        {deadline && daysFromNow > 0 && (
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              {daysFromNow} day{daysFromNow !== 1 ? "s" : ""} from now
            </p>
            {isRush && <Badge variant="destructive">Rush Order</Badge>}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Minimum {MIN_DEADLINE_DAYS} days from today. Orders under{" "}
          {RUSH_THRESHOLD_DAYS} days are marked as rush.
        </p>
      </div>

      <div>
        <Label htmlFor="notes" className="mb-2 block text-base font-semibold">
          Additional Notes (optional)
        </Label>
        <Textarea
          id="notes"
          placeholder="Any other details for the designer..."
          value={notes}
          onChange={(e) => setField("notes", e.target.value)}
          maxLength={500}
          rows={3}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {notes.length} / 500 characters
        </p>
      </div>
    </div>
  );
}
