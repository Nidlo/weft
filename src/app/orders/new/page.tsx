"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { useBlueprintOptions } from "@/lib/hooks/use-blueprint-options";
import {
  useCreateInternalOrder,
  useSearchClients,
} from "@/lib/hooks/use-orders";
import type { ClientSearchResult } from "@/types/graphql";
import { AppShell } from "@/components/layout/app-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
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
import {
  ArrowLeft,
  CalendarIcon,
  Loader2,
  Search,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Sub-components
import { GarmentTypeCombobox } from "@/components/orders/garment-type-combobox";
import { FabricTypeCombobox } from "@/components/orders/fabric-type-combobox";
import { ReferenceImageUpload } from "@/components/orders/reference-image-upload";
import { MeasurementSelector } from "@/components/orders/measurement-selector";
import { BudgetInput } from "@/components/orders/budget-input";
import { VoiceInput } from "@/components/orders/voice-input";

export default function NewOrderPage() {
  const router = useRouter();
  const { user, isReady } = useAuthGuard({ requireOnboarded: true });
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
  const [clientMode, setClientMode] = useState<
    "none" | "search" | "external"
  >("none");
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
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppShell>
    );
  }

  if (!user.isDesigner) {
    router.replace("/dashboard");
    return null;
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
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">New Order</h1>
            <p className="text-sm text-muted-foreground">
              Create an order for a walk-in or external client
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* --- Garment Details --- */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Garment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Garment Type - searchable combobox with create */}
              <div className="space-y-2">
                <Label>
                  Garment Type <span className="text-destructive">*</span>
                </Label>
                {optionsLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <GarmentTypeCombobox
                    options={options?.garmentTypes ?? []}
                    value={garmentType}
                    onChange={setGarmentType}
                  />
                )}
              </div>

              {/* Fabric Types - multi-select combobox with create */}
              <div className="space-y-2">
                <Label>Fabric Types</Label>
                {optionsLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <FabricTypeCombobox
                    options={options?.fabricTypes ?? []}
                    selected={selectedFabrics}
                    onChange={setSelectedFabrics}
                  />
                )}
              </div>

              {/* Additional details - checkboxes */}
              <div className="space-y-2">
                <Label>Additional Details</Label>
                {optionsLoading ? (
                  <Skeleton className="h-16 w-full" />
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {options?.designFields?.additional_detail?.map((detail) => (
                      <label
                        key={detail.value}
                        className="flex cursor-pointer items-center space-x-2"
                      >
                        <Checkbox
                          checked={selectedDetails.includes(detail.value)}
                          onCheckedChange={() => toggleDetail(detail.value)}
                        />
                        <span className="text-sm">{detail.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Description with voice input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Description</Label>
                  <VoiceInput onTranscript={handleVoiceTranscript} />
                </div>
                <Textarea
                  id="description"
                  placeholder="Describe the garment in detail — e.g. 'Kaba and slit with cotton and silk, beading on the neckline...' You can also use the mic button to dictate."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Add any details about materials, style, or special requests
                </p>
              </div>

              {/* Reference Images */}
              <div className="space-y-2">
                <Label>Reference Images</Label>
                <ReferenceImageUpload
                  images={referenceImages}
                  onChange={setReferenceImages}
                />
              </div>
            </CardContent>
          </Card>

          {/* --- Budget & Timeline --- */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Budget &amp; Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <BudgetInput
                minGhs={budgetMinGhs}
                maxGhs={budgetMaxGhs}
                onMinChange={setBudgetMinGhs}
                onMaxChange={setBudgetMaxGhs}
              />

              {/* Deadline range */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Estimated Start</Label>
                  <Popover
                    open={deadlineStartOpen}
                    onOpenChange={setDeadlineStartOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !deadlineStart && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {deadlineStart
                          ? format(deadlineStart, "MMM d")
                          : "Start date"}
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
                </div>

                <div className="space-y-2">
                  <Label>
                    Completion Deadline{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Popover
                    open={deadlineOpen}
                    onOpenChange={setDeadlineOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !deadline && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {deadline ? format(deadline, "MMM d") : "Deadline"}
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
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Order instructions, special requirements..."
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* --- Client --- */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Client mode selector */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setClientMode("none");
                    clearSelectedClient();
                    setClientName("");
                    setClientPhone("");
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    clientMode === "none"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input hover:bg-accent"
                  )}
                >
                  No client
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setClientMode("search");
                    setClientName("");
                    setClientPhone("");
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    clientMode === "search"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input hover:bg-accent"
                  )}
                >
                  <Search className="mr-1 inline h-3 w-3" />
                  Find existing client
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setClientMode("external");
                    clearSelectedClient();
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    clientMode === "external"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input hover:bg-accent"
                  )}
                >
                  <User className="mr-1 inline h-3 w-3" />
                  External client
                </button>
              </div>

              {/* Search existing client */}
              {clientMode === "search" && (
                <div className="space-y-2">
                  {selectedClient ? (
                    <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {selectedClient.fullName ?? "Unknown"}
                          </p>
                          {selectedClient.phone && (
                            <p className="text-xs text-muted-foreground">
                              {selectedClient.phone}
                            </p>
                          )}
                          {selectedClient.city && (
                            <p className="text-xs text-muted-foreground">
                              {selectedClient.city}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={clearSelectedClient}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
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
                          className="w-full justify-start text-muted-foreground"
                        >
                          <Search className="mr-2 h-4 w-4" />
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
                                <CommandEmpty>
                                  No clients found.
                                </CommandEmpty>
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
                                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
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
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input
                      id="clientName"
                      placeholder="e.g. Kwame Mensah"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientPhone">Client Phone</Label>
                    <Input
                      id="clientPhone"
                      type="tel"
                      placeholder="e.g. 024 123 4567"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      If provided, the client will receive SMS updates. If
                      they sign up later, the order links to their account.
                    </p>
                  </div>
                </div>
              )}

              {clientMode === "none" && (
                <p className="text-sm text-muted-foreground">
                  You can add client details later from the order page.
                </p>
              )}

              {/* Measurement selector (visible when client is linked) */}
              {linkedClientId && (
                <MeasurementSelector
                  clientId={linkedClientId}
                  value={measurementId}
                  onChange={setMeasurementId}
                />
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={!canSubmit}
            size="lg"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Order"
            )}
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
