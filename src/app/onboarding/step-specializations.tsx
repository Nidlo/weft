"use client";

import { useOnboardingStore } from "@/lib/stores/onboarding";
import { useSpecializations } from "@/lib/hooks/use-specializations";
import { useMutation } from "@apollo/client/react";
import { CREATE_SPECIALIZATION } from "@/lib/graphql/mutations/lookup";
import { GET_SPECIALIZATIONS } from "@/lib/graphql/queries/designer";
import type { CreateSpecializationData } from "@/types/graphql";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useState } from "react";

export function StepSpecializations() {
  const { specializations: selected, setField } = useOnboardingStore();
  const { specializations: allSpecs, loading } = useSpecializations();
  const [search, setSearch] = useState("");
  const [createSpecialization, { loading: creating }] = useMutation(
    CREATE_SPECIALIZATION,
    { refetchQueries: [{ query: GET_SPECIALIZATIONS }] }
  );

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

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24" />
          ))}
        </div>
      </div>
    );
  }

  const canAddCustom =
    search.trim().length >= 2 &&
    filtered.length === 0 &&
    !creating;

  return (
    <div className="space-y-6">
      <div>
        <Label>What do you specialize in? *</Label>
        <p className="mt-1 text-sm text-muted-foreground">
          Select at least one. Clients will filter by these.
        </p>
      </div>

      <Input
        placeholder="Search specializations..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((slug) => (
            <Badge
              key={slug}
              variant="default"
              className="cursor-pointer"
              onClick={() => toggle(slug)}
            >
              {getSpecName(slug)} &times;
            </Badge>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {filtered.map((spec) => {
          const isSelected = selected.includes(spec.slug);
          return (
            <Badge
              key={spec.id}
              variant={isSelected ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggle(spec.slug)}
            >
              {spec.name}
            </Badge>
          );
        })}
      </div>

      {filtered.length === 0 && search.trim().length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            No specializations found for &quot;{search}&quot;.
          </p>
          {canAddCustom && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddCustom}
              disabled={creating}
            >
              {creating ? "Adding..." : `Add "${search.trim()}" as new specialization`}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
