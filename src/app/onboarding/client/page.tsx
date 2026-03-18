"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { COMPLETE_CLIENT_ONBOARDING } from "@/lib/graphql/mutations/auth";
import type { CompleteClientOnboardingData } from "@/types/graphql";
import { useAuthStore } from "@/lib/stores/auth";
import { useClientOnboardingStore } from "@/lib/stores/client-onboarding";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { StepBasicInfo } from "./step-basic-info";
import { StepInterests } from "./step-interests";
import { StepLocation } from "./step-location";
import { StepFinish } from "./step-finish";

const STEPS = ["Your Name", "Interests", "Location", "Finish"];

export default function ClientOnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, _hasHydrated, setUser } =
    useAuthStore();
  const store = useClientOnboardingStore();
  const { step, setStep, reset } = store;
  const [completeClientOnboarding, { loading: saving }] = useMutation(
    COMPLETE_CLIENT_ONBOARDING
  );

  useEffect(() => {
    if (!_hasHydrated || isLoading) return;
    if (!isAuthenticated) {
      router.replace("/auth/phone");
      return;
    }
    if (user?.isOnboarded) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, _hasHydrated, user, router]);

  if (isLoading || !_hasHydrated || !isAuthenticated || user?.isOnboarded) {
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

  const handleSkip = () => {
    handleNext();
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 0:
        return (
          store.firstName.trim().length >= 2 &&
          store.lastName.trim().length >= 2
        );
      case 1:
        return true; // interests are optional
      case 2:
        return true; // location is optional
      case 3:
        return store.termsAccepted;
      default:
        return false;
    }
  };

  const isSkippable = step === 1 || step === 2;
  const isLastStep = step === STEPS.length - 1;

  const handleComplete = async () => {
    try {
      const input: Record<string, unknown> = {
        firstName: store.firstName.trim(),
        lastName: store.lastName.trim(),
        termsAccepted: store.termsAccepted,
      };

      if (store.email) input.email = store.email.trim();
      if (store.genderPreference)
        input.genderPreference = store.genderPreference;
      if (store.fashionInterests.length > 0)
        input.fashionInterests = store.fashionInterests;
      if (store.referralSource) input.referralSource = store.referralSource;

      if (store.location?.lat) {
        input.locationLat = store.location.lat;
        input.locationLng = store.location.lng;
        input.city = store.location.city;
        input.region = store.location.region;
        input.addressLine = store.location.addressLine;
        input.postalCode = store.location.postalCode;
        input.formattedAddress = store.location.formattedAddress;
        input.countryCode = store.location.countryCode;
      }

      const { data } = await completeClientOnboarding({
        variables: { input },
      });

      const result = data as CompleteClientOnboardingData | undefined;

      if (result?.completeClientOnboarding) {
        setUser({
          ...user!,
          firstName:
            result.completeClientOnboarding.firstName ?? user!.firstName,
          lastName:
            result.completeClientOnboarding.lastName ?? user!.lastName,
          fullName:
            result.completeClientOnboarding.fullName ?? user!.fullName,
          email: result.completeClientOnboarding.email ?? user!.email,
          city: result.completeClientOnboarding.city ?? user!.city,
          isOnboarded: true,
        });
        reset();
        toast.success("Welcome to StitchHub! Let's find you a designer.");
        router.push("/dashboard");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Set up your profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Step {step + 1} of {STEPS.length}: {STEPS[step]}
        </p>
        <Progress value={progress} className="mt-4" />
      </div>

      <div className="min-h-[400px]">
        {step === 0 && <StepBasicInfo />}
        {step === 1 && <StepInterests />}
        {step === 2 && <StepLocation />}
        {step === 3 && <StepFinish />}
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
        <div className="flex gap-2">
          {isSkippable && (
            <Button type="button" variant="ghost" onClick={handleSkip}>
              Skip
            </Button>
          )}
          {isLastStep ? (
            <Button
              type="button"
              onClick={handleComplete}
              disabled={!canProceed() || saving}
            >
              {saving ? "Setting up..." : "Get Started"}
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
    </div>
  );
}
