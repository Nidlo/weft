"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { ReviewForm } from "./review-form";

type Step = "form" | "celebration";

interface ReviewPromptDialogProps {
  open: boolean;
  orderId: string;
  designerName: string;
  onComplete: () => void;
}

export function ReviewPromptDialog({
  open,
  orderId,
  designerName,
  onComplete,
}: ReviewPromptDialogProps) {
  const [step, setStep] = useState<Step>("form");

  const handleSuccess = () => {
    setStep("celebration");
  };

  const handleClose = () => {
    setStep("form");
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent showCloseButton={step !== "celebration"}>
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle>Rate your experience</DialogTitle>
              <DialogDescription>
                How was your order with {designerName}?
              </DialogDescription>
            </DialogHeader>
            <ReviewForm
              orderId={orderId}
              onSuccess={handleSuccess}
              onSkip={handleClose}
            />
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Thank you!</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Your review helps other clients find great designers.
              </p>
            </div>
            <Button onClick={handleClose} className="mt-2">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
