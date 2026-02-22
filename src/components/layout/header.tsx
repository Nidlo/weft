"use client";

import Link from "next/link";
import { Bell, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/auth";

export function Header() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <header className="bg-background/95 sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-primary">
            StitchHub
          </span>
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hidden md:flex" asChild>
              <Link href="/messages">
                <MessageSquare className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex" asChild>
              <Link href="/notifications">
                <Bell className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="hidden md:flex" asChild>
              <Link href="/profile">{user?.firstName || "Profile"}</Link>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/phone">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/auth/phone">Sign up</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
