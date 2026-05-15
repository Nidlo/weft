"use client";

import { useEffect } from "react";
import type Echo from "laravel-echo";

// Pusher's connection emits state_change events. We only care about the
// disconnected/unavailable/connecting -> connected transition (a true
// reconnect), not the first connect — the host page already loaded its data.
interface PusherStateChange {
  previous: string;
  current: string;
}

const RECONNECT_FROM = new Set([
  "disconnected",
  "unavailable",
  "connecting",
  "failed",
]);

/**
 * Fires `onReconnect` when the Echo websocket goes from a non-connected
 * state back to `connected`. Use it to refetch any data that may have
 * gone stale while the socket was down.
 */
export function useEchoReconnect(
  echo: Echo<"reverb"> | null,
  onReconnect: () => void
) {
  useEffect(() => {
    if (!echo) return;

    // laravel-echo's reverb connector exposes the underlying pusher connection
    // via .pusher. Type-narrow defensively — Echo's typings don't surface it.
    const pusher = (
      echo.connector as unknown as {
        pusher?: {
          connection?: {
            bind: (
              event: string,
              cb: (data: PusherStateChange) => void
            ) => void;
            unbind: (
              event: string,
              cb: (data: PusherStateChange) => void
            ) => void;
          };
        };
      }
    ).pusher;

    const connection = pusher?.connection;
    if (!connection) return;

    const handler = (state: PusherStateChange) => {
      if (state.current === "connected" && RECONNECT_FROM.has(state.previous)) {
        onReconnect();
      }
    };

    connection.bind("state_change", handler);
    return () => connection.unbind("state_change", handler);
  }, [echo, onReconnect]);
}
