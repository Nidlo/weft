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
              <RealtimeProvider>
                {children}
              </RealtimeProvider>
              <Toaster richColors position="top-right" />
            </AuthProvider>
          </GoogleAuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ApolloProvider>
  );
}
