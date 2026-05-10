"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Coins,
  FileText,
  ImageIcon,
  MessageSquare,
  Ruler,
  Star,
  User,
} from "lucide-react";

import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { useRealtime } from "@/providers/realtime-provider";
import { useEchoReconnect } from "@/lib/hooks/use-echo-reconnect";
import {
  useCancelOrder,
  useConfirmDelivery,
  useConfirmOrder,
  useOrder,
  useUpdateOrderStatus,
} from "@/lib/hooks/use-orders";
import { useStartConversation } from "@/lib/hooks/use-messages";
import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { ThreadDivider } from "@/components/ui/thread-divider";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { OrderProgressBar } from "@/components/order/order-progress-bar";
import { OrderTimeline } from "@/components/order/order-timeline";
import { ResponseCountdown } from "@/components/order/response-countdown";
import { DesignerResponseSheet } from "@/components/order/designer-response-sheet";
import { CostBookPanel } from "@/components/order/cost-book-panel";
import { OrderEditSheet } from "@/components/orders/order-edit-sheet";
import { GarmentEaseEditor } from "@/components/orders/garment-ease-editor";
import { MeasurementSummary } from "@/components/shared/measurement-summary";
import { PaymentSection } from "@/components/payment/payment-section";
import { PayoutSection } from "@/components/payment/payout-section";
import { ExternalPaymentSection } from "@/components/payment/external-payment-section";
import { ReviewPromptDialog } from "@/components/reviews/review-prompt-dialog";
import { StarRating } from "@/components/reviews/star-rating";
import {
  formatPesewas,
  getDaysUntilDeadline,
  getDeadlineColor,
  getReviewDeadlineLabel,
  getStatusConfig,
  PRODUCTION_STAGES,
} from "@/lib/utils/order";
import { cn } from "@/lib/utils";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user, isReady } = useAuthGuard({ requireOnboarded: true });
  const router = useRouter();
  const { order, loading, refetch } = useOrder(id);
  const { echo } = useRealtime();
  // Refetch the order when the WebSocket reconnects so any status / payment
  // events that fired while the socket was down don't leave the UI stale.
  useEchoReconnect(echo, refetch);
  const { confirmOrder, loading: confirming } = useConfirmOrder();
  const { cancelOrder, loading: cancelling } = useCancelOrder();
  const { confirmDelivery, loading: delivering } = useConfirmDelivery();
  const { updateOrderStatus, loading: updating } = useUpdateOrderStatus();
  const { startConversation, loading: startingChat } = useStartConversation();

  const [cancelReasonCategory, setCancelReasonCategory] = useState("");
  const [cancelReasonNotes, setCancelReasonNotes] = useState("");
  const [showCancel, setShowCancel] = useState(false);
  const [updateNotes, setUpdateNotes] = useState("");
  const [showUpdate, setShowUpdate] = useState(false);
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);

  if (!isReady || !user || loading) {
    return (
      <AppShell>
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  if (!order) {
    return (
      <AppShell>
        <GlassCard
          variant="solid"
          className="mx-auto max-w-md py-12 text-center"
        >
          <h2 className="text-display text-2xl font-semibold tracking-tight">
            Order not found.
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            It may have been removed, or the link could be wrong.
          </p>
          <Button
            variant="luxe-outline"
            size="lg"
            asChild
            className="mt-6 gap-1.5"
          >
            <Link href="/orders">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to orders
            </Link>
          </Button>
        </GlassCard>
      </AppShell>
    );
  }

  const isClient = order.clientId !== null && order.clientId === user.id;
  const isDesigner = order.designerId === user.id;
  const statusConfig = getStatusConfig(order.status);
  const garmentType = order.blueprint?.garment_type ?? "Garment";
  const isActive = !["delivered", "cancelled", "declined"].includes(
    order.status
  );

  // Extract enhanced blueprint fields (stored as JSONB, not typed in BlueprintData)
  const bp = order.blueprint as unknown as Record<string, unknown> | null;
  const bpFabricTypes = (bp?.fabric_types as string[] | undefined) ?? [];
  const bpAdditionalDetails =
    (bp?.additional_details as string[] | undefined) ?? [];
  const bpDescription = (bp?.description as string | undefined) ?? "";
  const bpReferenceImages =
    (bp?.reference_images as string[] | undefined) ?? [];

  // Determine next production stage for designer
  const currentStageIndex = PRODUCTION_STAGES.indexOf(
    order.status as (typeof PRODUCTION_STAGES)[number]
  );
  const nextStage =
    currentStageIndex >= 0 && currentStageIndex < PRODUCTION_STAGES.length - 1
      ? PRODUCTION_STAGES[currentStageIndex + 1]
      : null;
  const nextStageConfig = nextStage ? getStatusConfig(nextStage) : null;

  const handleCancel = async () => {
    const composedReason = cancelReasonCategory
      ? cancelReasonNotes.trim()
        ? `${cancelReasonCategory}: ${cancelReasonNotes.trim()}`
        : cancelReasonCategory
      : cancelReasonNotes.trim() || undefined;
    await cancelOrder(order.id, composedReason);
    setShowCancel(false);
    setCancelReasonCategory("");
    setCancelReasonNotes("");
    refetch();
  };

  const handleUpdateStatus = async () => {
    if (!nextStage) return;
    await updateOrderStatus({
      orderId: order.id,
      status: nextStage,
      notes: updateNotes || undefined,
    });
    setShowUpdate(false);
    setUpdateNotes("");
    refetch();
  };

  const handleMessage = async () => {
    if (order.conversation) {
      router.push(`/messages/${order.conversation.id}`);
      return;
    }
    const conversationId = await startConversation(order.id);
    if (conversationId) {
      router.push(`/messages/${conversationId}`);
    }
  };

  const otherPartyName = isClient
    ? order.designer.fullName
    : (order.client?.fullName ?? order.clientDisplayName ?? "Walk-in client");

  return (
    <AppShell>
      <div className="space-y-8">
        <Link
          href="/orders"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to orders
        </Link>

        {/* Editorial header */}
        <header>
          <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
            Order · {order.id.slice(0, 8)}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-display text-3xl leading-tight font-semibold tracking-tight text-balance capitalize sm:text-4xl">
              {garmentType.replace(/_/g, " ")}
            </h1>
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase",
                statusConfig.bgColor,
                statusConfig.color
              )}
            >
              {statusConfig.label}
            </span>
          </div>
          <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" aria-hidden />
              <span>
                {isClient ? "Designer" : "Client"} ·{" "}
                <span className="text-foreground font-medium">
                  {otherPartyName}
                </span>
              </span>
              {order.isInternal && (
                <Badge
                  variant="outline"
                  className="border-border bg-card/60 ml-2 rounded-full text-[10px] font-medium tracking-wider uppercase"
                >
                  Internal
                </Badge>
              )}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" aria-hidden />
              <span
                className={cn("font-medium", getDeadlineColor(order.deadline))}
              >
                {getDaysUntilDeadline(order.deadline)}
              </span>
            </span>
            {order.status === "pending" && (
              <ResponseCountdown createdAt={order.createdAt} />
            )}
          </div>
        </header>

        {/* Progress bar (for confirmed+ orders) */}
        {currentStageIndex >= 0 && (
          <OrderProgressBar currentStatus={order.status} />
        )}

        {/* Price + budget */}
        <SectionBlock eyebrow="Pricing" title="Budget & price">
          <GlassCard
            variant="solid"
            className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4 sm:p-6"
          >
            <PriceCell
              label="Budget"
              value={`${formatPesewas(order.budgetMin)} – ${formatPesewas(order.budgetMax)}`}
            />
            {order.confirmedPrice && (
              <PriceCell
                label="Confirmed"
                value={formatPesewas(order.confirmedPrice)}
                emphasized
              />
            )}
            {order.counterPrice && !order.confirmedPrice && (
              <PriceCell
                label="Counter offer"
                value={formatPesewas(order.counterPrice)}
                tone="warning"
              />
            )}
            {order.isRush && (
              <div>
                <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.16em] uppercase">
                  Priority
                </p>
                <span className="bg-copper/15 text-copper-soft ring-copper/30 mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ring-1">
                  Rush order
                </span>
              </div>
            )}
          </GlassCard>
        </SectionBlock>

        {/* Internal-order client metadata */}
        {order.isInternal &&
          isDesigner &&
          (order.clientName || order.clientPhone) && (
            <GlassCard variant="ghost" className="p-4">
              <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.16em] uppercase">
                Walk-in client
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                {order.clientName && (
                  <span className="font-medium">{order.clientName}</span>
                )}
                {order.clientPhone && (
                  <span className="text-muted-foreground tabular-nums">
                    {order.clientPhone}
                  </span>
                )}
                {order.hasLinkedClient && (
                  <Badge
                    variant="outline"
                    className="border-status-success-soft bg-status-success-soft/40 text-status-success-fg rounded-full text-[10px] tracking-wider uppercase"
                  >
                    Account linked
                  </Badge>
                )}
              </div>
            </GlassCard>
          )}

        {/* Counter-message warning */}
        {order.counterMessage && !order.confirmedPrice && (
          <GlassCard
            variant="solid"
            className="border-status-warning-soft bg-status-warning-soft/40 p-5"
          >
            <p className="text-status-warning-fg flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.16em] uppercase">
              <AlertTriangle className="h-3 w-3" aria-hidden />
              Counter offer message
            </p>
            <p className="text-status-warning-fg mt-2 text-sm">
              {order.counterMessage}
            </p>
          </GlassCard>
        )}

        {/* Action bar */}
        {(order.clientId || isActive) && (
          <div className="flex flex-wrap gap-2">
            {order.clientId && (
              <Button
                variant="luxe-outline"
                size="lg"
                onClick={handleMessage}
                disabled={startingChat}
                className="gap-1.5"
              >
                <MessageSquare className="h-4 w-4" aria-hidden />
                {startingChat ? "Opening..." : "Message"}
              </Button>
            )}

            {isActive && (
              <>
                <OrderEditSheet
                  order={order}
                  isDesigner={isDesigner}
                  onSuccess={() => refetch()}
                />

                {isDesigner && order.status === "pending" && (
                  <DesignerResponseSheet
                    order={order}
                    onSuccess={() => refetch()}
                  />
                )}

                {isClient &&
                  order.status === "pending" &&
                  order.counterPrice && (
                    <Button
                      variant="luxe"
                      size="lg"
                      className="gap-1.5"
                      onClick={async () => {
                        await confirmOrder(order.id);
                        refetch();
                      }}
                      disabled={confirming}
                    >
                      {confirming
                        ? "Confirming..."
                        : `Accept counter (${formatPesewas(order.counterPrice)})`}
                      {!confirming && (
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      )}
                    </Button>
                  )}

                {isDesigner && nextStage && nextStage !== "delivered" && (
                  <>
                    {!showUpdate ? (
                      <Button
                        variant="luxe-outline"
                        size="lg"
                        className="gap-1.5"
                        onClick={() => setShowUpdate(true)}
                      >
                        Advance to {nextStageConfig?.label}
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </Button>
                    ) : (
                      <GlassCard variant="solid" className="w-full p-5">
                        <Label className="text-sm">
                          Notes for {nextStageConfig?.label} (optional)
                        </Label>
                        <Textarea
                          placeholder="Add a note about this stage..."
                          value={updateNotes}
                          onChange={(e) => setUpdateNotes(e.target.value)}
                          rows={3}
                          className="mt-2"
                        />
                        <div className="mt-3 flex gap-2">
                          <Button
                            variant="luxe"
                            size="sm"
                            onClick={handleUpdateStatus}
                            disabled={updating}
                          >
                            {updating
                              ? "Updating..."
                              : `Move to ${nextStageConfig?.label}`}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowUpdate(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </GlassCard>
                    )}
                  </>
                )}

                {(isClient ||
                  (isDesigner && order.isInternal && !order.hasLinkedClient)) &&
                  order.status === "ready" && (
                    <Button
                      variant="luxe"
                      size="lg"
                      className="gap-1.5"
                      onClick={async () => {
                        await confirmDelivery(order.id);
                        refetch();
                        if (isClient) setShowReviewPrompt(true);
                      }}
                      disabled={delivering}
                    >
                      {delivering ? "Confirming..." : "Confirm delivery"}
                      {!delivering && (
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      )}
                    </Button>
                  )}

                {!showCancel ? (
                  <Button
                    variant="ghost"
                    size="lg"
                    className="text-status-error hover:bg-status-error-soft hover:text-status-error-fg"
                    onClick={() => setShowCancel(true)}
                  >
                    Cancel order
                  </Button>
                ) : (
                  <GlassCard
                    variant="solid"
                    className="border-status-error-soft w-full p-5"
                  >
                    <div className="text-status-error-fg flex items-center gap-2 text-sm font-semibold">
                      <AlertTriangle className="h-4 w-4" aria-hidden />
                      Cancel this order?
                    </div>
                    <p className="text-muted-foreground mt-1.5 text-xs">
                      If a deposit was paid, refund timing depends on the
                      production stage. The designer keeps fabric &amp; material
                      costs already incurred.
                    </p>
                    <Select
                      value={cancelReasonCategory}
                      onValueChange={setCancelReasonCategory}
                    >
                      <SelectTrigger className="mt-3">
                        <SelectValue placeholder="Reason for cancelling" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="changed_mind">
                          Changed my mind
                        </SelectItem>
                        <SelectItem value="found_another_designer">
                          Found another designer
                        </SelectItem>
                        <SelectItem value="designer_unresponsive">
                          Designer unresponsive
                        </SelectItem>
                        <SelectItem value="price_too_high">
                          Price too high
                        </SelectItem>
                        <SelectItem value="timeline_too_long">
                          Timeline too long
                        </SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea
                      placeholder={
                        cancelReasonCategory === "other"
                          ? "Tell us more (required)"
                          : "Add details (optional)"
                      }
                      value={cancelReasonNotes}
                      onChange={(e) => setCancelReasonNotes(e.target.value)}
                      rows={2}
                      className="mt-2"
                    />
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleCancel}
                        disabled={
                          cancelling ||
                          (cancelReasonCategory === "other" &&
                            !cancelReasonNotes.trim())
                        }
                      >
                        {cancelling ? "Cancelling..." : "Confirm cancel"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCancel(false)}
                      >
                        Never mind
                      </Button>
                    </div>
                  </GlassCard>
                )}
              </>
            )}
          </div>
        )}

        {/* Review section — delivered orders */}
        {order.status === "delivered" && order.review && (
          <SectionBlock eyebrow="Feedback" title="Your review">
            <GlassCard variant="solid" className="space-y-4 p-5 sm:p-6">
              <StarRating value={order.review.rating} size="sm" showLabel />
              {order.review.comment && (
                <p className="text-sm leading-relaxed">
                  {order.review.comment}
                </p>
              )}
              {order.review.photos && order.review.photos.length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
                  {order.review.photos.map((photo, i) => (
                    <a
                      key={i}
                      href={photo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open review photo ${i + 1} full size`}
                      className="ring-border relative h-16 w-16 shrink-0 overflow-hidden rounded-xl ring-1"
                    >
                      <Image
                        src={photo.thumbnail_url}
                        alt={`Review photo ${i + 1}`}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </a>
                  ))}
                </div>
              )}
              {order.review.designerResponse && (
                <div className="border-border/60 bg-card/40 rounded-xl border p-3">
                  <p className="text-copper text-[11px] font-semibold tracking-[0.16em] uppercase">
                    Designer response
                  </p>
                  <p className="mt-1 text-sm">
                    {order.review.designerResponse}
                  </p>
                </div>
              )}
            </GlassCard>
          </SectionBlock>
        )}

        {/* Leave a review CTA */}
        {order.status === "delivered" && isClient && !order.review && (
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="luxe-outline"
              size="lg"
              onClick={() => setShowReviewPrompt(true)}
              className="gap-1.5"
            >
              <Star className="text-copper h-4 w-4" aria-hidden />
              Leave a review
            </Button>
            {(() => {
              const label = getReviewDeadlineLabel(order.deliveredAt);
              return label ? (
                <span
                  className="text-muted-foreground text-xs"
                  role="status"
                  aria-live="polite"
                >
                  {label}
                </span>
              ) : null;
            })()}
          </div>
        )}

        <ReviewPromptDialog
          open={showReviewPrompt}
          orderId={order.id}
          designerName={order.designer.fullName ?? "the designer"}
          onComplete={() => {
            setShowReviewPrompt(false);
            refetch();
          }}
        />

        {/* Payment + payout sections — clients see pay buttons, both sides see history */}
        {order.confirmedPrice && (
          <PaymentSection
            orderId={order.id}
            confirmedPrice={order.confirmedPrice}
            payments={order.payments ?? []}
            summary={order.paymentSummary ?? null}
            isClient={isClient}
            orderStatus={order.status}
          />
        )}

        {order.confirmedPrice && (order.payouts ?? []).length > 0 && (
          <PayoutSection
            orderId={order.id}
            payouts={order.payouts}
            isDesigner={isDesigner}
          />
        )}

        {order.confirmedPrice && (
          <ExternalPaymentSection
            orderId={order.id}
            externalPayments={order.externalPayments ?? []}
            isClient={isClient}
            isDesigner={isDesigner}
          />
        )}

        <ThreadDivider tone="copper" label="Timeline" />

        <SectionBlock eyebrow="Production" title="Order timeline">
          <OrderTimeline updates={order.updates} />
        </SectionBlock>

        {/* Cost Book — designer only, confirmed+ orders */}
        {isDesigner && currentStageIndex >= 0 && (
          <SectionBlock eyebrow="Margins" title="Cost book" icon={Coins}>
            <CostBookPanel
              orderId={order.id}
              materials={order.materials}
              onMaterialChange={() => refetch()}
            />
          </SectionBlock>
        )}

        {/* Measurement attached */}
        {order.measurement && (
          <SectionBlock eyebrow="Fit" title="Measurement profile" icon={Ruler}>
            <GlassCard variant="solid" className="p-5 sm:p-6">
              <p className="flex items-center gap-2 text-sm font-medium">
                {order.measurement.label}
                {order.measurement.isDefault && (
                  <Badge
                    variant="outline"
                    className="border-copper/40 bg-copper/10 text-copper-soft rounded-full text-[10px] tracking-wider uppercase"
                  >
                    Default
                  </Badge>
                )}
              </p>
              <div className="mt-4">
                <MeasurementSummary
                  dataMm={order.measurement.dataMm}
                  manualOverridesMm={order.measurement.manualOverridesMm}
                  aiBaselineMm={order.measurement.aiBaselineMm}
                />
              </div>
            </GlassCard>
          </SectionBlock>
        )}

        {/* Garment ease — designer-set per-order allowance, separate from
            the client's body measurement (S3). Visible to both parties for
            transparency; only the assigned designer can mutate it. */}
        {(isDesigner ||
          (order.garmentEases && order.garmentEases.length > 0)) && (
          <SectionBlock eyebrow="Allowance" title="Garment ease" icon={Ruler}>
            <GlassCard variant="solid" className="p-5 sm:p-6">
              <GarmentEaseEditor
                orderId={order.id}
                eases={order.garmentEases ?? []}
                canEdit={isDesigner}
              />
            </GlassCard>
          </SectionBlock>
        )}

        {/* Blueprint summary */}
        {order.blueprint && (
          <SectionBlock
            eyebrow="Brief"
            title="Blueprint details"
            icon={FileText}
          >
            <GlassCard variant="solid" className="space-y-5 p-5 sm:p-6">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
                {order.blueprint.garment_type && (
                  <div>
                    <BlueprintField
                      label="Garment type"
                      value={order.blueprint.garment_type.replace(/_/g, " ")}
                    />
                  </div>
                )}
                {order.blueprint.occasion && (
                  <div>
                    <BlueprintField
                      label="Occasion"
                      value={order.blueprint.occasion.replace(/_/g, " ")}
                    />
                  </div>
                )}
                {order.blueprint.fabric_type && (
                  <div>
                    <BlueprintField
                      label="Fabric"
                      value={order.blueprint.fabric_type.replace(/_/g, " ")}
                    />
                  </div>
                )}
                {order.deadlineStart && (
                  <div>
                    <BlueprintField
                      label="Estimated start"
                      value={new Date(order.deadlineStart).toLocaleDateString()}
                    />
                  </div>
                )}
              </div>

              {bpFabricTypes.length > 0 && (
                <div>
                  <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
                    Fabrics
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {bpFabricTypes.map((f) => (
                      <span
                        key={f}
                        className="bg-secondary inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium capitalize"
                      >
                        {f.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {bpAdditionalDetails.length > 0 && (
                <div>
                  <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
                    Additional details
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {bpAdditionalDetails.map((d) => (
                      <span
                        key={d}
                        className="border-border bg-card/60 inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium capitalize"
                      >
                        {d.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {bpDescription && (
                <div>
                  <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
                    Description
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed">
                    {bpDescription}
                  </p>
                </div>
              )}

              {bpReferenceImages.length > 0 && (
                <div>
                  <p className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] uppercase">
                    <ImageIcon className="h-3 w-3" aria-hidden />
                    Reference images
                  </p>
                  <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {bpReferenceImages.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open reference image ${i + 1} full size`}
                        className="group ring-border relative aspect-square overflow-hidden rounded-xl ring-1"
                      >
                        <Image
                          src={url}
                          alt={`Reference ${i + 1}`}
                          fill
                          sizes="(max-width: 640px) 33vw, 200px"
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {order.notes && (
                <div>
                  <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
                    Notes
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed">
                    {order.notes}
                  </p>
                </div>
              )}
            </GlassCard>
          </SectionBlock>
        )}
      </div>
    </AppShell>
  );
}

interface SectionBlockProps {
  eyebrow: string;
  title: string;
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  children: React.ReactNode;
}

function SectionBlock({
  eyebrow,
  title,
  icon: Icon,
  children,
}: SectionBlockProps) {
  return (
    <section>
      <header className="mb-4">
        <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
          {eyebrow}
        </p>
        <h2 className="text-display mt-1.5 flex items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl">
          {Icon && <Icon className="text-foreground/80 h-5 w-5" aria-hidden />}
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}

interface PriceCellProps {
  label: string;
  value: string;
  emphasized?: boolean;
  tone?: "default" | "warning";
}

function PriceCell({
  label,
  value,
  emphasized = false,
  tone = "default",
}: PriceCellProps) {
  return (
    <div>
      <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.16em] uppercase">
        {label}
      </p>
      <p
        className={cn(
          "text-display mt-1.5 font-semibold tracking-tight tabular-nums",
          emphasized ? "text-2xl sm:text-3xl" : "text-base sm:text-lg",
          tone === "warning" && "text-status-warning-fg"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function BlueprintField({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span className="text-muted-foreground block text-[11px] font-medium tracking-[0.14em] uppercase">
        {label}
      </span>
      <span className="mt-0.5 mb-2 block text-sm font-medium capitalize last:mb-0">
        {value}
      </span>
    </>
  );
}
