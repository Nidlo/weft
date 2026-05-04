"use client";

import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { useOnboardingStore } from "@/lib/stores/onboarding";
import { useUpdateProfile } from "@/lib/hooks/use-profile-mutations";
import { useAuthStore } from "@/lib/stores/auth";
import { useMutation } from "@apollo/client/react";
import { COMPLETE_ONBOARDING } from "@/lib/graphql/mutations/auth";
import type { CompleteOnboardingData, UpdateProfileInput } from "@/types/graphql";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { StepBasicInfo } from "./step-basic-info";
import { StepSpecializations } from "./step-specializations";
import { StepPricing } from "./step-pricing";
import { StepPortfolio } from "./step-portfolio";

const STEPS = ["Basic Info", "Specializations", "Pricing", "Portfolio"];

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

  if (!isReady || !user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Skeleton className="mb-6 h-2 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
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
          store.specializations.length > 0
            ? store.specializations
            : undefined,
        pricingMin: minPesewas,
        pricingMax: maxPesewas,
        equipment:
          store.equipment.length > 0 ? store.equipment : undefined,
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

      // Pass address fields from location
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

      // Mark onboarding complete
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
        {step === 3 && (
          <div className="space-y-6">
            <StepPortfolio />
            <div className="flex items-start gap-3 rounded-lg border p-4">
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
                className="cursor-pointer text-sm leading-relaxed"
              >
                I agree to the{" "}
                <a
                  href="/terms"
                  target="_blank"
                  className="text-primary underline underline-offset-2"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  className="text-primary underline underline-offset-2"
                >
                  Privacy Policy
                </a>
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={step === 0}
        >
          Back
        </Button>
        {isLastStep ? (
          <Button
            type="button"
            onClick={handleComplete}
            disabled={!canProceed() || saving}
          >
            {saving ? "Saving..." : "Complete Setup"}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleNext}
            disabled={!canProceed()}
          >
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}
