"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useRespondToReview } from "@/lib/hooks/use-reviews";
import { toast } from "sonner";

const MAX_RESPONSE = 500;

interface DesignerResponseFormProps {
  reviewId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function DesignerResponseForm({
  reviewId,
  onSuccess,
  onCancel,
}: DesignerResponseFormProps) {
  const [response, setResponse] = useState("");
  const { respondToReview, loading } = useRespondToReview();

  const handleSubmit = async () => {
    const trimmed = response.trim();
    if (!trimmed) {
      toast.error("Response cannot be empty.");
      return;
    }

    try {
      await respondToReview(reviewId, trimmed);
      toast.success("Response submitted.");
      onSuccess();
    } catch {
      toast.error("Failed to submit response. Please try again.");
    }
  };

  return (
    <div className="border-primary/20 space-y-2 border-l-2 pl-3">
      <Textarea
        placeholder="Write your response..."
        value={response}
        onChange={(e) => setResponse(e.target.value.slice(0, MAX_RESPONSE))}
        rows={2}
      />
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-xs">
          {response.length}/{MAX_RESPONSE}
        </p>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={loading || !response.trim()}
          >
            {loading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
