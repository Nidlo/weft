"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Search, SearchX, Sparkles, SlidersHorizontal, X } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { DesignerCard } from "@/components/shared/designer-card";
import { useDesignerSearch } from "@/lib/hooks/use-designer-search";
import { useSpecializations } from "@/lib/hooks/use-specializations";
import { useCities } from "@/lib/hooks/use-cities";
import { useGeolocation } from "@/lib/hooks/use-geolocation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { SearchDesignersInput } from "@/types/graphql";

export function SearchClient() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("recommended");
  const [city, setCity] = useState<string>("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [minRating, setMinRating] = useState<string>("");
  const [acceptingOnly, setAcceptingOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const { quickFilters } = useSpecializations();
  const { cities } = useCities();
  const { lat, lng } = useGeolocation();

  const input: SearchDesignersInput = {
    query: debouncedQuery || undefined,
    specializations: selectedSpecs.length > 0 ? selectedSpecs : undefined,
    city: city || undefined,
    priceMin: priceMin ? Number(priceMin) * 100 : undefined,
    priceMax: priceMax ? Number(priceMax) * 100 : undefined,
    minRating: minRating ? Number(minRating) : undefined,
    acceptingOnly: acceptingOnly || undefined,
    sortBy,
    // Send coordinates whenever we have them, not only in "nearest"
    // sort. This is what makes the km label show on every card and lets
    // the "recommended" sort factor in proximity. Designers far away are
    // still returned (no radius cutoff) - distance only ranks, never
    // filters.
    lat: lat ?? undefined,
    lng: lng ?? undefined,
  };

  const { designers, loading, error, hasMore, loadMore } =
    useDesignerSearch(input);

  // Debounce search input
  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(value);
    }, 400);
  }, []);

  const toggleSpec = (slug: string) => {
    setSelectedSpecs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const activeFilterCount = [
    city,
    priceMin,
    priceMax,
    minRating,
    acceptingOnly,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setCity("");
    setPriceMin("");
    setPriceMax("");
    setMinRating("");
    setAcceptingOnly(false);
  };

  // Infinite scroll observer
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  const sortOptions = [
    { value: "recommended", label: "Recommended" },
    { value: "rating", label: "Top rated" },
    { value: "newest", label: "Newest" },
    { value: "price_low", label: "Price · Low" },
    { value: "price_high", label: "Price · High" },
    ...(lat && lng ? [{ value: "nearest", label: "Nearest" }] : []),
  ];

  const filterPanel = (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm">City</Label>
        <Select
          value={city || "all"}
          onValueChange={(v) => setCity(v === "all" ? "" : v)}
        >
          <SelectTrigger className="h-11">
            <SelectValue placeholder="All cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cities</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c.id} value={c.name}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Price range (GHS)</Label>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="relative">
            <span
              className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-xs font-semibold"
              aria-hidden
            >
              GHS
            </span>
            <Input
              type="number"
              placeholder="Min"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              min={0}
              className="h-11 pl-12 tabular-nums"
              aria-label="Minimum price"
            />
          </div>
          <span className="text-muted-foreground">to</span>
          <div className="relative">
            <span
              className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-xs font-semibold"
              aria-hidden
            >
              GHS
            </span>
            <Input
              type="number"
              placeholder="Max"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              min={0}
              className="h-11 pl-12 tabular-nums"
              aria-label="Maximum price"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Minimum rating</Label>
        <Select
          value={minRating || "any"}
          onValueChange={(v) => setMinRating(v === "any" ? "" : v)}
        >
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Any rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any rating</SelectItem>
            <SelectItem value="3">3+ stars</SelectItem>
            <SelectItem value="3.5">3.5+ stars</SelectItem>
            <SelectItem value="4">4+ stars</SelectItem>
            <SelectItem value="4.5">4.5+ stars</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <GlassCard
        variant="ghost"
        className="flex items-center justify-between p-4"
      >
        <Label htmlFor="accepting-orders" className="cursor-pointer text-sm">
          Accepting orders only
        </Label>
        <Switch
          id="accepting-orders"
          checked={acceptingOnly}
          onCheckedChange={setAcceptingOnly}
        />
      </GlassCard>

      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-muted-foreground hover:text-foreground w-full gap-1.5"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
          Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <AppShell>
      <div className="space-y-7">
        <header>
          <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
            Discover
          </p>
          <h1 className="text-display mt-2 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
            Find your designer
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm sm:text-base">
            Search tailors, seamstresses, and fashion designers by craft,
            location, price, or rating.
          </p>
        </header>

        {/* Search bar + filter trigger */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              className="text-copper absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2"
              aria-hidden
            />
            <Input
              placeholder="Search designers by name or keyword"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="h-12 rounded-full pl-10 text-base"
              aria-label="Search designers"
            />
          </div>
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button
                variant="luxe-outline"
                size="lg"
                className="relative h-12 gap-1.5 rounded-full px-5"
                aria-label={
                  activeFilterCount > 0
                    ? `Filters, ${activeFilterCount} active`
                    : "Filters"
                }
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-copper text-foreground ml-0.5 inline-flex size-5 items-center justify-center rounded-full text-[10px] font-bold tabular-nums">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="max-h-[85vh] overflow-y-auto"
            >
              <SheetHeader>
                <SheetTitle className="text-display text-2xl font-semibold tracking-tight">
                  Filters
                </SheetTitle>
                <SheetDescription>
                  Narrow down your search results.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 px-4 pb-4">{filterPanel}</div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Quick filter chip rail */}
        {quickFilters.length > 0 && (
          <ScrollArea className="-mx-4 w-screen sm:mx-0 sm:w-full">
            <div className="flex gap-2 px-4 pb-2 sm:px-0">
              {quickFilters.map((spec) => {
                const isActive = selectedSpecs.includes(spec.slug);
                return (
                  <button
                    key={spec.id}
                    type="button"
                    onClick={() => toggleSpec(spec.slug)}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium",
                      "transition-all duration-200 hover:-translate-y-0.5",
                      isActive
                        ? "bg-foreground text-background shadow-(--shadow-2)"
                        : "border-border bg-card hover:border-foreground/30 border"
                    )}
                  >
                    <span
                      className={cn(
                        "size-1 rounded-full transition-transform",
                        isActive ? "bg-copper scale-150" : "bg-copper"
                      )}
                      aria-hidden
                    />
                    {spec.name}
                  </button>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}

        {/* Sort options pill bar */}
        <ScrollArea className="-mx-4 w-screen sm:mx-0 sm:w-full">
          <div className="border-border bg-card mx-4 flex gap-1 rounded-full border p-1 sm:mx-0 sm:w-fit">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSortBy(option.value)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  sortBy === option.value
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Active filter tags */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {city && (
              <FilterTag
                label={city}
                onRemove={() => setCity("")}
                ariaLabel={`Remove ${city} filter`}
              />
            )}
            {(priceMin || priceMax) && (
              <FilterTag
                label={`GHS ${priceMin || "0"} to ${priceMax || "any"}`}
                onRemove={() => {
                  setPriceMin("");
                  setPriceMax("");
                }}
                ariaLabel="Remove price filter"
              />
            )}
            {minRating && (
              <FilterTag
                label={`${minRating}+ stars`}
                onRemove={() => setMinRating("")}
                ariaLabel="Remove rating filter"
              />
            )}
            {acceptingOnly && (
              <FilterTag
                label="Accepting orders"
                onRemove={() => setAcceptingOnly(false)}
                ariaLabel="Remove accepting orders filter"
              />
            )}
          </div>
        )}

        {/* Results */}
        <div className="space-y-3">
          {designers.map((designer) => (
            <DesignerCard key={designer.id} designer={designer} />
          ))}

          {/* Loading skeletons match the DesignerCard layout below. */}
          {loading && designers.length === 0 && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="border-border bg-card rounded-2xl border p-5"
                >
                  <div className="flex gap-4">
                    <Skeleton className="h-14 w-14 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-1.5">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <GlassCard
              variant="solid"
              className="flex flex-col items-center py-16 text-center"
            >
              <span className="bg-status-error-soft text-status-error flex size-16 items-center justify-center rounded-2xl">
                <SearchX className="h-7 w-7" aria-hidden />
              </span>
              <h2 className="text-display mt-5 text-2xl font-semibold tracking-tight">
                Something went wrong.
              </h2>
              <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm">
                We couldn&apos;t load designers. Check your connection and try
                again.
              </p>
            </GlassCard>
          )}

          {/* Empty state */}
          {!loading && !error && designers.length === 0 && (
            <GlassCard
              variant="solid"
              className="flex flex-col items-center py-16 text-center"
            >
              <span className="bg-secondary text-foreground flex size-16 items-center justify-center rounded-2xl">
                <Sparkles className="h-7 w-7" aria-hidden />
              </span>
              <h2 className="text-display mt-5 text-2xl font-semibold tracking-tight">
                No designers found.
              </h2>
              <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm">
                Try adjusting your search or clearing some filters.
              </p>
              {activeFilterCount > 0 && (
                <Button
                  variant="luxe-outline"
                  size="lg"
                  className="mt-6 gap-1.5"
                  onClick={clearFilters}
                >
                  <X className="h-4 w-4" aria-hidden />
                  Clear all filters
                </Button>
              )}
            </GlassCard>
          )}

          {/* Infinite scroll trigger */}
          <div ref={observerRef} className="h-4" />

          {/* Loading more indicator */}
          {loading && designers.length > 0 && (
            <div className="flex justify-center py-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled
                className="text-muted-foreground"
              >
                Loading more
              </Button>
            </div>
          )}

          {/* End of results */}
          {!hasMore && designers.length > 0 && (
            <p className="text-muted-foreground py-4 text-center text-xs font-semibold tracking-[0.16em] uppercase">
              All{" "}
              <span className="text-foreground tabular-nums">
                {designers.length}
              </span>{" "}
              designers shown
            </p>
          )}
        </div>
      </div>
    </AppShell>
  );
}

interface FilterTagProps {
  label: string;
  onRemove: () => void;
  ariaLabel: string;
}

function FilterTag({ label, onRemove, ariaLabel }: FilterTagProps) {
  return (
    <span className="border-border bg-card inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
      <span className="bg-copper size-1 rounded-full" aria-hidden />
      {label}
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={onRemove}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring ml-0.5 rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        <X className="h-3 w-3" aria-hidden />
      </button>
    </span>
  );
}
