"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";

import { COMPLETE_CLIENT_ONBOARDING } from "@/lib/graphql/mutations/auth";
import type { CompleteClientOnboardingData } from "@/types/graphql";
import { useAuthStore } from "@/lib/stores/auth";
import { useClientOnboardingStore } from "@/lib/stores/client-onboarding";
import { Skeleton } from "@/components/ui/skeleton";
import { OnboardingShell } from "@/components/shared/onboarding-shell";
import { StepBasicInfo } from "./step-basic-info";
import { StepInterests } from "./step-interests";
import { StepLocation } from "./step-location";
import { StepFinish } from "./step-finish";

const STEPS = ["Name", "Style", "Location", "Finish"] as const;

export default function ClientOnboardingPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);
  const setUser = useAuthStore((s) => s.setUser);
  const store = useClientOnboardingStore();
  const { step, setStep, reset } = store;
  const [completeClientOnboarding, { loading: saving }] = useMutation(
    COMPLETE_CLIENT_ONBOARDING
  );

  // Synchronous in-flight guard — same pattern as the designer onboarding
  // page. The mutation's `loading` flag is one tick behind, long enough
  // for a fast double-tap to slip through. Must be declared before the
  // early-return below to satisfy the rules-of-hooks order invariant.
  const submitting = useRef(false);

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

  const canProceed = (): boolean => {
    switch (step) {
      case 0:
        return (
          store.firstName.trim().length >= 2 &&
          store.lastName.trim().length >= 2
        );
      case 1:
      case 2:
        return true; // optional
      case 3:
        return store.termsAccepted;
      default:
        return false;
    }
  };

  const isSkippable = step === 1 || step === 2;

  const handleComplete = async () => {
    if (submitting.current) return;
    submitting.current = true;
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

      const { data } = await completeClientOnboarding({ variables: { input } });
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
        toast.success("Welcome to Nidlo! Let's find you a designer.");
        router.push("/dashboard");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
      submitting.current = false;
    }
  };

  return (
    <OnboardingShell
      eyebrow="Client onboarding"
      title="Set up your profile."
      steps={STEPS}
      step={step}
      onBack={handleBack}
      onNext={handleNext}
      onComplete={handleComplete}
      onSkip={isSkippable ? handleNext : undefined}
      canProceed={canProceed()}
      saving={saving}
      completeLabel="Get started"
    >
      {step === 0 && <StepBasicInfo />}
      {step === 1 && <StepInterests />}
      {step === 2 && <StepLocation />}
      {step === 3 && <StepFinish />}
    </OnboardingShell>
  );
}
