"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { SELECT_ROLE } from "@/lib/graphql/mutations/auth";
import type { SelectRoleData } from "@/types/graphql";
import { useAuthStore } from "@/lib/stores/auth";
import type { UserRole } from "@/lib/stores/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RoleOption {
  role: string;
  title: string;
  description: string;
  icon: string;
  disabled?: boolean;
}

const roles: RoleOption[] = [
  {
    role: "CLIENT",
    title: "I want clothes made",
    description: "Find designers, place orders, and track your garments",
    icon: "👗",
  },
  {
    role: "DESIGNER",
    title: "I'm a designer",
    description:
      "Get clients, manage orders, and grow your fashion business",
    icon: "✂️",
  },
  {
    role: "ORGANIZATION",
    title: "I run a workshop",
    description: "Manage a team of designers and handle bulk orders",
    icon: "🏢",
    disabled: true,
  },
];

export default function RoleSelectionPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [selectRole, { loading }] = useMutation(SELECT_ROLE);

  const handleSelect = async (role: string) => {
    if (role === "ORGANIZATION") {
      toast.info("Organization accounts are coming soon! Join the waitlist.");
      return;
    }

    try {
      const { data } = await selectRole({ variables: { role } });
      const result = data as SelectRoleData | undefined;

      if (result?.selectRole) {
        const selectedRole = result.selectRole.role?.toLowerCase() as UserRole | undefined;
        setUser({
          ...user!,
          role: selectedRole ?? null,
          isOnboarded: true,
        });
        toast.success("Welcome to StitchHub!");
        router.push("/dashboard");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to set role";
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
            key={option.role}
            onClick={() => handleSelect(option.role)}
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
