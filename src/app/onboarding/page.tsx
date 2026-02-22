"use client";

import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { useOnboardingStore } from "@/lib/stores/onboarding";
import { useUpdateProfile } from "@/lib/hooks/use-profile-mutations";
import { useAuthStore } from "@/lib/stores/auth";
import { useMutation } from "@apollo/client/react";
import { COMPLETE_ONBOARDING } from "@/lib/graphql/mutations/auth";
import type { CompleteOnboardingData } from "@/types/graphql";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StepBasicInfo } from "./step-basic-info";
import { StepSpecializations } from "./step-specializations";
import { StepPricing } from "./step-pricing";
import { StepPortfolio } from "./step-portfolio";

const STEPS = ["Basic Info", "Specializations", "Pricing", "Portfolio"];

export default function OnboardingPage() {
  const { user, isReady } = useAuthGuard();
  const router = useRouter();
  const { step, setStep, firstName, lastName, otherNames, displayName, bio, city, locationLat, locationLng, specializations, pricingMin, pricingMax, equipment, reset } =
    useOnboardingStore();
  const { updateProfile, loading: saving } = useUpdateProfile();
  const [completeOnboarding] = useMutation(COMPLETE_ONBOARDING);
  const setUser = useAuthStore((s) => s.setUser);

  if (!isReady || !user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Skeleton className="mb-6 h-2 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!user.isDesigner) {
    router.replace("/dashboard");
    return null;
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    try {
      const minPesewas = pricingMin ? parseInt(pricingMin) * 100 : undefined;
      const maxPesewas = pricingMax ? parseInt(pricingMax) * 100 : undefined;

      await updateProfile({
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        otherNames: otherNames || undefined,
        displayName: displayName || undefined,
        bio: bio || undefined,
        city: city || undefined,
        locationLat: locationLat ?? undefined,
        locationLng: locationLng ?? undefined,
        specializations: specializations.length > 0 ? specializations : undefined,
        pricingMin: minPesewas,
        pricingMax: maxPesewas,
        equipment: equipment.length > 0 ? equipment : undefined,
      });

      // Mark onboarding complete
      const { data } = await completeOnboarding();
      const result = data as CompleteOnboardingData | undefined;

      setUser({
        ...user,
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        fullName: [firstName, lastName].filter(Boolean).join(" ") || user.fullName,
        city: city || user.city,
        isOnboarded: result?.completeOnboarding?.isOnboarded ?? true,
      });
      reset();
      toast.success("Profile set up successfully!");
      router.push("/dashboard");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 0:
        return firstName.trim().length >= 2 && lastName.trim().length >= 2;
      case 1:
        return specializations.length > 0;
      case 2:
        return true; // pricing is optional
      case 3:
        return true; // portfolio can be added later
      default:
        return false;
    }
  };

  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Set up your designer profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Step {step + 1} of {STEPS.length}: {STEPS[step]}
        </p>
        <Progress value={progress} className="mt-4" />
      </div>

      <div className="min-h-[400px]">
        {step === 0 && <StepBasicInfo />}
        {step === 1 && <StepSpecializations />}
        {step === 2 && <StepPricing />}
        {step === 3 && <StepPortfolio />}
      </div>

      <div className="mt-8 flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 0}
        >
          Back
        </Button>
        {isLastStep ? (
          <Button onClick={handleComplete} disabled={saving}>
            {saving ? "Saving..." : "Complete Setup"}
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={!canProceed()}>
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}
