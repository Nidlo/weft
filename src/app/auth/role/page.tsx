"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { BECOME_DESIGNER } from "@/lib/graphql/mutations/auth";
import type { BecomeDesignerData } from "@/types/graphql";
import { useAuthStore } from "@/lib/stores/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RoleOption {
  key: string;
  title: string;
  description: string;
  icon: string;
  disabled?: boolean;
}

const roles: RoleOption[] = [
  {
    key: "CLIENT",
    title: "I want clothes made",
    description: "Find designers, place orders, and track your garments",
    icon: "\uD83D\uDC57",
  },
  {
    key: "DESIGNER",
    title: "I'm a designer",
    description:
      "Get clients, manage orders, and grow your fashion business",
    icon: "\u2702\uFE0F",
  },
  {
    key: "ORGANIZATION",
    title: "I run a workshop",
    description: "Manage a team of designers and handle bulk orders",
    icon: "\uD83C\uDFE2",
    disabled: true,
  },
];

export default function RoleSelectionPage() {
  const router = useRouter();
  const { user, setUser, isAuthenticated, isLoading } = useAuthStore();
  const [becomeDesigner, { loading }] = useMutation(BECOME_DESIGNER);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/auth/phone");
      return;
    }
    if (user?.isOnboarded) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading || !isAuthenticated || user?.isOnboarded) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const handleSelect = async (key: string) => {
    if (key === "ORGANIZATION") {
      toast.info("Organization accounts are coming soon! Join the waitlist.");
      return;
    }

    try {
      if (key === "DESIGNER") {
        const { data } = await becomeDesigner();
        const result = data as BecomeDesignerData | undefined;

        if (result?.becomeDesigner) {
          setUser({
            ...user!,
            isDesigner: true,
          });
          toast.success("Welcome to StitchHub!");
          router.push("/onboarding");
        }
      } else {
        // Client — go through client onboarding wizard
        toast.success("Welcome to StitchHub!");
        router.push("/onboarding/client");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error(message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>How will you use StitchHub?</CardTitle>
        <CardDescription>
          This helps us personalize your experience. Choose one to get started.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {roles.map((option) => (
          <button
            key={option.key}
            onClick={() => handleSelect(option.key)}
            disabled={loading || option.disabled}
            className={cn(
              "flex w-full items-start gap-4 rounded-lg border border-border p-4 text-left transition-colors hover:border-primary hover:bg-accent/50",
              option.disabled && "cursor-not-allowed opacity-60",
              loading && "pointer-events-none"
            )}
          >
            <span className="text-3xl">{option.icon}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{option.title}</span>
                {option.disabled && (
                  <Badge variant="secondary" className="text-xs">
                    Coming Soon
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {option.description}
              </p>
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
