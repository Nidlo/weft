"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface GeolocationState {
  lat: number | null;
  lng: number | null;
  error: string | null;
  loading: boolean;
}

const INITIAL_STATE: GeolocationState = {
  lat: null,
  lng: null,
  error: null,
  loading: false,
};

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>(INITIAL_STATE);
  const requestedRef = useRef(false);

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState((s) => ({ ...s, error: "Geolocation not supported" }));
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          error: null,
          loading: false,
        });
      },
      (err) => {
        setState((s) => ({ ...s, error: err.message, loading: false }));
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  // Auto-request on mount. We inline the geolocation call so all setState
  // happens inside the async browser callback (not synchronously in the
  // effect body) — required by the React 19 cascading-render rule.
  useEffect(() => {
    if (requestedRef.current) return;
    requestedRef.current = true;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return;
        setState({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          error: null,
          loading: false,
        });
      },
      (err) => {
        if (cancelled) return;
        setState((s) => ({ ...s, error: err.message, loading: false }));
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
    return () => {
      cancelled = true;
    };
  }, []);

  return { ...state, request };
}
