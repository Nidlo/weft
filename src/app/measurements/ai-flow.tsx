"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { EXTRACT_AI_MEASUREMENTS } from "@/lib/graphql/mutations/ai-measurement";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MeasurementData, ExtractAiMeasurementsData } from "@/types/graphql";
import { toast } from "sonner";
import { ManualForm } from "./manual-form";

interface AiFlowProps {
  onComplete: (
    label: string,
    unit: string,
    data: MeasurementData
  ) => Promise<void>;
  saving?: boolean;
  onCancel?: () => void;
}

type AiStep = "instructions" | "upload" | "processing" | "review";

export function AiFlow({ onComplete, saving = false, onCancel }: AiFlowProps) {
  const [aiStep, setAiStep] = useState<AiStep>("instructions");
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [sideImage, setSideImage] = useState<File | null>(null);
  const [heightCm, setHeightCm] = useState("");
  const [extractedData, setExtractedData] = useState<MeasurementData | null>(
    null
  );

  const [extractMeasurements, { loading: extracting }] =
    useMutation<ExtractAiMeasurementsData>(EXTRACT_AI_MEASUREMENTS);

  const handleExtract = async () => {
    if (!frontImage) {
      toast.error("Please upload a front photo.");
      return;
    }

    setAiStep("processing");

    try {
      const variables: Record<string, unknown> = { frontImage };
      if (sideImage) variables.sideImage = sideImage;
      if (heightCm) variables.heightCm = parseFloat(heightCm);

      const { data } = await extractMeasurements({ variables });
      setExtractedData(data?.extractAiMeasurements ?? null);
      setAiStep("review");
    } catch {
      toast.error(
        "AI measurement extraction failed. You can still enter measurements manually."
      );
      setAiStep("upload");
    }
  };

  if (aiStep === "instructions") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Photo Measurements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            For the best results, please follow these guidelines:
          </p>
          <ul className="list-inside list-disc space-y-2 text-sm">
            <li>Wear fitted clothing (avoid baggy or loose clothes)</li>
            <li>Stand in a well-lit area with a plain background</li>
            <li>Full body should be visible from head to toe</li>
            <li>Stand straight with arms slightly away from your body</li>
            <li>A side photo improves accuracy (optional)</li>
          </ul>
          <div className="flex justify-end gap-3 pt-4">
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button onClick={() => setAiStep("upload")}>Continue</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (aiStep === "upload") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upload Photos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="front-photo">Front Photo *</Label>
            <Input
              id="front-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFrontImage(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="side-photo">Side Photo (optional)</Label>
            <Input
              id="side-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setSideImage(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="height">Your Height in cm (optional)</Label>
            <Input
              id="height"
              type="number"
              step="0.1"
              min="100"
              max="250"
              placeholder="e.g. 170"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Providing your height improves measurement accuracy.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setAiStep("instructions")}>
              Back
            </Button>
            <Button onClick={handleExtract} disabled={!frontImage || extracting}>
              {extracting ? "Analyzing..." : "Extract Measurements"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (aiStep === "processing") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="mt-4 text-sm text-muted-foreground">
            Analyzing your photos...
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            This may take up to 30 seconds.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Review step: show extracted data in editable manual form
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Review the AI-extracted measurements below. Fields left empty were
            not detected — you can fill them in manually.
          </p>
        </CardContent>
      </Card>
      <ManualForm
        initialLabel="AI Measurement"
        initialData={extractedData ?? undefined}
        onSave={onComplete}
        saving={saving}
        onCancel={onCancel}
      />
    </div>
  );
}
