"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    // Authenticated + onboarded users don't need auth pages
    if (isAuthenticated && user?.isOnboarded && pathname !== "/auth/role") {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, user, pathname, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            StitchHub
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Custom fashion, connected
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
