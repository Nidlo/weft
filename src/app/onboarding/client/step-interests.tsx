"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_FASHION_INTERESTS } from "@/lib/graphql/queries/designer";
import type { FashionInterestsData } from "@/types/graphql";
import { useClientOnboardingStore } from "@/lib/stores/client-onboarding";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const GENDER_OPTIONS = [
  { value: "women", label: "Women's fashion" },
  { value: "men", label: "Men's fashion" },
  { value: "both", label: "Both" },
  { value: "children", label: "Children's fashion" },
];

export function StepInterests() {
  const { fashionInterests, genderPreference, setField } =
    useClientOnboardingStore();
  const [search, setSearch] = useState("");

  const { data, loading } = useQuery<FashionInterestsData>(
    GET_FASHION_INTERESTS
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

  const categoryLabels: Record<string, string> = {
    style: "Style",
    occasion: "Occasion",
    culture: "Cultural",
    fabric: "Fabric & Material",
    other: "Other",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">What are you interested in?</h2>
        <p className="text-sm text-muted-foreground">
          Select your fashion interests so we can match you with the right
          designers. This is optional — you can skip this step.
        </p>
      </div>

      <div className="space-y-3">
        <Label>Fashion preference</Label>
        <div className="flex flex-wrap gap-2">
          {GENDER_OPTIONS.map((opt) => (
            <Badge
              key={opt.value}
              variant={genderPreference === opt.value ? "default" : "outline"}
              className="cursor-pointer px-3 py-1.5 text-sm"
              onClick={() =>
                setField(
                  "genderPreference",
                  genderPreference === opt.value ? "" : opt.value
                )
              }
            >
              {opt.label}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Fashion interests</Label>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search interests..."
        />

        {loading ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {categoryLabels[category] ?? category}
                </p>
                <div className="flex flex-wrap gap-2">
                  {items.map((interest) => {
                    const selected = fashionInterests.includes(interest.name);
                    return (
                      <Badge
                        key={interest.id}
                        variant={selected ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer px-3 py-1.5 text-sm transition-colors",
                          selected && "bg-primary text-primary-foreground"
                        )}
                        onClick={() => toggleInterest(interest.name)}
                      >
                        {interest.name}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {fashionInterests.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {fashionInterests.length} selected
          </p>
        )}
      </div>
    </div>
  );
}
