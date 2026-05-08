"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { motion, useReducedMotion } from "motion/react";
import { Heart, Search, Sparkles } from "lucide-react";

import { GET_FASHION_INTERESTS } from "@/lib/graphql/queries/designer";
import type { FashionInterestsData } from "@/types/graphql";
import { useClientOnboardingStore } from "@/lib/stores/client-onboarding";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const GENDER_OPTIONS = [
  { value: "women", label: "Women's fashion" },
  { value: "men", label: "Men's fashion" },
  { value: "both", label: "Both" },
  { value: "children", label: "Children's fashion" },
];

const CATEGORY_LABELS: Record<string, string> = {
  style: "Style",
  occasion: "Occasion",
  culture: "Cultural",
  fabric: "Fabric & material",
  other: "Other",
};

export function StepInterests() {
  const { fashionInterests, genderPreference, setField } =
    useClientOnboardingStore();
  const [search, setSearch] = useState("");
  const reduced = useReducedMotion();

  const { data, loading } = useQuery<FashionInterestsData>(
    GET_FASHION_INTERESTS,
    { fetchPolicy: "cache-first" }
  );

  const interests = data?.fashionInterests ?? [];
  const filtered = search
    ? interests.filter((i) =>
        i.name.toLowerCase().includes(search.toLowerCase())
      )
    : interests;

  const grouped = filtered.reduce<Record<string, typeof filtered>>(
    (acc, item) => {
      const cat = item.category ?? "other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    },
    {}
  );

  const toggleInterest = (name: string) => {
    const current = [...fashionInterests];
    const idx = current.indexOf(name);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(name);
    }
    setField("fashionInterests", current);
  };

  return (
    <div className="space-y-7">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground">
          <Heart className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <h2 className="text-display text-lg font-semibold tracking-tight">
            What styles speak to you?
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Optional. We use these to recommend designers and tailors who match
            your taste.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm">I shop for</Label>
        <div className="flex flex-wrap gap-2">
          {GENDER_OPTIONS.map((opt) => {
            const isActive = genderPreference === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setField(
                    "genderPreference",
                    isActive ? "" : opt.value
                  )
                }
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium",
                  "transition-all duration-200 hover:-translate-y-0.5",
                  isActive
                    ? "bg-foreground text-background shadow-(--shadow-2)"
                    : "border border-border bg-card hover:border-foreground/30"
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-sm">Fashion interests</Label>
          {fashionInterests.length > 0 && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-copper">
              {fashionInterests.length} selected
            </p>
          )}
        </div>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Ankara, kente, suits, evening wear..."
            className="h-11 pl-9"
          />
        </div>

        {loading ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-copper" aria-hidden />
                  {CATEGORY_LABELS[category] ?? category}
                </p>
                <div className="flex flex-wrap gap-2">
                  {items.map((interest, i) => {
                    const selected = fashionInterests.includes(interest.name);
                    return (
                      <motion.button
                        key={interest.id}
                        type="button"
                        onClick={() => toggleInterest(interest.name)}
                        initial={reduced ? false : { opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.25,
                          delay: reduced ? 0 : Math.min(i, 8) * 0.02,
                        }}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium",
                          "transition-all duration-200 hover:-translate-y-0.5",
                          selected
                            ? "bg-foreground text-background shadow-(--shadow-1)"
                            : "border border-border bg-card hover:border-foreground/30"
                        )}
                      >
                        {interest.name}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
