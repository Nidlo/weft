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

interface ItemTypeComboboxProps {
  options: BlueprintOption[];
  value: string;
  onChange: (value: string) => void;
}

/**
 * Single-select picker for the `item_type` blueprint_options category.
 * Mirrors GarmentTypeCombobox - same UX, different category. The "+ Add
 * new" affordance routes through createBlueprintOption; new entries land
 * is_pending=true so they're only visible to the submitter until an admin
 * approves them in Filament.
 */
export function ItemTypeCombobox({
  options,
  value,
  onChange,
}: ItemTypeComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
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
      "item_type",
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
          {value ? selectedLabel : "Select item type..."}
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
              <CommandEmpty>No item types found.</CommandEmpty>
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
                    : `Add "${search.trim()}" as an item type`}
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
