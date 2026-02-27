"use client";

import Link from "next/link";
import { Bell, MessageSquare, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { LOGOUT } from "@/lib/graphql/mutations/auth";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/auth";
import { useMessagesStore } from "@/lib/stores/messages";
import { toast } from "sonner";

export function Header() {
  const { isAuthenticated, user, _hasHydrated, logout: clearAuth } =
    useAuthStore();
  const router = useRouter();
  const [logoutMutation] = useMutation(LOGOUT);
  const unreadCount = useMessagesStore((s) => s.unreadCount);

  const handleLogout = async () => {
    try {
      await logoutMutation();
    } catch {
      // Even if the backend call fails, clear local state
    }
    clearAuth();
    toast.success("Logged out");
    router.push("/");
  };

  return (
    <header className="bg-background/95 sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link
          href={isAuthenticated ? "/dashboard" : "/"}
          className="flex items-center gap-2"
        >
          <span className="text-xl font-bold tracking-tight text-primary">
            StitchHub
          </span>
        </Link>

        {!_hasHydrated ? (
          /* Still hydrating — show nothing to avoid flash of login buttons */
          <div className="w-24" />
        ) : isAuthenticated ? (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative hidden md:flex"
              asChild
            >
              <Link href="/messages">
                <MessageSquare className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              asChild
            >
              <Link href="/notifications">
                <Bell className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex"
              asChild
            >
              <Link href="/profile">{user?.firstName || "Profile"}</Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              onClick={handleLogout}
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
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
