"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { useBlueprintStore } from "@/lib/stores/blueprint";
import { useMutation } from "@apollo/client/react";
import { CREATE_ORDER } from "@/lib/graphql/mutations/order";
import type { CreateOrderData, BlueprintData } from "@/types/graphql";
import { AppShell } from "@/components/layout/app-shell";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { StepGarment } from "./step-garment";
import { StepDesign } from "./step-design";
import { StepReferenceImages } from "./step-reference-images";
import { StepFabric } from "./step-fabric";
import { StepMeasurements } from "./step-measurements";
import { StepBudget } from "./step-budget";
import { StepReview } from "./step-review";

const STEPS = [
  "Garment & Occasion",
  "Design Details",
  "Reference Images",
  "Fabric",
  "Measurements",
  "Budget & Timeline",
  "Review",
];

function BlueprintLoading() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Skeleton className="mb-6 h-2 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    </AppShell>
  );
}

function BlueprintWizard() {
  const { user, isReady } = useAuthGuard();
  const router = useRouter();
  const searchParams = useSearchParams();
  const designerSlug = searchParams.get("designer");

  const store = useBlueprintStore();
  const { step, setStep, setField, reset } = store;

  const [createOrder, { loading: submitting }] =
    useMutation<CreateOrderData>(CREATE_ORDER);

  // Set designer from URL param on first load
  useEffect(() => {
    if (designerSlug && !store.designerId) {
      // We'll resolve the slug to an ID when submitting
      setField("designerId", designerSlug);
    }
  }, [designerSlug, store.designerId, setField]);

  if (!isReady || !user) {
    return <BlueprintLoading />;
  }

  const progress = ((step + 1) / STEPS.length) * 100;
  const isReviewStep = step === STEPS.length - 1;

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

  const canProceed = (): boolean => {
    switch (step) {
      case 0: // Garment & Occasion
        return (
          (store.garmentType !== "" &&
            (store.garmentType !== "other" || store.garmentTypeOther.trim().length > 0)) &&
          store.occasion !== ""
        );
      case 1: // Design Details
        return (
          Object.keys(store.designDetails).length > 0 ||
          store.additionalDetails.length > 0 ||
          store.freeText.trim().length > 0
        );
      case 2: // Reference Images (optional)
        return true;
      case 3: // Fabric
        return (
          store.fabricType !== "" &&
          (store.fabricType !== "other" || store.fabricTypeOther.trim().length > 0)
        );
      case 4: // Measurements
        return store.measurementId !== "";
      case 5: // Budget & Timeline
        return (
          Number(store.budgetMin) > 0 &&
          Number(store.budgetMax) >= Number(store.budgetMin) &&
          store.deadline !== ""
        );
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    try {
      const blueprint: BlueprintData = {
        garment_type: store.garmentType,
        occasion: store.occasion,
        design_details: store.designDetails as Record<string, string | string[]>,
        fabric_type: store.fabricType,
      };

      if (store.garmentTypeOther) blueprint.garment_type_other = store.garmentTypeOther;
      if (store.additionalDetails.length > 0) blueprint.additional_details = store.additionalDetails;
      if (store.freeText) blueprint.free_text = store.freeText;
      if (store.referenceImages.length > 0) {
        blueprint.reference_images = store.referenceImages.map((img) => img.url);
      }
      if (store.fabricTypeOther) blueprint.fabric_type_other = store.fabricTypeOther;
      if (store.fabricColour) blueprint.fabric_colour = store.fabricColour;
      if (store.fabricColourHex) blueprint.fabric_colour_hex = store.fabricColourHex;
      if (store.clientProvidingFabric) blueprint.client_providing_fabric = true;
      if (store.fabricNotes) blueprint.fabric_notes = store.fabricNotes;

      // Convert GHS to pesewas
      const budgetMinPesewas = Math.round(Number(store.budgetMin) * 100);
      const budgetMaxPesewas = Math.round(Number(store.budgetMax) * 100);

      const { data } = await createOrder({
        variables: {
          input: {
            designerId: store.designerId,
            measurementId: store.measurementId || undefined,
            blueprint,
            budgetMin: budgetMinPesewas,
            budgetMax: budgetMaxPesewas,
            deadline: store.deadline,
            notes: store.notes || undefined,
          },
        },
      });

      if (data?.createOrder) {
        reset();
        toast.success("Order submitted successfully!");
        router.push("/dashboard");
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message.toLowerCase() : "";
      let friendly =
        "We couldn't submit your order. Please review your details and try again.";
      if (
        raw.includes("not accepting") ||
        raw.includes("isacceptingorders") ||
        raw.includes("not available")
      ) {
        friendly =
          "This designer isn't accepting new orders right now. Try a different designer or check back later.";
      } else if (
        raw.includes("network") ||
        raw.includes("fetch") ||
        raw.includes("failed to fetch")
      ) {
        friendly =
          "We couldn't reach the server. Check your connection and try again.";
      } else if (raw.includes("validation") || raw.includes("invalid")) {
        friendly =
          "Some details look invalid. Please review each step and try again.";
      }
      toast.error(friendly);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Create Your Blueprint</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </p>
          <Progress value={progress} className="mt-4" />
        </div>

        <div className="min-h-[400px]">
          {step === 0 && <StepGarment />}
          {step === 1 && <StepDesign />}
          {step === 2 && <StepReferenceImages />}
          {step === 3 && <StepFabric />}
          {step === 4 && <StepMeasurements />}
          {step === 5 && <StepBudget />}
          {step === 6 && <StepReview onEditStep={setStep} />}
        </div>

        <div className="mt-8 flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={step === 0}>
            Back
          </Button>
          {isReviewStep ? (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting..." : "Confirm & Submit"}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Continue
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default function BlueprintPage() {
  return (
    <Suspense fallback={<BlueprintLoading />}>
      <BlueprintWizard />
    </Suspense>
  );
}
