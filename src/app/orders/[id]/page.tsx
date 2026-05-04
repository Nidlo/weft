"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { useRealtime } from "@/providers/realtime-provider";
import { useEchoReconnect } from "@/lib/hooks/use-echo-reconnect";
import {
  useOrder,
  useConfirmOrder,
  useCancelOrder,
  useConfirmDelivery,
  useUpdateOrderStatus,
} from "@/lib/hooks/use-orders";
import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calendar, AlertTriangle, Ruler, MessageSquare, Star } from "lucide-react";
import { OrderProgressBar } from "@/components/order/order-progress-bar";
import { OrderTimeline } from "@/components/order/order-timeline";
import { ResponseCountdown } from "@/components/order/response-countdown";
import { DesignerResponseSheet } from "@/components/order/designer-response-sheet";
import { CostBookPanel } from "@/components/order/cost-book-panel";
import { OrderEditSheet } from "@/components/orders/order-edit-sheet";
import { PaymentSection } from "@/components/payment/payment-section";
import { PayoutSection } from "@/components/payment/payout-section";
import { ExternalPaymentSection } from "@/components/payment/external-payment-section";
import { ReviewPromptDialog } from "@/components/reviews/review-prompt-dialog";
import { StarRating } from "@/components/reviews/star-rating";
import {
  getStatusConfig,
  formatPesewas,
  getDeadlineColor,
  getDaysUntilDeadline,
  getReviewDeadlineLabel,
  PRODUCTION_STAGES,
} from "@/lib/utils/order";
import { useStartConversation } from "@/lib/hooks/use-messages";

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
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </AppShell>
    );
  }

  if (!order) {
    return (
      <AppShell>
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Order not found.</p>
          <Button variant="link" asChild className="mt-2">
            <Link href="/orders">Back to Orders</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const isClient = order.clientId !== null && order.clientId === user.id;
  const isDesigner = order.designerId === user.id;
  const statusConfig = getStatusConfig(order.status);
  const garmentType = order.blueprint?.garment_type ?? "Garment";
  const isActive = !["delivered", "cancelled", "declined"].includes(order.status);

  // Extract enhanced blueprint fields (stored as JSONB, not typed in BlueprintData)
  const bp = order.blueprint as unknown as Record<string, unknown> | null;
  const bpFabricTypes = (bp?.fabric_types as string[] | undefined) ?? [];
  const bpAdditionalDetails = (bp?.additional_details as string[] | undefined) ?? [];
  const bpDescription = (bp?.description as string | undefined) ?? "";
  const bpReferenceImages = (bp?.reference_images as string[] | undefined) ?? [];

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
    await updateOrderStatus({ orderId: order.id, status: nextStage, notes: updateNotes || undefined });
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

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Back link */}
        <Link
          href="/orders"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>

        {/* Header */}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold capitalize">
              {garmentType.replace(/_/g, " ")}
            </h1>
            <Badge
              variant="secondary"
              className={`${statusConfig.bgColor} ${statusConfig.color} border-0`}
            >
              {statusConfig.label}
            </Badge>
          </div>
          <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              {isClient ? "Designer" : "Client"}:{" "}
              <strong>
                {isClient
                  ? order.designer.fullName
                  : order.client?.fullName ?? order.clientDisplayName ?? "Walk-in Client"}
              </strong>
              {order.isInternal && (
                <Badge variant="outline" className="ml-2 text-xs">Internal</Badge>
              )}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span className={getDeadlineColor(order.deadline)}>
                {getDaysUntilDeadline(order.deadline)}
              </span>
            </span>
            {order.status === "pending" && (
              <ResponseCountdown createdAt={order.createdAt} />
            )}
          </div>
        </div>

        {/* Progress bar (for confirmed+ orders) */}
        {currentStageIndex >= 0 && <OrderProgressBar currentStatus={order.status} />}

        {/* Price info */}
        <Card>
          <CardContent className="grid grid-cols-2 gap-4 py-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Budget</p>
              <p className="text-sm font-medium">
                {formatPesewas(order.budgetMin)} - {formatPesewas(order.budgetMax)}
              </p>
            </div>
            {order.confirmedPrice && (
              <div>
                <p className="text-xs text-muted-foreground">Confirmed Price</p>
                <p className="text-sm font-semibold text-primary">
                  {formatPesewas(order.confirmedPrice)}
                </p>
              </div>
            )}
            {order.counterPrice && !order.confirmedPrice && (
              <div>
                <p className="text-xs text-muted-foreground">Counter Offer</p>
                <p className="text-sm font-semibold text-status-warning">
                  {formatPesewas(order.counterPrice)}
                </p>
              </div>
            )}
            {order.isRush && (
              <div>
                <p className="text-xs text-muted-foreground">Priority</p>
                <Badge variant="destructive" className="mt-0.5">Rush Order</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Internal order: client info */}
        {order.isInternal && isDesigner && (order.clientName || order.clientPhone) && (
          <Card>
            <CardContent className="py-3">
              <p className="text-xs font-medium text-muted-foreground">Walk-in Client</p>
              <div className="mt-1 flex items-center gap-4 text-sm">
                {order.clientName && <span>{order.clientName}</span>}
                {order.clientPhone && (
                  <span className="text-muted-foreground">{order.clientPhone}</span>
                )}
                {order.hasLinkedClient && (
                  <Badge variant="secondary" className="text-xs">Account linked</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Counter message */}
        {order.counterMessage && !order.confirmedPrice && (
          <Card className="border-status-warning-soft bg-status-warning-soft/50">
            <CardContent className="py-3">
              <p className="text-sm font-medium text-status-warning-fg">Counter Offer Message</p>
              <p className="mt-1 text-sm text-status-warning-fg">{order.counterMessage}</p>
            </CardContent>
          </Card>
        )}

        {/* Action bar */}
        {/* Message button — always visible when order has a linked client */}
        {order.clientId && (
          <Button
            variant="outline"
            onClick={handleMessage}
            disabled={startingChat}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            {startingChat ? "Opening..." : "Message"}
          </Button>
        )}

        {isActive && (
          <div className="flex flex-wrap gap-2">
            {/* Edit order */}
            <OrderEditSheet
              order={order}
              isDesigner={isDesigner}
              onSuccess={() => refetch()}
            />

            {/* Designer: respond to pending */}
            {isDesigner && order.status === "pending" && (
              <DesignerResponseSheet order={order} onSuccess={() => refetch()} />
            )}

            {/* Client: confirm counter */}
            {isClient && order.status === "pending" && order.counterPrice && (
              <Button
                onClick={async () => {
                  await confirmOrder(order.id);
                  refetch();
                }}
                disabled={confirming}
              >
                {confirming ? "Confirming..." : `Accept Counter (${formatPesewas(order.counterPrice)})`}
              </Button>
            )}

            {/* Designer: advance status */}
            {isDesigner && nextStage && nextStage !== "delivered" && (
              <>
                {!showUpdate ? (
                  <Button variant="outline" onClick={() => setShowUpdate(true)}>
                    Advance to {nextStageConfig?.label}
                  </Button>
                ) : (
                  <Card className="w-full">
                    <CardContent className="space-y-3 py-3">
                      <Label>Notes for {nextStageConfig?.label} (optional)</Label>
                      <Textarea
                        placeholder="Add a note about this stage..."
                        value={updateNotes}
                        onChange={(e) => setUpdateNotes(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleUpdateStatus} disabled={updating} size="sm">
                          {updating ? "Updating..." : `Move to ${nextStageConfig?.label}`}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setShowUpdate(false)}>
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Client (or designer on internal order): confirm delivery */}
            {(isClient || (isDesigner && order.isInternal && !order.hasLinkedClient)) &&
              order.status === "ready" && (
              <Button
                onClick={async () => {
                  await confirmDelivery(order.id);
                  refetch();
                  if (isClient) setShowReviewPrompt(true);
                }}
                disabled={delivering}
              >
                {delivering ? "Confirming..." : "Confirm Delivery"}
              </Button>
            )}

            {/* Cancel */}
            {isActive && (
              <>
                {!showCancel ? (
                  <Button
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => setShowCancel(true)}
                  >
                    Cancel Order
                  </Button>
                ) : (
                  <Card className="w-full border-destructive/20">
                    <CardContent className="space-y-3 py-3">
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        Are you sure you want to cancel?
                      </div>
                      <p className="text-xs text-muted-foreground">
                        If a deposit was paid, refund timing depends on the
                        production stage. The designer keeps fabric &amp;
                        material costs already incurred.
                      </p>
                      <Select
                        value={cancelReasonCategory}
                        onValueChange={setCancelReasonCategory}
                      >
                        <SelectTrigger>
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
                      />
                      <div className="flex gap-2">
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
                          {cancelling ? "Cancelling..." : "Confirm Cancel"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowCancel(false)}
                        >
                          Never mind
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        )}

        {/* Review section — delivered orders */}
        {order.status === "delivered" && order.review && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Star className="h-4 w-4" />
                Your Review
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <StarRating value={order.review.rating} size="sm" showLabel />
              {order.review.comment && (
                <p className="text-sm">{order.review.comment}</p>
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
                      className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg"
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
                <div className="mt-3 border-l-2 border-muted pl-3">
                  <p className="text-xs font-medium text-muted-foreground">Designer Response</p>
                  <p className="mt-0.5 text-sm">{order.review.designerResponse}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Leave a review button — client, delivered, no review yet */}
        {order.status === "delivered" && isClient && !order.review && (
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setShowReviewPrompt(true)}>
              <Star className="mr-2 h-4 w-4" />
              Leave a Review
            </Button>
            {(() => {
              const label = getReviewDeadlineLabel(order.deliveredAt);
              return label ? (
                <span
                  className="text-xs text-muted-foreground"
                  role="status"
                  aria-live="polite"
                >
                  {label}
                </span>
              ) : null;
            })()}
          </div>
        )}

        {/* Review Prompt Dialog */}
        <ReviewPromptDialog
          open={showReviewPrompt}
          orderId={order.id}
          designerName={order.designer.fullName ?? "the designer"}
          onComplete={() => {
            setShowReviewPrompt(false);
            refetch();
          }}
        />

        {/* Payment section — clients see pay buttons, both sides see history */}
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

        {/* Payout section — shows designer payout status, retry button for failed */}
        {order.confirmedPrice && (order.payouts ?? []).length > 0 && (
          <PayoutSection
            orderId={order.id}
            payouts={order.payouts}
            isDesigner={isDesigner}
          />
        )}

        {/* External/offline payments — record & confirm */}
        {order.confirmedPrice && (
          <ExternalPaymentSection
            orderId={order.id}
            externalPayments={order.externalPayments ?? []}
            isClient={isClient}
            isDesigner={isDesigner}
          />
        )}

        <Separator />

        {/* Timeline */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">Order Timeline</h2>
          <OrderTimeline updates={order.updates} />
        </div>

        {/* Cost Book — designer only, confirmed+ orders */}
        {isDesigner && currentStageIndex >= 0 && (
          <>
            <Separator />
            <CostBookPanel
              orderId={order.id}
              materials={order.materials}
              onMaterialChange={() => refetch()}
            />
          </>
        )}

        {/* Measurement attached */}
        {order.measurement && (
          <>
            <Separator />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Ruler className="h-4 w-4" />
                  Measurement Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">
                  {order.measurement.label}
                  {order.measurement.isDefault && (
                    <Badge variant="secondary" className="ml-2 text-xs">Default</Badge>
                  )}
                </p>
                {order.measurement.data && (
                  <dl className="mt-2 grid grid-cols-3 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {order.measurement.data.upper_body &&
                      Object.entries(order.measurement.data.upper_body).map(
                        ([key, val]) =>
                          val != null && (
                            <div key={key}>
                              <dt className="capitalize">
                                {key.replace(/_/g, " ")}
                              </dt>
                              <dd className="font-medium text-foreground">
                                {String(val)} {order.measurement!.unit}
                              </dd>
                            </div>
                          )
                      )}
                    {order.measurement.data.lower_body &&
                      Object.entries(order.measurement.data.lower_body).map(
                        ([key, val]) =>
                          val != null && (
                            <div key={key}>
                              <dt className="capitalize">
                                {key.replace(/_/g, " ")}
                              </dt>
                              <dd className="font-medium text-foreground">
                                {String(val)} {order.measurement!.unit}
                              </dd>
                            </div>
                          )
                      )}
                  </dl>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Blueprint summary */}
        {order.blueprint && (
          <>
            <Separator />
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Blueprint Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {order.blueprint.garment_type && (
                    <>
                      <dt className="text-muted-foreground">Garment Type</dt>
                      <dd className="capitalize font-medium">
                        {order.blueprint.garment_type.replace(/_/g, " ")}
                      </dd>
                    </>
                  )}
                  {order.blueprint.occasion && (
                    <>
                      <dt className="text-muted-foreground">Occasion</dt>
                      <dd className="capitalize font-medium">
                        {order.blueprint.occasion.replace(/_/g, " ")}
                      </dd>
                    </>
                  )}
                  {order.blueprint.fabric_type && (
                    <>
                      <dt className="text-muted-foreground">Fabric</dt>
                      <dd className="capitalize font-medium">
                        {order.blueprint.fabric_type.replace(/_/g, " ")}
                      </dd>
                    </>
                  )}
                  {order.deadlineStart && (
                    <>
                      <dt className="text-muted-foreground">Estimated Start</dt>
                      <dd className="font-medium">
                        {new Date(order.deadlineStart).toLocaleDateString()}
                      </dd>
                    </>
                  )}
                </dl>

                {/* Fabric types (from enhanced orders) */}
                {bpFabricTypes.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-sm text-muted-foreground">Fabrics</p>
                    <div className="flex flex-wrap gap-1.5">
                      {bpFabricTypes.map((f) => (
                        <Badge key={f} variant="secondary" className="text-xs capitalize">
                          {f.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional details */}
                {bpAdditionalDetails.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-sm text-muted-foreground">Additional Details</p>
                    <div className="flex flex-wrap gap-1.5">
                      {bpAdditionalDetails.map((d) => (
                        <Badge key={d} variant="outline" className="text-xs capitalize">
                          {d.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {bpDescription && (
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Description</p>
                    <p className="text-sm">{bpDescription}</p>
                  </div>
                )}

                {/* Reference images */}
                {bpReferenceImages.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm text-muted-foreground">
                      Reference Images
                    </p>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                      {bpReferenceImages.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open reference image ${i + 1} full size`}
                          className="relative aspect-square overflow-hidden rounded-lg"
                        >
                          <Image
                            src={url}
                            alt={`Reference ${i + 1}`}
                            fill
                            sizes="(max-width: 640px) 33vw, 200px"
                            className="object-cover transition-transform hover:scale-105"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {order.notes && (
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Notes</p>
                    <p className="text-sm">{order.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppShell>
  );
}
