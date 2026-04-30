import Echo from "laravel-echo";
import Pusher from "pusher-js";
import type { ChannelAuthorizationData } from "pusher-js/types/src/core/auth/options";
import { useAuthStore } from "@/lib/stores/auth";

// Make Pusher available globally for Echo
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).Pusher = Pusher;
}

let echoInstance: Echo<"reverb"> | null = null;

export function getEcho(): Echo<"reverb"> | null {
  if (typeof window === "undefined") return null;

  if (echoInstance) return echoInstance;

  const isAuthenticated = useAuthStore.getState().isAuthenticated;
  if (!isAuthenticated) return null;

  echoInstance = new Echo({
    broadcaster: "reverb",
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY ?? "",
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST ?? "localhost",
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 443),
    forceTLS:
      (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "http") === "https",
    enabledTransports: ["ws", "wss"],
    authEndpoint:
      (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/graphql$/, "") +
      "/broadcasting/auth",
    auth: {
      headers: {
        Accept: "application/json",
      },
    },
    // Send session cookie with broadcasting auth requests
    authorizer: (channel: { name: string }) => ({
      authorize: (socketId: string, callback: (error: Error | null, data: ChannelAuthorizationData | null) => void) => {
        const authUrl =
          (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/graphql$/, "") +
          "/broadcasting/auth";

        fetch(authUrl, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            socket_id: socketId,
            channel_name: channel.name,
          }),
        })
          .then((response) => response.json())
          .then((data) => callback(null, data))
          .catch((error) => callback(error instanceof Error ? error : new Error(String(error)), null));
      },
    }),
  });

  return echoInstance;
}

export function disconnectEcho(): void {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
}
