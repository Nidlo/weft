"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";

import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { useOnboardingStore } from "@/lib/stores/onboarding";
import { useUpdateProfile } from "@/lib/hooks/use-profile-mutations";
import { useAuthStore } from "@/lib/stores/auth";
import { COMPLETE_ONBOARDING } from "@/lib/graphql/mutations/auth";
import type {
  CompleteOnboardingData,
  UpdateProfileInput,
} from "@/types/graphql";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { GlassCard } from "@/components/ui/glass-card";
import { OnboardingShell } from "@/components/shared/onboarding-shell";
import { StepBasicInfo } from "./step-basic-info";
import { StepSpecializations } from "./step-specializations";
import { StepPricing } from "./step-pricing";
import { StepPortfolio } from "./step-portfolio";

const STEPS = ["Basics", "Specializations", "Pricing", "Portfolio"] as const;

export default function OnboardingPage() {
  const { user, isReady } = useAuthGuard({
    requireDesigner: true,
    designerRedirectTo: "/dashboard",
  });
  const router = useRouter();
  const store = useOnboardingStore();
  const { step, setStep, reset } = store;
  const { updateProfile, loading: saving } = useUpdateProfile();
  const [completeOnboarding] = useMutation(COMPLETE_ONBOARDING);
  const setUser = useAuthStore((s) => s.setUser);
  // Synchronous in-flight guard. `saving` flips a tick AFTER the mutation
  // fires — long enough for a fast double-tap on "Complete setup" to
  // re-enter handleComplete and double-submit. Mirrors the verify-OTP
  // pattern in /auth/verify.
  const submitting = useRef(false);

  if (!isReady || !user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="mx-auto mb-3 h-3 w-48" />
        <Skeleton className="mx-auto mb-6 h-10 w-72" />
        <Skeleton className="mx-auto mb-8 h-2 w-full" />
        <Skeleton className="h-125 w-full rounded-2xl" />
      </div>
    );
  }

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleComplete = async () => {
    if (submitting.current) return;
    submitting.current = true;
    try {
      const minPesewas = store.pricingMin
        ? parseInt(store.pricingMin) * 100
        : undefined;
      const maxPesewas = store.pricingMax
        ? parseInt(store.pricingMax) * 100
        : undefined;

      const input: UpdateProfileInput = {
        firstName: store.firstName || undefined,
        lastName: store.lastName || undefined,
        otherNames: store.otherNames || undefined,
        displayName: store.displayName || undefined,
        bio: store.bio || undefined,
        specializations:
          store.specializations.length > 0 ? store.specializations : undefined,
        pricingMin: minPesewas,
        pricingMax: maxPesewas,
        equipment: store.equipment.length > 0 ? store.equipment : undefined,
      };

      // Use LocationPicker data if available
      if (store.location?.lat) {
        input.locationLat = store.location.lat;
        input.locationLng = store.location.lng;
        input.city = store.location.city ?? store.city ?? undefined;
      } else {
        input.city = store.city || undefined;
        input.locationLat = store.locationLat ?? undefined;
        input.locationLng = store.locationLng ?? undefined;
      }

      if (store.yearsOfExperience) {
        (input as Record<string, unknown>).yearsOfExperience = parseInt(
          store.yearsOfExperience
        );
      }

      if (store.location) {
        (input as Record<string, unknown>).addressLine =
          store.location.addressLine ?? undefined;
        (input as Record<string, unknown>).region =
          store.location.region ?? undefined;
        (input as Record<string, unknown>).postalCode =
          store.location.postalCode ?? undefined;
        (input as Record<string, unknown>).formattedAddress =
          store.location.formattedAddress ?? undefined;
        (input as Record<string, unknown>).countryCode =
          store.location.countryCode ?? undefined;
      }

      await updateProfile(input);

      const { data } = await completeOnboarding();
      const result = data as CompleteOnboardingData | undefined;

      setUser({
        ...user,
        firstName: store.firstName || user.firstName,
        lastName: store.lastName || user.lastName,
        fullName:
          [store.firstName, store.lastName].filter(Boolean).join(" ") ||
          user.fullName,
        city: store.location?.city ?? store.city ?? user.city,
        isOnboarded: result?.completeOnboarding?.isOnboarded ?? true,
      });
      reset();
      toast.success("Profile set up successfully!");
      router.push("/dashboard");
    } catch {
      toast.error("Failed to save profile. Please try again.");
      // Release the guard on failure so the user can retry. On success we
      // navigate away and the component unmounts, so leaving submitting=true
      // is harmless there.
      submitting.current = false;
    }
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 0:
        return (
          store.firstName.trim().length >= 2 &&
          store.lastName.trim().length >= 2
        );
      case 1:
        return store.specializations.length > 0;
      case 2:
        return true; // pricing is optional
      case 3:
        return store.termsAccepted;
      default:
        return false;
    }
  };

  return (
    <OnboardingShell
      eyebrow="Designer onboarding"
      title="Set up your designer profile."
      steps={STEPS}
      step={step}
      onBack={handleBack}
      onNext={handleNext}
      onComplete={handleComplete}
      canProceed={canProceed()}
      saving={saving}
      completeLabel="Complete setup"
    >
      {step === 0 && <StepBasicInfo />}
      {step === 1 && <StepSpecializations />}
      {step === 2 && <StepPricing />}
      {step === 3 && (
        <div className="space-y-6">
          <StepPortfolio />
          <GlassCard variant="ghost" className="flex items-start gap-3 p-4">
            <Checkbox
              id="designer-terms"
              checked={store.termsAccepted}
              onCheckedChange={(checked) =>
                store.setField("termsAccepted", checked === true)
              }
              className="mt-0.5"
            />
            <label
              htmlFor="designer-terms"
              className="text-foreground/90 cursor-pointer text-sm leading-relaxed"
            >
              I agree to the{" "}
              <a
                href="/terms"
                target="_blank"
                className="text-foreground font-medium underline-offset-4 hover:underline"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                target="_blank"
                className="text-foreground font-medium underline-offset-4 hover:underline"
              >
                Privacy Policy
              </a>
            </label>
          </GlassCard>
        </div>
      )}
    </OnboardingShell>
  );
}
