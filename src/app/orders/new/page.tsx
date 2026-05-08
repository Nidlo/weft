"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  CalendarIcon,
  Coins,
  Loader2,
  Scissors,
  Search,
  User,
  UserPlus,
  UserX,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { useBlueprintOptions } from "@/lib/hooks/use-blueprint-options";
import {
  useCreateInternalOrder,
  useSearchClients,
} from "@/lib/hooks/use-orders";
import type { ClientSearchResult } from "@/types/graphql";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

import { GarmentTypeCombobox } from "@/components/orders/garment-type-combobox";
import { FabricTypeCombobox } from "@/components/orders/fabric-type-combobox";
import { ReferenceImageUpload } from "@/components/orders/reference-image-upload";
import { MeasurementSelector } from "@/components/orders/measurement-selector";
import { BudgetInput } from "@/components/orders/budget-input";
import { VoiceInput } from "@/components/orders/voice-input";

type ClientMode = "none" | "search" | "external";

const CLIENT_MODES: { value: ClientMode; label: string; icon: typeof User }[] = [
  { value: "none", label: "No client", icon: UserX },
  { value: "search", label: "Find existing", icon: Search },
  { value: "external", label: "External", icon: UserPlus },
];

export default function NewOrderPage() {
  const router = useRouter();
  const { user, isReady } = useAuthGuard({
    requireOnboarded: true,
    requireDesigner: true,
    designerRedirectTo: "/dashboard",
  });
  const { options, loading: optionsLoading } = useBlueprintOptions();
  const { createInternalOrder, loading: submitting } =
    useCreateInternalOrder();
  const {
    searchClients,
    results: clientResults,
    loading: searchingClients,
  } = useSearchClients();

  // Garment state
  const [garmentType, setGarmentType] = useState("");
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);
  const [selectedDetails, setSelectedDetails] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [referenceImages, setReferenceImages] = useState<string[]>([]);

  // Budget & timeline
  const [budgetMinGhs, setBudgetMinGhs] = useState("");
  const [budgetMaxGhs, setBudgetMaxGhs] = useState("");
  const [deadlineStart, setDeadlineStart] = useState<Date | undefined>(
    undefined
  );
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [deadlineStartOpen, setDeadlineStartOpen] = useState(false);
  const [deadlineOpen, setDeadlineOpen] = useState(false);
  const [notes, setNotes] = useState("");

  // Client state
  const [clientMode, setClientMode] = useState<ClientMode>("none");
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] =
    useState<ClientSearchResult | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  // Measurement
  const [measurementId, setMeasurementId] = useState<string | undefined>(
    undefined
  );

  // Debounce client search
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleClientSearch = useCallback(
    (value: string) => {
      setClientSearchQuery(value);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => {
        searchClients(value);
      }, 300);
    },
    [searchClients]
  );

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  if (!isReady || !user) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl space-y-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-5 w-96" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  const budgetMinValid = parseFloat(budgetMinGhs) > 0;
  const budgetMaxValid = parseFloat(budgetMaxGhs) > 0;
  const budgetValid =
    budgetMinValid &&
    budgetMaxValid &&
    parseFloat(budgetMinGhs) <= parseFloat(budgetMaxGhs);
  const canSubmit = garmentType && budgetValid && deadline && !submitting;

  const toggleDetail = (value: string) => {
    setSelectedDetails((prev) =>
      prev.includes(value)
        ? prev.filter((d) => d !== value)
        : [...prev, value]
    );
  };

  const handleSelectClient = (client: ClientSearchResult) => {
    setSelectedClient(client);
    setClientSearchOpen(false);
    setClientSearchQuery("");
  };

  const clearSelectedClient = () => {
    setSelectedClient(null);
    setClientSearchQuery("");
    setMeasurementId(undefined);
  };

  const handleVoiceTranscript = (text: string) => {
    setDescription((prev) => (prev ? prev + " " + text : text));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const budgetMinPesewas = Math.round(parseFloat(budgetMinGhs) * 100);
    const budgetMaxPesewas = Math.round(parseFloat(budgetMaxGhs) * 100);

    const result = await createInternalOrder({
      garmentType,
      clientId: selectedClient?.id ?? undefined,
      clientName:
        clientMode === "external" && clientName.trim()
          ? clientName.trim()
          : undefined,
      clientPhone:
        clientMode === "external" && clientPhone.trim()
          ? clientPhone.trim()
          : undefined,
      budgetMin: budgetMinPesewas,
      budgetMax: budgetMaxPesewas,
      deadline: deadline!.toISOString(),
      deadlineStart: deadlineStart?.toISOString(),
      notes: notes.trim() || undefined,
      fabricTypes: selectedFabrics.length > 0 ? selectedFabrics : undefined,
      additionalDetails:
        selectedDetails.length > 0 ? selectedDetails : undefined,
      description: description.trim() || undefined,
      referenceImages:
        referenceImages.length > 0 ? referenceImages : undefined,
      measurementId: measurementId ?? undefined,
    });

    if (result) {
      toast.success("Order created successfully");
      router.push(`/orders/${result.id}`);
    } else {
      toast.error("Failed to create order. Please try again.");
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const linkedClientId = selectedClient?.id ?? null;

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to orders
          </Link>
          <header className="mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">
              Studio
            </p>
            <h1 className="text-display mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              New order
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Create a new order — for a walk-in client, an external customer,
              or a brief without a client yet.
            </p>
          </header>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Garment Details */}
          <FormSection
            eyebrow="Brief"
            title="Garment details"
            icon={Scissors}
          >
            <GlassCard variant="solid" className="space-y-5 p-5 sm:p-6">
              <Field label="Garment type" required>
                {optionsLoading ? (
                  <Skeleton className="h-11 w-full" />
                ) : (
                  <GarmentTypeCombobox
                    options={options?.garmentTypes ?? []}
                    value={garmentType}
                    onChange={setGarmentType}
                  />
                )}
              </Field>

              <Field label="Fabric types">
                {optionsLoading ? (
                  <Skeleton className="h-11 w-full" />
                ) : (
                  <FabricTypeCombobox
                    options={options?.fabricTypes ?? []}
                    selected={selectedFabrics}
                    onChange={setSelectedFabrics}
                  />
                )}
              </Field>

              <Field label="Additional details">
                {optionsLoading ? (
                  <Skeleton className="h-16 w-full" />
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {options?.designFields?.additional_detail?.map((detail) => (
                      <label
                        key={detail.value}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-card/60 px-3 py-2 text-sm",
                          "transition-colors hover:border-foreground/30 hover:bg-card",
                          selectedDetails.includes(detail.value) &&
                            "border-foreground/40 bg-foreground/5"
                        )}
                      >
                        <Checkbox
                          checked={selectedDetails.includes(detail.value)}
                          onCheckedChange={() => toggleDetail(detail.value)}
                        />
                        <span>{detail.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </Field>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description" className="text-sm">
                    Description
                  </Label>
                  <VoiceInput onTranscript={handleVoiceTranscript} />
                </div>
                <Textarea
                  id="description"
                  placeholder="Describe the garment in detail — fabric, style, beading, special requests... You can also dictate via the mic."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Include any details about materials, style, or fit.
                </p>
              </div>

              <Field label="Reference images">
                <ReferenceImageUpload
                  images={referenceImages}
                  onChange={setReferenceImages}
                />
              </Field>
            </GlassCard>
          </FormSection>

          {/* Budget + Timeline */}
          <FormSection
            eyebrow="Pricing"
            title="Budget & timeline"
            icon={Coins}
          >
            <GlassCard variant="solid" className="space-y-5 p-5 sm:p-6">
              <BudgetInput
                minGhs={budgetMinGhs}
                maxGhs={budgetMaxGhs}
                onMinChange={setBudgetMinGhs}
                onMaxChange={setBudgetMaxGhs}
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Estimated start">
                  <Popover
                    open={deadlineStartOpen}
                    onOpenChange={setDeadlineStartOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "h-11 w-full justify-start text-left font-medium",
                          !deadlineStart && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon
                          className="mr-2 h-4 w-4 shrink-0 text-copper"
                          aria-hidden
                        />
                        {deadlineStart
                          ? format(deadlineStart, "MMM d, yyyy")
                          : "Pick a start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={deadlineStart}
                        onSelect={(date) => {
                          setDeadlineStart(date);
                          setDeadlineStartOpen(false);
                        }}
                        disabled={(date) => date < today}
                      />
                    </PopoverContent>
                  </Popover>
                </Field>

                <Field label="Completion deadline" required>
                  <Popover open={deadlineOpen} onOpenChange={setDeadlineOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "h-11 w-full justify-start text-left font-medium",
                          !deadline && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon
                          className="mr-2 h-4 w-4 shrink-0 text-copper"
                          aria-hidden
                        />
                        {deadline
                          ? format(deadline, "MMM d, yyyy")
                          : "Pick a deadline"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={deadline}
                        onSelect={(date) => {
                          setDeadline(date);
                          setDeadlineOpen(false);
                        }}
                        disabled={(date) =>
                          date < today ||
                          (deadlineStart ? date < deadlineStart : false)
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </Field>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Order instructions, fitting schedule, special requirements..."
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="resize-none"
                />
              </div>
            </GlassCard>
          </FormSection>

          {/* Client */}
          <FormSection eyebrow="Recipient" title="Client" icon={User}>
            <GlassCard variant="solid" className="space-y-5 p-5 sm:p-6">
              {/* Client mode pills */}
              <div className="flex flex-wrap gap-2">
                {CLIENT_MODES.map((mode) => {
                  const Icon = mode.icon;
                  const isActive = clientMode === mode.value;
                  return (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => {
                        setClientMode(mode.value);
                        if (mode.value === "none") {
                          clearSelectedClient();
                          setClientName("");
                          setClientPhone("");
                        } else if (mode.value === "search") {
                          setClientName("");
                          setClientPhone("");
                        } else {
                          clearSelectedClient();
                        }
                      }}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5",
                        isActive
                          ? "bg-foreground text-background shadow-(--shadow-2)"
                          : "border border-border bg-card hover:border-foreground/30"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                      {mode.label}
                    </button>
                  );
                })}
              </div>

              {/* Search existing client */}
              {clientMode === "search" && (
                <div className="space-y-2">
                  {selectedClient ? (
                    <GlassCard variant="ghost" className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-foreground ring-1 ring-border">
                            <User className="h-4 w-4" aria-hidden />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold tracking-tight">
                              {selectedClient.fullName ?? "Unknown"}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {[selectedClient.phone, selectedClient.city]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Clear selected client"
                          onClick={clearSelectedClient}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </GlassCard>
                  ) : (
                    <Popover
                      open={clientSearchOpen}
                      onOpenChange={setClientSearchOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={clientSearchOpen}
                          className="h-11 w-full justify-start text-muted-foreground"
                        >
                          <Search
                            className="mr-2 h-4 w-4 text-copper"
                            aria-hidden
                          />
                          Search by name or phone...
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-(--radix-popover-trigger-width) p-0"
                        align="start"
                      >
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="Type name or phone..."
                            value={clientSearchQuery}
                            onValueChange={handleClientSearch}
                          />
                          <CommandList>
                            {searchingClients && (
                              <div className="flex items-center justify-center py-4">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              </div>
                            )}
                            {!searchingClients &&
                              clientSearchQuery.length >= 2 &&
                              clientResults.length === 0 && (
                                <CommandEmpty>No clients found.</CommandEmpty>
                              )}
                            {clientResults.length > 0 && (
                              <CommandGroup>
                                {clientResults.map((client) => (
                                  <CommandItem
                                    key={client.id}
                                    value={client.id}
                                    onSelect={() =>
                                      handleSelectClient(client)
                                    }
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                        <User className="h-3.5 w-3.5" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium">
                                          {client.fullName ?? "Unknown"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {[client.phone, client.city]
                                            .filter(Boolean)
                                            .join(" · ")}
                                        </p>
                                      </div>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              )}

              {/* External client manual entry */}
              {clientMode === "external" && (
                <div className="space-y-3">
                  <Field label="Client name">
                    <Input
                      id="clientName"
                      placeholder="e.g. Kwame Mensah"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="h-11"
                    />
                  </Field>
                  <Field
                    label="Client phone"
                    hint="If provided, the client receives SMS updates. They can claim the order when they sign up."
                  >
                    <Input
                      id="clientPhone"
                      type="tel"
                      placeholder="024 123 4567"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      autoComplete="tel"
                      inputMode="numeric"
                      className="h-11 tabular-nums"
                    />
                  </Field>
                </div>
              )}

              {clientMode === "none" && (
                <p className="text-sm text-muted-foreground">
                  You can add client details later from the order page.
                </p>
              )}

              {linkedClientId && (
                <MeasurementSelector
                  clientId={linkedClientId}
                  value={measurementId}
                  onChange={setMeasurementId}
                />
              )}
            </GlassCard>
          </FormSection>

          {/* Submit */}
          <Button
            type="submit"
            variant="luxe"
            size="xl"
            className="w-full gap-1.5"
            disabled={!canSubmit}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Creating order...
              </>
            ) : (
              <>
                Create order
                <ArrowRight className="h-4 w-4" aria-hidden />
              </>
            )}
          </Button>
        </form>
      </div>
    </AppShell>
  );
}

interface FormSectionProps {
  eyebrow: string;
  title: string;
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  children: React.ReactNode;
}

function FormSection({
  eyebrow,
  title,
  icon: Icon,
  children,
}: FormSectionProps) {
  return (
    <section>
      <header className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">
          {eyebrow}
        </p>
        <h2 className="text-display mt-1.5 flex items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl">
          {Icon && <Icon className="h-5 w-5 text-foreground/80" aria-hidden />}
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}

interface FieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}

function Field({ label, required, hint, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1 text-sm">
        {label}
        {required && (
          <span className="text-copper" aria-label="required">
            *
          </span>
        )}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
