"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useGoogleMaps } from "@/lib/hooks/use-google-maps";
import type { LocationData } from "@/types/location";
import { cn } from "@/lib/utils";

interface LocationPickerProps {
  value?: Partial<LocationData> | null;
  onChange: (location: LocationData) => void;
  label?: string;
  placeholder?: string;
  showMap?: boolean;
  mapHeight?: string;
  className?: string;
  countryRestriction?: string[];
}

function extractLocationData(
  place: google.maps.places.PlaceResult | google.maps.GeocoderResult | null,
  latLng: { lat: number; lng: number }
): LocationData {
  const components = place?.address_components ?? [];
  const get = (type: string): string | null =>
    components.find((c) => c.types.includes(type))?.long_name ?? null;
  const getShort = (type: string): string | null =>
    components.find((c) => c.types.includes(type))?.short_name ?? null;

  return {
    lat: latLng.lat,
    lng: latLng.lng,
    formattedAddress:
      ("formatted_address" in (place ?? {})
        ? (place as { formatted_address?: string })?.formatted_address
        : undefined) ?? `${latLng.lat.toFixed(6)}, ${latLng.lng.toFixed(6)}`,
    city: get("locality") ?? get("administrative_area_level_2"),
    region: get("administrative_area_level_1"),
    country: get("country"),
    countryCode: getShort("country"),
    postalCode: get("postal_code"),
    addressLine:
      [get("street_number"), get("route")].filter(Boolean).join(" ") || null,
  };
}

export function LocationPicker({
  value,
  onChange,
  label = "Location",
  placeholder = "Search for a location...",
  showMap = true,
  mapHeight = "300px",
  className,
  countryRestriction,
}: LocationPickerProps) {
  const { isLoaded, error: mapsError } = useGoogleMaps();
  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const [searchValue, setSearchValue] = useState(
    value?.formattedAddress ?? ""
  );
  const [detecting, setDetecting] = useState(false);

  const defaultCenter = {
    lat: value?.lat ?? 5.6037,
    lng: value?.lng ?? -0.187,
  };

  const updateMarker = useCallback((lat: number, lng: number) => {
    const position = { lat, lng };
    if (markerRef.current) {
      markerRef.current.setPosition(position);
    }
    mapInstanceRef.current?.panTo(position);
    mapInstanceRef.current?.setZoom(15);
  }, []);

  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      const geocoder = new google.maps.Geocoder();
      try {
        const response = await geocoder.geocode({
          location: { lat, lng },
        });
        if (response.results[0]) {
          const location = extractLocationData(response.results[0], {
            lat,
            lng,
          });
          setSearchValue(location.formattedAddress);
          onChange(location);
          return;
        }
      } catch {
        // Fallback to coordinates only
      }
      const location = extractLocationData(null, { lat, lng });
      setSearchValue(location.formattedAddress);
      onChange(location);
    },
    [onChange]
  );

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !showMap || !mapRef.current || mapInstanceRef.current)
      return;

    const map = new google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: value?.lat ? 15 : 12,
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: "greedy",
    });

    const marker = new google.maps.Marker({
      map,
      position: value?.lat
        ? { lat: value.lat, lng: value.lng! }
        : defaultCenter,
      draggable: true,
      visible: !!value?.lat,
    });

    marker.addListener("dragend", () => {
      const pos = marker.getPosition();
      if (pos) {
        reverseGeocode(pos.lat(), pos.lng());
      }
    });

    map.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        marker.setPosition({ lat, lng });
        marker.setVisible(true);
        reverseGeocode(lat, lng);
      }
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;
    // Intentional one-time map setup: re-running on `value` / `onChange` /
    // `reverseGeocode` would tear down the map element and re-instantiate it
    // on every keystroke. The map and marker hold their own state; the click
    // handler closure captures `reverseGeocode` once at construction. (H14.)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, showMap]);

  // Initialize autocomplete
  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

    const options: google.maps.places.AutocompleteOptions = {
      fields: ["formatted_address", "geometry", "address_components"],
      types: ["geocode", "establishment"],
    };

    if (countryRestriction?.length) {
      options.componentRestrictions = { country: countryRestriction };
    }

    const autocomplete = new google.maps.places.Autocomplete(
      inputRef.current,
      options
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry?.location) return;

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      const location = extractLocationData(place, { lat, lng });
      setSearchValue(location.formattedAddress);
      onChange(location);

      if (markerRef.current) {
        markerRef.current.setPosition({ lat, lng });
        markerRef.current.setVisible(true);
      }
      updateMarker(lat, lng);
    });

    autocompleteRef.current = autocomplete;
    // Intentional one-time autocomplete setup: the place_changed listener
    // closes over `onChange` / `updateMarker` once at construction. Re-running
    // on every value change would attach duplicate listeners and the dropdown
    // would stop behaving. (H14.)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  const detectCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setDetecting(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        if (markerRef.current) {
          markerRef.current.setVisible(true);
        }
        updateMarker(lat, lng);
        reverseGeocode(lat, lng).finally(() => setDetecting(false));
      },
      () => setDetecting(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [updateMarker, reverseGeocode]);

  if (mapsError) {
    return (
      <div className={cn("space-y-2", className)}>
        <Label>{label}</Label>
        <p className="text-destructive text-sm">{mapsError}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {label && <Label>{label}</Label>}

      <div className="relative flex gap-2">
        <Input
          ref={inputRef}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={isLoaded ? placeholder : "Loading maps..."}
          disabled={!isLoaded}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={detectCurrentLocation}
          disabled={!isLoaded || detecting}
          className="shrink-0"
        >
          {detecting ? (
            <svg
              className="size-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          ) : (
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
          )}
          <span className="ml-1 hidden sm:inline">
            {detecting ? "Detecting..." : "Use my location"}
          </span>
        </Button>
      </div>

      {showMap && (
        <div
          ref={mapRef}
          className="w-full rounded-lg border"
          style={{ height: mapHeight }}
        >
          {!isLoaded && (
            <div className="bg-muted flex h-full items-center justify-center rounded-lg">
              <p className="text-muted-foreground text-sm">Loading map...</p>
            </div>
          )}
        </div>
      )}

      {value?.formattedAddress && (
        <p className="text-muted-foreground text-xs">
          {value.formattedAddress}
          {value.city && ` - ${value.city}`}
          {value.region && `, ${value.region}`}
        </p>
      )}
    </div>
  );
}
