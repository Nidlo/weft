"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useClientOnboardingStore } from "@/lib/stores/client-onboarding";

export function StepBasicInfo() {
  const { firstName, lastName, email, setField } = useClientOnboardingStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Tell us about yourself</h2>
        <p className="text-sm text-muted-foreground">
          We need your name to personalize your experience.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name *</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setField("firstName", e.target.value)}
            placeholder="e.g. Ama"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name *</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setField("lastName", e.target.value)}
            placeholder="e.g. Mensah"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email (optional)</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setField("email", e.target.value)}
          placeholder="you@example.com"
        />
        <p className="text-xs text-muted-foreground">
          For order receipts and notifications. You can add this later.
        </p>
      </div>
    </div>
  );
}
