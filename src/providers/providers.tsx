"use client";

import dynamic from "next/dynamic";
import { ApolloProvider } from "@apollo/client/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { apolloClient } from "@/lib/graphql/client";
import { AuthProvider } from "@/providers/auth-provider";
import { GoogleAuthProvider } from "@/providers/google-oauth-provider";
import { AppSplash } from "@/components/shared/app-splash";
import { ImpersonationBanner } from "@/components/shared/impersonation-banner";
import { MaintenanceBanner } from "@/components/shared/maintenance-banner";

// RealtimeProvider drags in laravel-echo, pusher-js, Firebase Messaging,
// and several Apollo queries. Guests on /, /auth, /terms, /privacy don't
// need any of it; lazy + ssr:false keeps that whole module graph out of
// the initial bundle and off the first-paint critical path.
const RealtimeProvider = dynamic(
  () =>
    import("@/providers/realtime-provider").then((m) => ({
      default: m.RealtimeProvider,
    })),
  { ssr: false, loading: () => null }
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={apolloClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <GoogleAuthProvider>
          <AuthProvider>
            <AppSplash />
            {/* QA-AD-OPS-011: sticky red banner during a coordinated
                deploy. Polls /api/system/maintenance every 30s, so a
                flip on the admin panel reaches every open PWA tab
                inside half a minute. No-op when the flag is off. */}
            <MaintenanceBanner />
            {/* QA-AD-USER-012: sticky banner shown only when the
                active session is an admin impersonation. No-op for
                normal sessions; does not affect layout flow. */}
            <ImpersonationBanner />
            <RealtimeProvider>{children}</RealtimeProvider>
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </GoogleAuthProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
}
