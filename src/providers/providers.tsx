"use client";

import { ApolloProvider } from "@apollo/client/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { apolloClient } from "@/lib/graphql/client";
import { AuthProvider } from "@/providers/auth-provider";
import { GoogleAuthProvider } from "@/providers/google-oauth-provider";
import { RealtimeProvider } from "@/providers/realtime-provider";
import { AppSplash } from "@/components/shared/app-splash";
import { ImpersonationBanner } from "@/components/shared/impersonation-banner";
import { MaintenanceBanner } from "@/components/shared/maintenance-banner";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <ApolloProvider client={apolloClient}>
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </ApolloProvider>
  );
}
