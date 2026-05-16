"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";

import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { useBlueprintStore } from "@/lib/stores/blueprint";
import { CREATE_ORDER } from "@/lib/graphql/mutations/order";
import {
  useCreateBlueprintDraft,
  useBlueprintDraft,
  useReviseBlueprintDraft,
} from "@/lib/hooks/use-blueprint-drafts";
import { draftToStoreFields } from "@/lib/utils/draft-to-store";
import type { CreateOrderData, BlueprintData } from "@/types/graphql";
import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { OnboardingShell } from "@/components/shared/onboarding-shell";
import { StepGarment } from "./step-garment";
import { StepDesign } from "./step-design";
import { StepReferenceImages } from "./step-reference-images";
import { StepFabric } from "./step-fabric";
import { StepMeasurements } from "./step-measurements";
import { StepBudget } from "./step-budget";
import { StepReview } from "./step-review";

const STEPS = [
  "Garment",
  "Design",
  "References",
  "Fabric",
  "Fit",
  "Budget",
  "Review",
] as const;

function BlueprintLoading() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <Skeleton className="mx-auto mb-3 h-3 w-48" />
        <Skeleton className="mx-auto mb-6 h-10 w-72" />
        <Skeleton className="mx-auto mb-8 h-2 w-full" />
        <Skeleton className="h-125 w-full rounded-2xl" />
      </div>
    </AppShell>
  );
}

function BlueprintWizard() {
  const { user, isReady } = useAuthGuard();
  const router = useRouter();
  const searchParams = useSearchParams();
  const designerSlug = searchParams.get("designer");
  // When a designer pitches a design TO a client, the wizard is opened
  // with ?pitchClient=<userId>. That flips the draft's initiator role to
  // "designer" and the counterparty to that client.
  const pitchClientId = searchParams.get("pitchClient");
  // Revise mode: ?reviseDraft=<id> reopens the wizard pre-filled from an
  // existing draft so the reviser edits the spec itself, then submits the
  // edit as a new revision instead of creating an order.
  const reviseDraftId = searchParams.get("reviseDraft");

  const store = useBlueprintStore();
  const { step, setStep, setField, reset } = store;

  const [createOrder, { loading: submitting }] =
    useMutation<CreateOrderData>(CREATE_ORDER);
  const { createBlueprintDraft, loading: savingDraft } =
    useCreateBlueprintDraft();
  const { reviseBlueprintDraft, loading: revising } = useReviseBlueprintDraft();
  const { draft: reviseDraft } = useBlueprintDraft(reviseDraftId ?? "");

  // One-shot hydration from the draft. The ref guard stops a re-render
  // (or the user editing fields) from being clobbered by a second
  // hydration pass once the draft query resolves / refetches.
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (!reviseDraftId || !reviseDraft || hydratedRef.current) return;
    hydratedRef.current = true;
    const fields = draftToStoreFields(reviseDraft);
    (Object.keys(fields) as (keyof typeof fields)[]).forEach((k) => {
      const v = fields[k];
      if (v !== undefined) {
        // setField is typed per-key; the loop erases the narrowing.
        setField(k, v as never);
      }
    });
    setStep(0);
  }, [reviseDraftId, reviseDraft, setField, setStep]);

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
          store.garmentType !== "" &&
          (store.garmentType !== "other" ||
            store.garmentTypeOther.trim().length > 0) &&
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
          (store.fabricType !== "other" ||
            store.fabricTypeOther.trim().length > 0)
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

  const buildBlueprint = (): BlueprintData => {
    const blueprint: BlueprintData = {
      garment_type: store.garmentType,
      occasion: store.occasion,
      design_details: store.designDetails as Record<string, string | string[]>,
      fabric_type: store.fabricType,
    };

    if (store.garmentTypeOther)
      blueprint.garment_type_other = store.garmentTypeOther;
    if (store.additionalDetails.length > 0)
      blueprint.additional_details = store.additionalDetails;
    if (store.freeText) blueprint.free_text = store.freeText;
    if (store.referenceImages.length > 0) {
      blueprint.reference_images = store.referenceImages.map((img) => img.url);
    }
    if (store.fabricTypeOther)
      blueprint.fabric_type_other = store.fabricTypeOther;
    if (store.fabricColour) blueprint.fabric_colour = store.fabricColour;
    if (store.fabricColourHex)
      blueprint.fabric_colour_hex = store.fabricColourHex;
    if (store.clientProvidingFabric) blueprint.client_providing_fabric = true;
    if (store.fabricNotes) blueprint.fabric_notes = store.fabricNotes;

    return blueprint;
  };

  const handleReviseDraft = async () => {
    if (!reviseDraftId) return;
    try {
      const blueprint = buildBlueprint();
      const budgetMin = store.budgetMin
        ? Math.round(Number(store.budgetMin) * 100)
        : undefined;
      const budgetMax = store.budgetMax
        ? Math.round(Number(store.budgetMax) * 100)
        : undefined;

      const updated = await reviseBlueprintDraft({
        draftId: reviseDraftId,
        blueprint,
        budgetMin,
        budgetMax,
        proposedDeadline: store.deadline || undefined,
        message: store.notes || undefined,
      });

      if (updated) {
        reset();
        toast.success("Revision sent back to the other party.");
        router.push(`/drafts/${reviseDraftId}`);
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message.toLowerCase() : "";
      toast.error(
        raw.includes("turn")
          ? "It is the other party's turn right now, so you can't revise yet."
          : raw.includes("network") || raw.includes("fetch")
            ? "We couldn't reach the server. Check your connection and try again."
            : "We couldn't send your revision. Please review your details and try again."
      );
    }
  };

  const handleSaveAsDraft = async () => {
    try {
      const blueprint = buildBlueprint();
      const budgetMin = store.budgetMin
        ? Math.round(Number(store.budgetMin) * 100)
        : undefined;
      const budgetMax = store.budgetMax
        ? Math.round(Number(store.budgetMax) * 100)
        : undefined;

      const draft = await createBlueprintDraft({
        counterpartyId: pitchClientId ?? store.designerId,
        initiatorRole: pitchClientId ? "designer" : "client",
        blueprint,
        budgetMin,
        budgetMax,
        proposedDeadline: store.deadline || undefined,
        message: store.notes || undefined,
      });

      if (draft) {
        reset();
        toast.success("Saved as a draft. You can collaborate on it now.");
        router.push(`/drafts/${draft.id}`);
      }
    } catch {
      toast.error(
        "We couldn't save the draft. Please review your details and try again."
      );
    }
  };

  const handleSubmit = async () => {
    try {
      const blueprint = buildBlueprint();

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
      <OnboardingShell
        eyebrow={reviseDraftId ? "Revise draft" : "Custom order"}
        title={
          reviseDraftId ? "Revise this blueprint." : "Build your blueprint."
        }
        steps={STEPS}
        step={step}
        onBack={handleBack}
        onNext={handleNext}
        onComplete={reviseDraftId ? handleReviseDraft : handleSubmit}
        // Tapping a completed node jumps back to it (review-and-revise
        // is common when building a blueprint). Guarded to earlier steps
        // only - forward skipping stays blocked by canProceed/Next.
        onStepSelect={(i) => {
          if (i < step) setStep(i);
        }}
        canProceed={canProceed()}
        saving={reviseDraftId ? revising : submitting}
        completeLabel={reviseDraftId ? "Send revision" : "Confirm & submit"}
        tourPrefix="newOrder"
      >
        {step === 0 && <StepGarment />}
        {step === 1 && <StepDesign />}
        {step === 2 && <StepReferenceImages />}
        {step === 3 && <StepFabric />}
        {step === 4 && <StepMeasurements />}
        {step === 5 && <StepBudget />}
        {step === 6 && (
          <StepReview
            onEditStep={setStep}
            // No "Save as draft" secondary action in revise mode - the
            // primary CTA already submits the edit as a revision.
            onSaveAsDraft={reviseDraftId ? undefined : handleSaveAsDraft}
            savingDraft={savingDraft}
            draftCtaLabel={
              pitchClientId ? "Send as a pitch draft" : "Save as draft instead"
            }
          />
        )}
      </OnboardingShell>
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
