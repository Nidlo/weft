"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { MY_VERIFICATION_DOCUMENTS } from "@/lib/graphql/queries/verification";
import {
  UPLOAD_VERIFICATION_DOCUMENT,
  DELETE_VERIFICATION_DOCUMENT,
} from "@/lib/graphql/mutations/verification";
import type {
  MyVerificationDocumentsData,
  UploadVerificationDocumentData,
  DeleteVerificationDocumentData,
  DocumentTypeValue,
} from "@/types/graphql";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DOCUMENT_TYPES: { value: DocumentTypeValue; label: string }[] = [
  { value: "national_id", label: "National ID / Ghana Card" },
  { value: "business_registration", label: "Business Registration" },
  { value: "certificate", label: "Certificate / Qualification" },
  { value: "portfolio_proof", label: "Portfolio Proof" },
  { value: "other", label: "Other Document" },
];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-status-warning-soft text-status-warning-fg",
  approved: "bg-status-success-soft text-status-success-fg",
  rejected: "bg-status-error-soft text-status-error-fg",
};

export function VerificationDocuments() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] =
    useState<DocumentTypeValue>("national_id");
  const [uploading, setUploading] = useState(false);

  const { data, loading, refetch } = useQuery<MyVerificationDocumentsData>(
    MY_VERIFICATION_DOCUMENTS
  );

  const [uploadDocument] = useMutation<UploadVerificationDocumentData>(
    UPLOAD_VERIFICATION_DOCUMENT
  );

  const [deleteDocument] = useMutation<DeleteVerificationDocumentData>(
    DELETE_VERIFICATION_DOCUMENT
  );

  const documents = data?.myVerificationDocuments ?? [];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return;
    }

    setUploading(true);
    try {
      await uploadDocument({
        variables: { file, type: selectedType },
      });
      toast.success("Document uploaded. It will be reviewed shortly.");
      refetch();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Upload failed";
      toast.error(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument({ variables: { id } });
      toast.success("Document removed.");
      refetch();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to delete";
      toast.error(msg);
    }
  };

  const getTypeLabel = (type: string) =>
    DOCUMENT_TYPES.find((t) => t.value === type)?.label ?? type;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Verification Documents</h3>
        <p className="text-muted-foreground text-sm">
          Upload documents to verify your identity and build trust with clients.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-2">
          <Label>Document type</Label>
          <Select
            value={selectedType}
            onValueChange={(v) => setSelectedType(v as DocumentTypeValue)}
          >
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload Document"}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No documents uploaded yet. Upload a document to get verified.
        </p>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {getTypeLabel(doc.type)}
                  </span>
                  <Badge
                    variant="secondary"
                    className={cn("text-xs", STATUS_STYLES[doc.status])}
                  >
                    {doc.status}
                  </Badge>
                </div>
                {doc.rejectionReason && (
                  <p className="text-destructive mt-1 text-xs">
                    Reason: {doc.rejectionReason}
                  </p>
                )}
                <p className="text-muted-foreground mt-1 text-xs">
                  Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={doc.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-xs underline"
                >
                  View
                </a>
                {doc.status === "pending" && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(doc.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
