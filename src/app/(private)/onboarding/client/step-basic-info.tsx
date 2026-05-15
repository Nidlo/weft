"use client";

import { Mail, User } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useClientOnboardingStore } from "@/lib/stores/client-onboarding";

export function StepBasicInfo() {
  const { firstName, lastName, email, setField } = useClientOnboardingStore();

  return (
    <div className="space-y-7">
      <div className="flex items-start gap-3">
        <span className="bg-secondary text-foreground flex size-9 shrink-0 items-center justify-center rounded-xl">
          <User className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <h2 className="text-display text-lg font-semibold tracking-tight">
            Tell us about yourself.
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Your name personalizes communication with designers - both of you
            see real names on the order.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label
            htmlFor="firstName"
            className="flex items-center gap-1 text-sm"
          >
            First name{" "}
            <span className="text-copper" aria-label="required">
              *
            </span>
          </Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setField("firstName", e.target.value)}
            placeholder="Ama"
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="flex items-center gap-1 text-sm">
            Last name{" "}
            <span className="text-copper" aria-label="required">
              *
            </span>
          </Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setField("lastName", e.target.value)}
            placeholder="Mensah"
            className="h-11"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm">
          Email <span className="text-muted-foreground">(optional)</span>
        </Label>
        <div className="relative">
          <Mail
            className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
            aria-hidden
          />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setField("email", e.target.value)}
            placeholder="you@example.com"
            className="h-11 pl-9"
            autoComplete="email"
          />
        </div>
        <p className="text-muted-foreground text-xs">
          For receipts and notifications. You can add this later.
        </p>
      </div>
    </div>
  );
}
