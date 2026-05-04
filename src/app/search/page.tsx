"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { DesignerCard } from "@/components/shared/designer-card";
import { useDesignerSearch } from "@/lib/hooks/use-designer-search";
import { useSpecializations } from "@/lib/hooks/use-specializations";
import { useCities } from "@/lib/hooks/use-cities";
import { useGeolocation } from "@/lib/hooks/use-geolocation";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import type { SearchDesignersInput } from "@/types/graphql";
import { Search, SlidersHorizontal, X } from "lucide-react";

export default function SearchPage() {
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
    lat: sortBy === "nearest" && lat ? lat : undefined,
    lng: sortBy === "nearest" && lng ? lng : undefined,
  };

  const { designers, loading, error, hasMore, loadMore } = useDesignerSearch(input);

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
    { value: "rating", label: "Top Rated" },
    { value: "newest", label: "Newest" },
    { value: "price_low", label: "Price: Low" },
    { value: "price_high", label: "Price: High" },
    ...(lat && lng ? [{ value: "nearest", label: "Nearest" }] : []),
  ];

  const filterPanel = (
    <div className="space-y-6">
      {/* City */}
      <div className="space-y-2">
        <Label>City</Label>
        <Select
          value={city || "all"}
          onValueChange={(v) => setCity(v === "all" ? "" : v)}
        >
          <SelectTrigger>
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

      {/* Price Range */}
      <div className="space-y-2">
        <Label>Price range (GHS)</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            min={0}
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            min={0}
          />
        </div>
      </div>

      {/* Minimum Rating */}
      <div className="space-y-2">
        <Label>Minimum rating</Label>
        <Select
          value={minRating || "any"}
          onValueChange={(v) => setMinRating(v === "any" ? "" : v)}
        >
          <SelectTrigger>
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

      {/* Accepting Orders */}
      <div className="flex items-center justify-between">
        <Label htmlFor="accepting-orders">Accepting orders only</Label>
        <Switch
          id="accepting-orders"
          checked={acceptingOnly}
          onCheckedChange={setAcceptingOnly}
        />
      </div>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="w-full"
        >
          <X className="mr-1 h-4 w-4" />
          Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <AppShell>
      <div className="space-y-4">
        {/* Search Bar + Filter Button */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search designers by name or keyword..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative"
                aria-label={
                  activeFilterCount > 0
                    ? `Filters, ${activeFilterCount} active`
                    : "Filters"
                }
              >
                <SlidersHorizontal className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Narrow down your search results
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">{filterPanel}</div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Quick Filter Chips */}
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2 pb-2">
            {quickFilters.map((spec) => (
              <Badge
                key={spec.id}
                variant={
                  selectedSpecs.includes(spec.slug) ? "default" : "outline"
                }
                className="shrink-0 cursor-pointer"
                onClick={() => toggleSpec(spec.slug)}
              >
                {spec.name}
              </Badge>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Sort Options */}
        <div className="flex gap-2 text-sm">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSortBy(option.value)}
              className={`rounded-full px-3 py-1 transition-colors ${
                sortBy === option.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Active Filter Tags */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {city && (
              <Badge variant="secondary" className="gap-1">
                {city}
                <button
                  type="button"
                  aria-label={`Remove ${city} filter`}
                  onClick={() => setCity("")}
                  className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {(priceMin || priceMax) && (
              <Badge variant="secondary" className="gap-1">
                GHS {priceMin || "0"} - {priceMax || "any"}
                <button
                  type="button"
                  aria-label="Remove price filter"
                  onClick={() => {
                    setPriceMin("");
                    setPriceMax("");
                  }}
                  className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {minRating && (
              <Badge variant="secondary" className="gap-1">
                {minRating}+ stars
                <button
                  type="button"
                  aria-label="Remove rating filter"
                  onClick={() => setMinRating("")}
                  className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {acceptingOnly && (
              <Badge variant="secondary" className="gap-1">
                Accepting orders
                <button
                  type="button"
                  aria-label="Remove accepting orders filter"
                  onClick={() => setAcceptingOnly(false)}
                  className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Results */}
        <div className="space-y-3">
          {designers.map((designer) => (
            <DesignerCard key={designer.id} designer={designer} />
          ))}

          {/* Loading skeletons */}
          {loading && designers.length === 0 && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="flex gap-3">
                    <Skeleton className="h-14 w-14 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="py-12 text-center">
              <p className="text-lg font-medium">Something went wrong</p>
              <p className="mt-1 text-sm text-muted-foreground">
                We couldn&apos;t load designers. Check your connection and try again.
              </p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && designers.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-lg font-medium">No designers found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          )}

          {/* Infinite scroll trigger */}
          <div ref={observerRef} className="h-4" />

          {/* Loading more indicator */}
          {loading && designers.length > 0 && (
            <div className="flex justify-center py-4">
              <Button type="button" variant="ghost" disabled>
                Loading more...
              </Button>
            </div>
          )}

          {/* End of results */}
          {!hasMore && designers.length > 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Showing all {designers.length} designers
            </p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
