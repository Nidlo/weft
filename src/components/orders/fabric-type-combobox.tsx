"use client";

import { useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BlueprintOption } from "@/types/graphql";
import { useCreateBlueprintOption } from "@/lib/hooks/use-orders";
import { toast } from "sonner";

interface FabricTypeComboboxProps {
  options: BlueprintOption[];
  selected: string[];
  onChange: (values: string[]) => void;
}

export function FabricTypeCombobox({
  options,
  selected,
  onChange,
}: FabricTypeComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  // Session-local cache of user-submitted entries that are awaiting admin
  // approval - keeps the proper label on the chip after creation.
  const [localAdditions, setLocalAdditions] = useState<BlueprintOption[]>([]);
  const { createBlueprintOption, loading: creating } =
    useCreateBlueprintOption();

  const mergedOptions = [...options, ...localAdditions];

  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };

  const remove = (value: string) => {
    onChange(selected.filter((v) => v !== value));
  };

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
      "fabric_type",
      slug,
      search.trim()
    );
    if (result) {
      setLocalAdditions((prev) =>
        prev.some((o) => o.value === result.value) ? prev : [...prev, result]
      );
      onChange([...selected, result.value]);
      setSearch("");
      toast.success(
        `"${result.label}" submitted - visible to others once approved`
      );
    }
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="text-muted-foreground w-full justify-start font-normal"
          >
            {selected.length > 0
              ? `${selected.length} fabric${selected.length !== 1 ? "s" : ""} selected`
              : "Select fabric types..."}
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
                <CommandEmpty>No fabric types found.</CommandEmpty>
              )}
              {filtered.length > 0 && (
                <CommandGroup>
                  {filtered.map((opt) => (
                    <CommandItem
                      key={opt.value}
                      value={opt.value}
                      onSelect={() => toggle(opt.value)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selected.includes(opt.value)
                            ? "opacity-100"
                            : "opacity-0"
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
                      : `Add "${search.trim()}" as fabric type`}
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((v) => {
            const label = mergedOptions.find((o) => o.value === v)?.label ?? v;
            return (
              <Badge key={v} variant="secondary" className="text-xs">
                {label}
                <button
                  type="button"
                  onClick={() => remove(v)}
                  className="ml-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
