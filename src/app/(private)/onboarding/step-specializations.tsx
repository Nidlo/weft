"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { motion, useReducedMotion } from "motion/react";
import { Plus, Search, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

import { useOnboardingStore } from "@/lib/stores/onboarding";
import { useSpecializations } from "@/lib/hooks/use-specializations";
import { CREATE_SPECIALIZATION } from "@/lib/graphql/mutations/lookup";
import { GET_SPECIALIZATIONS } from "@/lib/graphql/queries/designer";
import type { CreateSpecializationData } from "@/types/graphql";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function StepSpecializations() {
  const { specializations: selected, setField } = useOnboardingStore();
  const { specializations: allSpecs, loading } = useSpecializations();
  const [search, setSearch] = useState("");
  const [createSpecialization, { loading: creating }] = useMutation(
    CREATE_SPECIALIZATION,
    { refetchQueries: [{ query: GET_SPECIALIZATIONS }] }
  );
  const reduced = useReducedMotion();

  const filtered = allSpecs.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (slug: string) => {
    if (selected.includes(slug)) {
      setField(
        "specializations",
        selected.filter((s) => s !== slug)
      );
    } else {
      setField("specializations", [...selected, slug]);
    }
  };

  const getSpecName = (slug: string) =>
    allSpecs.find((s) => s.slug === slug)?.name ?? slug;

  const handleAddCustom = async () => {
    const name = search.trim();
    if (name.length < 2) return;

    try {
      const { data } = await createSpecialization({ variables: { name } });
      const result = data as CreateSpecializationData | undefined;

      if (result?.createSpecialization) {
        const newSlug = result.createSpecialization.slug;
        if (!selected.includes(newSlug)) {
          setField("specializations", [...selected, newSlug]);
        }
        setSearch("");
        toast.success(`Added "${result.createSpecialization.name}"`);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to add specialization";
      toast.error(message);
    }
  };

  const canAddCustom =
    search.trim().length >= 2 && filtered.length === 0 && !creating;

  return (
    <div className="space-y-7">
      <div className="flex items-start gap-3">
        <span className="bg-secondary text-foreground flex size-9 shrink-0 items-center justify-center rounded-xl">
          <Sparkles className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <h2 className="text-display text-lg font-semibold tracking-tight">
            What do you specialize in?
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Pick at least one. Clients filter designers by these — the more
            relevant tags, the more inquiries.
          </p>
        </div>
      </div>

      <div className="relative">
        <Search
          className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
          aria-hidden
        />
        <Input
          placeholder="Search Kaba & Slit, Wedding gown, Agbada..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 pl-9"
        />
      </div>

      {loading ? (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-full" />
          ))}
        </div>
      ) : (
        <>
          {selected.length > 0 && (
            <div>
              <p className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-[0.16em] uppercase">
                {selected.length} selected
              </p>
              <div className="flex flex-wrap gap-2">
                {selected.map((slug) => (
                  <motion.button
                    key={slug}
                    type="button"
                    onClick={() => toggle(slug)}
                    initial={reduced ? false : { scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className={cn(
                      "bg-foreground text-background inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium",
                      "hover:bg-foreground/85 transition-all duration-200"
                    )}
                  >
                    {getSpecName(slug)}
                    <X className="h-3 w-3" aria-hidden />
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          <div>
            {selected.length > 0 && (
              <p className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-[0.16em] uppercase">
                Add more
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {filtered.map((spec, i) => {
                const isSelected = selected.includes(spec.slug);
                if (isSelected) return null;
                return (
                  <motion.button
                    key={spec.id}
                    type="button"
                    onClick={() => toggle(spec.slug)}
                    initial={reduced ? false : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: reduced ? 0 : Math.min(i, 12) * 0.02,
                    }}
                    className={cn(
                      "border-border bg-card inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium",
                      "hover:border-foreground/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-(--shadow-1)"
                    )}
                  >
                    <Plus className="text-copper h-3 w-3" aria-hidden />
                    {spec.name}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {filtered.length === 0 && search.trim().length > 0 && (
            <GlassCard variant="ghost" className="p-4 text-center">
              <p className="text-muted-foreground text-sm">
                No matches for{" "}
                <span className="text-foreground font-medium">
                  &ldquo;{search}&rdquo;
                </span>
              </p>
              {canAddCustom && (
                <Button
                  type="button"
                  variant="luxe-outline"
                  size="sm"
                  onClick={handleAddCustom}
                  disabled={creating}
                  className="mt-3"
                >
                  <Plus className="mr-1 h-3 w-3" aria-hidden />
                  {creating
                    ? "Adding..."
                    : `Add "${search.trim()}" as new specialization`}
                </Button>
              )}
            </GlassCard>
          )}
        </>
      )}
    </div>
  );
}
