"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { BlueprintOption } from "@/types/graphql";
import { useCreateBlueprintOption } from "@/lib/hooks/use-orders";
import { toast } from "sonner";

interface GarmentTypeComboboxProps {
  options: BlueprintOption[];
  value: string;
  onChange: (value: string) => void;
}

export function GarmentTypeCombobox({
  options,
  value,
  onChange,
}: GarmentTypeComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  // User-submitted entries land server-side as `is_pending=true` until an
  // admin approves them in Filament, so they're excluded from the shared
  // `options` list. We keep a session-local copy so the user can still
  // see the proper label on the entry they just added (rather than the
  // slug fallback).
  const [localAdditions, setLocalAdditions] = useState<BlueprintOption[]>([]);
  const { createBlueprintOption, loading: creating } =
    useCreateBlueprintOption();

  const mergedOptions = [...options, ...localAdditions];

  const selectedLabel =
    mergedOptions.find((o) => o.value === value)?.label ?? value ?? "";

  const filtered = search
    ? mergedOptions.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase())
      )
    : mergedOptions;

  const exactMatch = mergedOptions.some(
    (o) => o.label.toLowerCase() === search.toLowerCase()
  );

  const handleCreate = async () => {
    if (!search.trim()) return;
    const slug = search
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");

    const result = await createBlueprintOption(
      "garment_type",
      slug,
      search.trim()
    );
    if (result) {
      setLocalAdditions((prev) =>
        prev.some((o) => o.value === result.value) ? prev : [...prev, result]
      );
      onChange(result.value);
      setOpen(false);
      setSearch("");
      toast.success(
        `"${result.label}" submitted - visible to others once approved`
      );
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {value ? selectedLabel : "Select garment type..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search or type new..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {filtered.length === 0 && !search && (
              <CommandEmpty>No garment types found.</CommandEmpty>
            )}
            {filtered.length > 0 && (
              <CommandGroup>
                {filtered.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    value={opt.value}
                    onSelect={(v) => {
                      onChange(v === value ? "" : v);
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === opt.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {opt.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {search.trim() && !exactMatch && (
              <CommandGroup heading="Create new">
                <CommandItem
                  onSelect={handleCreate}
                  disabled={creating}
                  className="text-primary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {creating
                    ? "Creating..."
                    : `Add "${search.trim()}" as garment type`}
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
