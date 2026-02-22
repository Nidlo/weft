"use client";

import { useOnboardingStore } from "@/lib/stores/onboarding";
import { useCities } from "@/lib/hooks/use-cities";
import { useMutation } from "@apollo/client/react";
import { CREATE_CITY } from "@/lib/graphql/mutations/lookup";
import { GET_CITIES } from "@/lib/graphql/queries/designer";
import type { CreateCityData } from "@/types/graphql";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState, useCallback } from "react";

export function StepBasicInfo() {
  const { firstName, lastName, otherNames, displayName, bio, city, locationLat, locationLng, setField } =
    useOnboardingStore();
  const { cities } = useCities("GH");
  const [citySearch, setCitySearch] = useState(city);
  const [showCities, setShowCities] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  const [createCity, { loading: creatingCity }] = useMutation(CREATE_CITY, {
    refetchQueries: [{ query: GET_CITIES, variables: { countryCode: "GH" } }],
  });

  const filteredCities = cities.filter((c) =>
    c.name.toLowerCase().includes(citySearch.toLowerCase())
  );

  const canAddCity =
    citySearch.trim().length >= 2 &&
    filteredCities.length === 0 &&
    !creatingCity;

  const handleAddCity = async () => {
    const name = citySearch.trim();
    if (name.length < 2) return;

    try {
      const { data } = await createCity({
        variables: { name, countryCode: "GH" },
      });
      const result = data as CreateCityData | undefined;

      if (result?.createCity) {
        setCitySearch(result.createCity.name);
        setField("city", result.createCity.name);
        setShowCities(false);
        toast.success(`Added "${result.createCity.name}"`);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to add city";
      toast.error(message);
    }
  };

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported by your browser");
      return;
    }

    setLocLoading(true);
    setLocError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setField("locationLat", position.coords.latitude);
        setField("locationLng", position.coords.longitude);
        setLocLoading(false);
        toast.success("Location captured");
      },
      (err) => {
        setLocError(err.message);
        setLocLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, [setField]);

  const hasLocation = locationLat !== null && locationLng !== null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            placeholder="e.g. Kofi"
            value={firstName}
            onChange={(e) => setField("firstName", e.target.value)}
            maxLength={100}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            placeholder="e.g. Mensah"
            value={lastName}
            onChange={(e) => setField("lastName", e.target.value)}
            maxLength={100}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="otherNames">Other Names</Label>
        <Input
          id="otherNames"
          placeholder="Middle name or other names (optional)"
          value={otherNames}
          onChange={(e) => setField("otherNames", e.target.value)}
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="displayName">Business / Display Name</Label>
        <Input
          id="displayName"
          placeholder="e.g. Kofi's Designs (optional)"
          value={displayName}
          onChange={(e) => setField("displayName", e.target.value)}
          maxLength={100}
        />
        <p className="text-xs text-muted-foreground">
          This is the name clients will see. If blank, your full name is used.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          placeholder="Tell clients about your experience, style, and what makes you unique..."
          value={bio}
          onChange={(e) => setField("bio", e.target.value)}
          rows={4}
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground">
          {bio.length}/500 characters
        </p>
      </div>

      <div className="relative space-y-2">
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          placeholder="Search for your city..."
          value={citySearch}
          onChange={(e) => {
            setCitySearch(e.target.value);
            setShowCities(true);
          }}
          onFocus={() => setShowCities(true)}
          onBlur={() => setTimeout(() => setShowCities(false), 200)}
        />
        {showCities && citySearch && filteredCities.length > 0 && (
          <div className="absolute top-full z-10 mt-1 w-full rounded-md border border-border bg-popover shadow-md">
            {filteredCities.map((c) => (
              <button
                key={c.id}
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setCitySearch(c.name);
                  setField("city", c.name);
                  setShowCities(false);
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
        {showCities && citySearch.trim().length >= 2 && filteredCities.length === 0 && (
          <div className="absolute top-full z-10 mt-1 w-full rounded-md border border-border bg-popover p-3 shadow-md">
            <p className="mb-2 text-sm text-muted-foreground">
              No cities found for &quot;{citySearch}&quot;
            </p>
            {canAddCity && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCity}
                disabled={creatingCity}
                className="w-full"
              >
                {creatingCity ? "Adding..." : `Add "${citySearch.trim()}" as new city`}
              </Button>
            )}
          </div>
        )}
        {city && (
          <p className="text-xs text-muted-foreground">Selected: {city}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Location (optional)</Label>
        <p className="text-xs text-muted-foreground">
          Helps clients find designers near them.
        </p>
        {hasLocation ? (
          <Badge variant="secondary">Location captured</Badge>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={requestLocation}
            disabled={locLoading}
          >
            {locLoading ? "Detecting..." : "Use my location"}
          </Button>
        )}
        {locError && (
          <p className="text-xs text-destructive">{locError}</p>
        )}
      </div>
    </div>
  );
}
