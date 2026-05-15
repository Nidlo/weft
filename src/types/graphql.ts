export interface GqlDesignerProfileSummary {
  slug: string | null;
  profileViewsCount: number;
  profileViewsThisWeek: number;
}

export interface GqlUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  otherNames: string | null;
  fullName: string | null;
  heightCm: number | null;
  phone: string | null;
  email: string | null;
  avatarUrl: string | null;
  city: string | null;
  region: string | null;
  countryCode: string | null;
  locationLat: number | null;
  locationLng: number | null;
  addressLine: string | null;
  postalCode: string | null;
  formattedAddress: string | null;
  isVerified: boolean;
  isDesigner: boolean;
  isOnboarded: boolean;
  hasVerifiedWalletAccount: boolean;
  termsAcceptedVersion: string | null;
  tourProgress: Record<string, "completed" | "skipped"> | null;
}

export interface GqlLegalVersions {
  termsVersion: string;
  privacyVersion: string;
}

export interface LegalVersionsData {
  legalVersions: GqlLegalVersions;
}

export interface RequestOtpData {
  requestOtp: {
    success: boolean;
    message: string;
  };
}

/**
 * Surface set when verifyOtp matches a soft-deleted account still inside its
 * 30-day recovery window. Backend does NOT sign the caller in; the caller
 * must choose between `restoreAccount` and `declineRestore`.
 */
export interface GqlPendingRestore {
  /** ISO 8601 timestamp when the account was soft-deleted (window start). */
  deletedAt: string;
  /** ISO 8601 timestamp after which the account is permanently purged. */
  expiresAt: string;
  /** Whole days remaining in the window (floored; 0 once we're inside the final 24h). */
  daysRemaining: number;
}

export interface VerifyOtpData {
  verifyOtp: {
    token: string | null;
    isNew: boolean;
    /** Orphan orders (parked against this phone by a designer) that were claimed at signup. */
    claimedOrdersCount: number;
    /** Orphan measurements (parked against this phone by a designer) that were claimed at signup. */
    claimedMeasurementsCount: number;
    user: GqlUser;
    /** Populated only when the phone matches a soft-deleted account inside its recovery window. The caller has NOT been signed in. */
    pendingRestore: GqlPendingRestore | null;
  };
}

export interface RestoreAccountData {
  restoreAccount: {
    isNew: boolean;
    claimedOrdersCount: number;
    claimedMeasurementsCount: number;
    user: GqlUser;
  };
}

export interface DeclineRestoreData {
  declineRestore: boolean;
}

export interface DeleteMyAccountData {
  deleteMyAccount: {
    success: boolean;
    immediate: boolean;
    /** Null when `immediate` is true. */
    deletedAt: string | null;
    /** Null when `immediate` is true. After this instant the account is permanently purged. */
    recoverableUntil: string | null;
  };
}

export interface SocialLoginData {
  socialLogin: {
    token: string | null;
    isNew: boolean;
    claimedOrdersCount: number;
    claimedMeasurementsCount: number;
    user: GqlUser;
  };
}

export interface BecomeDesignerData {
  becomeDesigner: {
    id: string;
    isDesigner: boolean;
    designerProfile: { id: string } | null;
  };
}

export interface CompleteOnboardingData {
  completeOnboarding: {
    id: string;
    isOnboarded: boolean;
    onboardedAt: string | null;
  };
}

export interface MeData {
  me: GqlUser & { designerProfile?: GqlDesignerProfileSummary | null };
}

export interface LogoutData {
  logout: boolean;
}

// --- Sprint 2: Designer Profiles & Discovery ---

export interface GqlDesignerProfile {
  id: string;
  displayName: string | null;
  slug: string | null;
  bio: string | null;
  specializations: string[] | null;
  pricingMin: number | null;
  pricingMax: number | null;
  portfolioImages: PortfolioImage[] | null;
  equipment: string[] | null;
  ratingAvg: number;
  totalReviews: number;
  ordersCompleted: number;
  onTimeRate: number;
  responseTimeAvg: number | null;
  isAcceptingOrders: boolean;
  workshopName: string | null;
  workshopAddress: string | null;
  workshopLat: number | null;
  workshopLng: number | null;
  profileCompleteness: number;
  profileViewsCount: number;
  profileViewsThisWeek: number;
  createdAt: string;
  updatedAt: string;
  // Effective public-visibility map (designer's choices over the
  // privacy-first defaults). Present on the public + edit queries.
  publicVisibility?: DesignerPublicVisibility | null;
}

export interface DesignerPublicVisibility {
  bio: boolean;
  pricing: boolean;
  portfolio: boolean;
  experience: boolean;
  stats: boolean;
  city: boolean;
  workshop: boolean;
}

export interface PortfolioImage {
  url: string;
  thumbnail_url: string;
  public_id: string;
  tags: string[];
  caption: string | null;
  order: number;
}

export interface DesignerCard {
  id: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  displayName: string | null;
  slug: string | null;
  avatarUrl: string | null;
  city: string | null;
  specializations: string[] | null;
  pricingMin: number | null;
  pricingMax: number | null;
  ratingAvg: number;
  totalReviews: number;
  ordersCompleted: number;
  isAcceptingOrders: boolean;
  profileCompleteness: number;
  distance: number | null;
}

export interface PaginatorInfo {
  count: number;
  hasMorePages: boolean;
  endCursor: string | null;
}

export interface DesignerConnection {
  data: DesignerCard[];
  paginatorInfo: PaginatorInfo;
}

export interface Specialization {
  id: string;
  name: string;
  slug: string;
  isQuickFilter: boolean;
}

export interface City {
  id: string;
  name: string;
  countryCode: string;
}

export interface FashionInterest {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  isDefault: boolean;
}

export interface GqlCountry {
  id: string;
  name: string;
  iso2: string;
  phoneCode: string;
  emoji: string | null;
  currency: string | null;
  currencySymbol: string | null;
  isActive: boolean;
  phoneDigits: number | null;
  phoneStartsWithZero: boolean;
  phonePlaceholder: string | null;
}

export interface FashionInterestsData {
  fashionInterests: FashionInterest[];
}

export interface CountriesData {
  countries: GqlCountry[];
}

export interface CompleteClientOnboardingData {
  completeClientOnboarding: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    fullName: string | null;
    email: string | null;
    city: string | null;
    isOnboarded: boolean;
    onboardedAt: string | null;
  };
}

export interface SearchDesignersInput {
  query?: string;
  city?: string;
  specializations?: string[];
  priceMin?: number;
  priceMax?: number;
  minRating?: number;
  acceptingOnly?: boolean;
  sortBy?: string;
  lat?: number;
  lng?: number;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  otherNames?: string;
  displayName?: string;
  bio?: string;
  specializations?: string[];
  pricingMin?: number;
  pricingMax?: number;
  city?: string;
  addressLine?: string;
  region?: string;
  postalCode?: string;
  formattedAddress?: string;
  countryCode?: string;
  locationLat?: number;
  locationLng?: number;
  isAcceptingOrders?: boolean;
  equipment?: string[];
  yearsOfExperience?: number;
}

// --- GraphQL Response Types ---

export interface GqlUserWithProfile extends GqlUser {
  countryCode: string | null;
  locationLat: number | null;
  locationLng: number | null;
  designerProfile: GqlDesignerProfile | null;
}

export interface DesignersData {
  designers: DesignerConnection;
}

export interface DesignerData {
  designer: GqlUserWithProfile | null;
}

export interface MyDesignerProfileData {
  me: {
    id: string;
    designerProfile: GqlDesignerProfile | null;
  };
}

export interface SpecializationsData {
  specializations: Specialization[];
}

export interface CitiesData {
  cities: City[];
}

export interface UpdateProfileData {
  updateProfile: GqlDesignerProfile;
}

export interface UpdateAvatarData {
  updateAvatar: GqlUser;
}

export interface AddPortfolioImageData {
  addPortfolioImage: GqlDesignerProfile;
}

export interface RemovePortfolioImageData {
  removePortfolioImage: GqlDesignerProfile;
}

export interface ReorderPortfolioImagesData {
  reorderPortfolioImages: GqlDesignerProfile;
}

// --- Dynamic Lookup Mutations ---

export interface CreateSpecializationData {
  createSpecialization: Specialization;
}

export interface CreateCityData {
  createCity: City;
}

// --- Sprint 3: Blueprint & Measurement ---

export interface BlueprintOption {
  value: string;
  label: string;
}

export interface BlueprintOptions {
  garmentTypes: BlueprintOption[];
  occasions: BlueprintOption[];
  designFields: Record<string, BlueprintOption[]>;
  garmentFields: Record<string, string[]>;
  fabricTypes: BlueprintOption[];
  measurementFields: Record<string, string[]>;
}

export interface BlueprintOptionsData {
  blueprintOptions: BlueprintOptions;
}

export interface MeasurementData {
  upper_body?: Record<string, number | null>;
  lower_body?: Record<string, number | null>;
  vertical?: Record<string, number | null>;
  // Sprint 36 booth-coverage. Style choices, not AI-measured fields;
  // populated only via the manual form (blouse_length, kaba_length,
  // skirt_length, slit_length, dress_length, cape).
  garments?: Record<string, number | null>;
}

/**
 * Canonical mm-integer payload returned by `Measurement.dataMm` /
 * `aiBaselineMm` / `manualOverridesMm`. Same shape as `MeasurementData`
 * but the leaf values are integer millimetres (S1B). The display path
 * still reads `data` + `unit` until S2 switches it; new components can
 * read `dataMm` directly via the helper's `mm` source unit.
 */
export type MeasurementMmData = {
  upper_body?: Record<string, number | null>;
  lower_body?: Record<string, number | null>;
  vertical?: Record<string, number | null>;
  garments?: Record<string, number | null>;
};

export interface GqlMeasurement {
  id: string;
  label: string;
  /**
   * Canonical mm-integer payload. The only persisted measurement values
   * post-S1c; display layers convert through `formatMeasurement(mm, "mm",
   * displayUnit)`.
   */
  dataMm: MeasurementMmData;
  aiBaselineMm: MeasurementMmData | null;
  manualOverridesMm: MeasurementMmData;
  /**
   * User-corrected MediaPipe landmark positions captured from the
   * editable LandmarkOverlay (S2.5b). Null on manual rows or AI rows
   * where the user didn't touch the overlay.
   */
  landmarksNormalized: Landmarks | null;
  /**
   * Read-time URL for the AI-extracted source photo (S2.5c). The shape
   * depends on `photoDisk`: a signed Laravel route for `'local'`, the
   * stable CDN URL for `'imagekit'`, or a short-lived signed URL for
   * `'s3'`. Null on manual rows or rows whose upload failed.
   */
  photoUrl: string | null;
  /**
   * Which storage backend wrote the photo. `'local'` (default) | `'imagekit'`
   * | `'s3'`. Surfaced so callers can decide rendering strategy if
   * needed; null on rows without a photo.
   */
  photoDisk: string | null;
  confirmedAt: string | null;
  source: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MyMeasurementsData {
  myMeasurements: GqlMeasurement[];
}

export interface CreateMeasurementData {
  createMeasurement: GqlMeasurement;
}

export interface UpdateMeasurementData {
  updateMeasurement: GqlMeasurement;
}

export interface DeleteMeasurementData {
  deleteMeasurement: boolean;
}

export interface SetDefaultMeasurementData {
  setDefaultMeasurement: GqlMeasurement;
}

export interface ResetMeasurementFieldData {
  resetMeasurementField: GqlMeasurement;
}

export type RescanTier = "auto" | "prompt" | "reject";

export interface GqlMeasurementSnapshot {
  id: string;
  dataMm: MeasurementMmData;
  sourceKind: string;
  notes: string | null;
  recordedAt: string;
}

export interface MeasurementHistoryData {
  measurementHistory: GqlMeasurementSnapshot[];
}

export interface MeasurementFieldRef {
  section: string;
  field: string;
}

export interface MeasurementFieldDelta {
  section: string;
  field: string;
  baselineMm: number | null;
  proposedMm: number | null;
  deltaMm: number | null;
  tier: RescanTier;
}

export interface ApplyRescanInput {
  data: MeasurementData;
  unit?: string;
  confirmedFields?: MeasurementFieldRef[];
}

export interface ApplyRescanResult {
  measurement: GqlMeasurement;
  deltas: MeasurementFieldDelta[];
  applied: MeasurementFieldRef[];
  rejected: MeasurementFieldRef[];
}

export interface ApplyRescanData {
  applyMeasurementRescan: ApplyRescanResult;
}

/**
 * Per-landmark normalized 0-1 coordinates returned from the AI service
 * (S2.5). Names match the MediaPipe pose taxonomy (e.g. "left_shoulder",
 * "right_hip"). `null` when the upstream service is the legacy Flask path
 * (Live-Measurements-Api) that doesn't emit pose data.
 */
export interface PoseLandmark {
  x: number;
  y: number;
  visibility: number;
}

export type Landmarks = Record<string, PoseLandmark>;

export interface ExtractAiMeasurementsResult {
  data: MeasurementData;
  landmarks: Landmarks | null;
  /** Cached URL when the disk returns one (ImageKit); null for local + s3 (those are computed at read time). */
  photoUrl: string | null;
  /** Disk-specific identifier the storage layer needs to delete the asset. */
  photoPublicId: string | null;
  /** Which disk wrote the asset: `'local'` | `'imagekit'` | `'s3'`. Pass through verbatim on save. */
  photoDisk: string | null;
  /**
   * Structured signals about the AI run (FS-NIDLO-VALID-03). Empty when
   * nothing degraded. Currently emitted: `'validators_disagree'` when
   * the rule validator and Claude validator disagreed on `is_valid`.
   * Render a "Manual review recommended" badge when this array is
   * non-empty.
   */
  degradedModes: string[];
}

export type ScanJobStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "image_rejected";

export type ScanJobErrorCategory =
  | "image_quality"
  | "upstream_unavailable"
  | "upstream_error"
  | "claude_failed"
  | "unknown";

/**
 * One AI body-scan attempt, created by the `extractAiMeasurements`
 * mutation and polled via `MEASUREMENT_SCAN_JOB` until terminal. Sprint
 * 33b will push the same payload over Reverb so polling becomes a fallback.
 */
export interface MeasurementScanJob {
  id: string;
  status: ScanJobStatus;
  errorCategory: ScanJobErrorCategory | null;
  errorMessage: string | null;
  /** Populated only when `status === "completed"`. */
  result: ExtractAiMeasurementsResult | null;
}

export interface ExtractAiMeasurementsData {
  extractAiMeasurements: Pick<MeasurementScanJob, "id" | "status">;
}

export interface MeasurementScanJobData {
  measurementScanJob: MeasurementScanJob | null;
}

export interface CreateMeasurementInput {
  label: string;
  unit?: string;
  data: MeasurementData;
  source?: string;
  /** User-corrected landmark coordinates from the editable overlay (S2.5b). */
  landmarks?: Landmarks;
  /** Cached URL of the source photo (S2.5c). Set only for the imagekit disk; pass through verbatim from the extractAiMeasurements result. */
  photoUrl?: string;
  /** Disk-specific identifier (path on local, fileId on imagekit, S3 key on backblaze). */
  photoPublicId?: string;
  /** Which storage disk wrote the asset; pass through verbatim from extractAiMeasurements. */
  photoDisk?: string;
}

export interface UpdateMeasurementInput {
  label?: string;
  unit?: string;
  data?: MeasurementData;
  /** User-corrected landmark coordinates from the editable LandmarkOverlay. Replaces `landmarks_normalized` on the row when present; omit to leave unchanged. */
  landmarks?: Landmarks;
}

export interface BlueprintData {
  garment_type: string;
  garment_type_other?: string;
  occasion: string;
  design_details?: Record<string, string | string[]>;
  additional_details?: string[];
  free_text?: string;
  reference_images?: string[];
  fabric_type: string;
  fabric_type_other?: string;
  fabric_colour?: string;
  fabric_colour_hex?: string;
  client_providing_fabric?: boolean;
  fabric_notes?: string;
}

export interface GqlOrder {
  id: string;
  clientId: string | null;
  designerId: string;
  measurementId: string | null;
  blueprint: BlueprintData;
  status: string;
  budgetMin: number;
  budgetMax: number;
  counterPrice: number | null;
  counterMessage: string | null;
  declineReason: string | null;
  confirmedPrice: number | null;
  deadline: string;
  deadlineStart: string | null;
  isRush: boolean;
  isInternal: boolean;
  notes: string | null;
  clientPhone: string | null;
  clientName: string | null;
  clientDisplayName: string | null;
  hasLinkedClient: boolean;
  deliveredAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  paymentSummary?: GqlPaymentSummary | null;
}

export interface GqlOrderDetail extends GqlOrder {
  client: GqlUser | null;
  designer: GqlUser;
  measurement: GqlMeasurement | null;
  updates: GqlOrderUpdate[];
  items: GqlOrderItem[];
  /** @deprecated alias for items, kept for one release. */
  materials: GqlOrderItem[];
  garmentEases: GqlOrderGarmentEase[];
  payments: GqlPayment[];
  payouts: GqlPayout[];
  externalPayments: GqlExternalPayment[];
  paymentSummary: GqlPaymentSummary | null;
  conversation: { id: string } | null;
  review: GqlReview | null;
}

export interface GqlOrderGarmentEase {
  id: string;
  orderId: string;
  section: string;
  field: string;
  /** Signed mm offset. Positive = extra room, negative = take in. */
  deltaMm: number;
  note: string | null;
  createdBy: GqlUser | null;
  createdAt: string;
  updatedAt: string;
}

export interface SetOrderGarmentEaseInput {
  orderId: string;
  section: string;
  field: string;
  /** Pass deltaMm directly... */
  deltaMm?: number;
  /** ...OR (delta + unit) for cm/inches input. */
  delta?: number;
  unit?: "cm" | "inches";
  note?: string | null;
}

export interface SetOrderGarmentEaseData {
  setOrderGarmentEase: GqlOrderGarmentEase;
}

export interface ClearOrderGarmentEaseData {
  clearOrderGarmentEase: boolean;
}

export interface GqlOrderUpdate {
  id: string;
  orderId: string;
  fromStatus: string;
  toStatus: string;
  notes: string | null;
  photos: string[] | null;
  updatedBy: GqlUser;
  createdAt: string;
}

export interface GqlOrderItemMetadata {
  label: string;
  value: string;
}

export interface GqlOrderItem {
  id: string;
  orderId: string;
  itemType: string;
  name: string;
  description: string | null;
  metadata: GqlOrderItemMetadata[] | null;
  unitCost: number;
  quantity: number;
  totalCost: number;
  isPurchased: boolean;
  createdAt: string;
}

/**
 * @deprecated schema rename; alias kept so any in-flight imports compile
 * during the one-release back-compat window. New code should import GqlOrderItem.
 */
export type GqlOrderMaterial = GqlOrderItem;

export interface GqlProfitSummary {
  /** Canonical name post-rename. */
  totalItemCost: number;
  /** @deprecated alias for totalItemCost, kept for one release. */
  totalMaterialCost: number;
  confirmedPrice: number;
  profit: number;
  marginPercent: number;
  /** Canonical name post-rename. */
  itemCount: number;
  /** @deprecated alias for itemCount, kept for one release. */
  materialCount: number;
  purchasedCount: number;
}

export interface OrderConnection {
  data: GqlOrder[];
  paginatorInfo: PaginatorInfo;
}

export interface CreateOrderInput {
  designerId: string;
  measurementId?: string;
  blueprint: BlueprintData;
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  notes?: string;
}

export interface CreateOrderData {
  createOrder: GqlOrder;
}

export interface UploadReferenceImageData {
  uploadReferenceImage: {
    url: string;
    thumbnailUrl: string;
  };
}

export interface CreateBlueprintOptionData {
  createBlueprintOption: BlueprintOption;
}

// --- Sprint 4: Orders & Booking ---

export interface MyOrdersData {
  myOrders: OrderConnection;
}

export interface OrderDetailData {
  order: GqlOrderDetail;
}

export interface OrderTimelineData {
  orderTimeline: GqlOrderUpdate[];
}

export interface OrderProfitSummaryData {
  orderProfitSummary: GqlProfitSummary;
}

export interface RespondToOrderInput {
  orderId: string;
  action: "accept" | "counter" | "decline";
  counterPrice?: number;
  counterMessage?: string;
  declineReason?: string;
}

export interface UpdateOrderStatusInput {
  orderId: string;
  status: string;
  notes?: string;
  /**
   * Set by the FE after the designer confirms a "deposit not recorded"
   * dialog. Tells the backend to bypass the deposit gate and record the
   * override on the order_updates audit row. Default false; clients
   * never set this without an explicit user confirmation.
   */
  acceptUnpaidDeposit?: boolean;
}

export interface AddMaterialInput {
  orderId: string;
  name: string;
  unitCost: number;
  quantity?: number;
}

export interface RespondToOrderData {
  respondToOrder: GqlOrder;
}

export interface ConfirmOrderData {
  confirmOrder: GqlOrder;
}

export interface UpdateOrderStatusData {
  updateOrderStatus: GqlOrder;
}

export interface CancelOrderData {
  cancelOrder: GqlOrder;
}

export interface ConfirmDeliveryData {
  confirmDelivery: GqlOrder;
}

export interface AddItemInput {
  orderId: string;
  itemType?: string;
  name: string;
  description?: string;
  metadata?: GqlOrderItemMetadata[];
  unitCost: number;
  quantity?: number;
}

export interface AddItemData {
  addItem: GqlOrderItem;
}

export interface TogglePurchasedData {
  togglePurchased: GqlOrderItem;
}

export interface RemoveItemData {
  removeItem: boolean;
}

// --- Client Search ---

export interface ClientSearchResult {
  id: string;
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  city: string | null;
}

export interface SearchClientsData {
  searchClients: ClientSearchResult[];
}

// --- Sprint 4B: Internal Orders ---

export interface CreateInternalOrderInput {
  garmentType: string;
  clientId?: string;
  clientPhone?: string;
  clientName?: string;
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  deadlineStart?: string;
  notes?: string;
  fabricTypes?: string[];
  additionalDetails?: string[];
  description?: string;
  referenceImages?: string[];
  measurementId?: string;
  blueprint?: Partial<BlueprintData>;
}

export interface CreateInternalOrderData {
  createInternalOrder: GqlOrder;
}

export interface UpdateOrderInput {
  orderId: string;
  garmentType?: string;
  budgetMin?: number;
  budgetMax?: number;
  confirmedPrice?: number;
  deadline?: string;
  deadlineStart?: string;
  notes?: string;
  description?: string;
  referenceImages?: string[];
  fabricTypes?: string[];
  additionalDetails?: string[];
  measurementId?: string;
  clientId?: string;
  clientName?: string;
  clientPhone?: string;
}

export interface UpdateOrderData {
  updateOrder: GqlOrder;
}

export interface ClientMeasurementsData {
  clientMeasurements: GqlMeasurement[];
}

// --- Sprint 5: Messaging ---

export interface GqlConversationParticipant {
  id: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  avatarUrl: string | null;
}

export interface GqlConversation {
  id: string;
  orderId: string;
  designerId: string;
  clientId: string;
  lastMessageAt: string | null;
  order: {
    id: string;
    blueprint: { garment_type?: string } | null;
    status: string;
  };
  designer: GqlConversationParticipant;
  client: GqlConversationParticipant;
  latestMessage: GqlMessage | null;
  unreadCount: number;
}

export interface GqlMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  readAt: string | null;
  createdAt: string;
  sender: GqlConversationParticipant;
}

export interface GqlMessagePage {
  data: GqlMessage[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface SendMessageInput {
  conversationId?: string;
  orderId?: string;
  body?: string;
  mediaUrl?: string;
}

export interface MyConversationsData {
  myConversations: GqlConversation[];
}

export interface ConversationMessagesData {
  conversationMessages: GqlMessagePage;
}

export interface SendMessageData {
  sendMessage: GqlMessage;
}

export interface MarkMessagesReadData {
  markMessagesRead: boolean;
}

export interface UnreadMessagesCountData {
  unreadMessagesCount: number;
}

export interface StartConversationData {
  startConversation: { id: string };
}

// --- Sprint 6: Payments ---

export type PaymentTypeValue = "deposit" | "balance" | "refund";
export type PaymentMethodValue =
  | "card"
  | "momo_mtn"
  | "momo_vodafone"
  | "momo_airteltigo";
export type PaymentStatusValue = "pending" | "success" | "failed" | "refunded";
export type PaymentProviderValue = "moolre" | "paystack";

export interface GqlPayment {
  id: string;
  orderId: string;
  payerId: string;
  amount: number;
  currency: string;
  type: PaymentTypeValue;
  method: PaymentMethodValue;
  status: PaymentStatusValue;
  reference: string;
  provider: PaymentProviderValue;
  providerReference: string | null;
  providerStatus: string | null;
  paidAt: string | null;
  /** ISO 8601 timestamp set when payment is refunded; null otherwise. */
  refundedAt: string | null;
  /** Optional human reason recorded when the refund was issued. */
  refundReason: string | null;
  createdAt: string;
}

export interface GqlPaymentInitiation {
  payment: GqlPayment;
  authorizationUrl: string | null;
  isMomo: boolean;
  requiresOtp: boolean;
  sessionId: string | null;
}

export interface GqlPaymentSummary {
  depositStatus: PaymentStatusValue | null;
  balanceStatus: PaymentStatusValue | null;
  depositAmount: number | null;
  balanceAmount: number | null;
  totalPaidGateway: number;
  totalPaidExternal: number;
  totalPaid: number;
  amountRemaining: number;
  depositOwed: number;
  balanceOwed: number;
  isFullyPaid: boolean;
}

export interface InitiatePaymentInput {
  orderId: string;
  type: "deposit" | "balance";
  method: PaymentMethodValue;
  callbackUrl: string;
  phone?: string;
  otp?: string;
  sessionId?: string;
  idempotencyKey?: string;
}

export interface InitiatePaymentData {
  initiatePayment: GqlPaymentInitiation;
}

export interface PaymentStatusData {
  paymentStatus: GqlPayment | null;
}

export interface OrderPaymentsData {
  orderPayments: GqlPayment[];
}

// --- Sprint 6b: Payouts ---

export type PayoutStatusValue =
  | "pending"
  | "processing"
  | "success"
  | "failed"
  | "wallet_pending";

export interface GqlPayout {
  id: string;
  paymentId: string;
  designerId: string;
  orderId: string;
  grossAmount: number;
  platformFee: number;
  feeRate: number;
  netAmount: number;
  provider: PaymentProviderValue | null;
  status: PayoutStatusValue;
  reference: string;
  providerReference: string | null;
  recipientPhone: string | null;
  recipientNetwork: string | null;
  recipientName: string | null;
  transferredAt: string | null;
  createdAt: string;
}

export interface RequestPayoutData {
  requestPayout: GqlPayout;
}

export interface OrderPayoutsData {
  orderPayouts: GqlPayout[];
}

// --- Sprint 7: Reviews & Ratings ---

export interface GqlReviewPhoto {
  url: string;
  thumbnail_url: string;
  public_id: string;
}

export interface GqlReview {
  id: string;
  orderId: string;
  reviewerId: string;
  designerId: string;
  rating: number;
  comment: string | null;
  photos: GqlReviewPhoto[] | null;
  designerResponse: string | null;
  designerRespondedAt: string | null;
  createdAt: string;
  reviewer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    fullName: string | null;
    avatarUrl: string | null;
  };
}

export interface GqlRatingBreakdown {
  five: number;
  four: number;
  three: number;
  two: number;
  one: number;
}

export interface ReviewConnection {
  data: GqlReview[];
  paginatorInfo: PaginatorInfo;
}

export interface SubmitReviewInput {
  orderId: string;
  rating: number;
  comment?: string;
  photos?: File[];
}

export interface SubmitReviewData {
  submitReview: GqlReview;
}

export interface RespondToReviewData {
  respondToReview: {
    id: string;
    designerResponse: string;
    designerRespondedAt: string;
  };
}

export interface DesignerReviewsData {
  designerReviews: ReviewConnection;
}

export interface RatingBreakdownData {
  ratingBreakdown: GqlRatingBreakdown;
}

// --- Sprint 8: Wallets & External Payments ---

export type MomoNetworkValue = "mtn" | "telecel" | "at";

export interface GqlWalletAccount {
  id: string;
  userId: string;
  type: string;
  accountNumber: string;
  accountName: string;
  bankCode: string | null;
  network: MomoNetworkValue | null;
  networkLabel: string | null;
  isPrimary: boolean;
  isVerified: boolean;
  verifiedAt: string | null;
  createdAt: string;
}

export interface GqlResolvedAccount {
  accountName: string;
  accountNumber: string;
}

export interface GqlEarningsBreakdownItem {
  payoutId: string;
  orderId: string;
  grossPesewas: number;
  feePesewas: number;
  netPesewas: number;
  status: PayoutStatusValue;
  transferredAt: string | null;
  createdAt: string;
}

export interface GqlEarningsSummary {
  ordersCount: number;
  grossPesewas: number;
  feePesewas: number;
  netPesewas: number;
  paidOutPesewas: number;
  awaitingPayoutSetupPesewas: number;
  breakdown: GqlEarningsBreakdownItem[];
}

export interface MyEarningsSummaryData {
  myEarningsSummary: GqlEarningsSummary;
}

export interface ResolveMomoAccountData {
  resolveMomoAccount: GqlResolvedAccount;
}

export interface AddWalletAccountData {
  addWalletAccount: GqlWalletAccount;
}

export interface SetWalletPrimaryData {
  setWalletPrimary: GqlWalletAccount;
}

export interface RemoveWalletAccountData {
  removeWalletAccount: boolean;
}

export interface MyWalletAccountsData {
  myWalletAccounts: GqlWalletAccount[];
}

export type ExternalPaymentMethodValue =
  | "cash"
  | "direct_momo"
  | "bank_transfer"
  | "other";

export type ExternalPaymentStatusValue = "pending" | "confirmed" | "rejected";

export interface GqlExternalPayment {
  id: string;
  orderId: string;
  recordedBy: string;
  confirmedBy: string | null;
  amount: number;
  method: ExternalPaymentMethodValue;
  methodLabel: string;
  status: ExternalPaymentStatusValue;
  statusLabel: string;
  paidAt: string;
  notes: string | null;
  rejectionReason: string | null;
  proofImages: Array<{
    url: string;
    fileId?: string;
    thumbnailUrl?: string;
  }> | null;
  createdAt: string;
}

export interface RecordExternalPaymentData {
  recordExternalPayment: GqlExternalPayment;
}

export interface ConfirmExternalPaymentData {
  confirmExternalPayment: GqlExternalPayment;
}

export interface RejectExternalPaymentData {
  rejectExternalPayment: GqlExternalPayment;
}

// --- Sprint 8: Notifications ---

export interface GqlNotification {
  id: string;
  type: string;
  typeLabel: string;
  typeIcon: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  actionUrl: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationChannels {
  push: boolean;
  sms: boolean;
}

export interface GqlNotificationPreferences {
  orderCreated: NotificationChannels;
  orderStatusChanged: NotificationChannels;
  messageReceived: NotificationChannels;
  paymentReceived: NotificationChannels;
  paymentConfirmed: NotificationChannels;
  reviewReceived: NotificationChannels;
  payoutProcessed: NotificationChannels;
  externalPaymentRecorded: NotificationChannels;
  /** "HH:MM" 24h start of quiet-hours window. null when not set. */
  quietHoursStart: string | null;
  /** "HH:MM" 24h end of quiet-hours window. null when not set. */
  quietHoursEnd: string | null;
}

export interface NotificationConnection {
  data: GqlNotification[];
  paginatorInfo: PaginatorInfo;
}

export interface MyNotificationsData {
  myNotifications: NotificationConnection;
}

export interface UnreadNotificationsCountData {
  unreadNotificationsCount: number;
}

export interface MyNotificationPreferencesData {
  myNotificationPreferences: GqlNotificationPreferences;
}

export interface MarkNotificationReadData {
  markNotificationRead: { id: string; readAt: string | null };
}

export interface MarkAllNotificationsReadData {
  markAllNotificationsRead: boolean;
}

export interface UpdateNotificationPreferencesData {
  updateNotificationPreferences: GqlNotificationPreferences;
}

export interface UpdateQuietHoursData {
  updateQuietHours: boolean;
}

export interface RegisterFcmTokenData {
  registerFcmToken: boolean;
}

// --- Verification Documents ---

export type DocumentTypeValue =
  | "national_id"
  | "business_registration"
  | "certificate"
  | "portfolio_proof"
  | "other";

export type DocumentStatusValue = "pending" | "approved" | "rejected";

export interface GqlVerificationDocument {
  id: string;
  type: DocumentTypeValue;
  documentUrl: string;
  status: DocumentStatusValue;
  rejectionReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface MyVerificationDocumentsData {
  myVerificationDocuments: GqlVerificationDocument[];
}

export interface UploadVerificationDocumentData {
  uploadVerificationDocument: GqlVerificationDocument;
}

export interface DeleteVerificationDocumentData {
  deleteVerificationDocument: boolean;
}

// =====================================================================
// Style classification (Anthropic Fitscan)
// =====================================================================

export type BodyShape =
  | "rectangle"
  | "hourglass"
  | "pear"
  | "inverted_triangle"
  | "oval";

export interface GqlStyleProfile {
  bodyShape: BodyShape;
  bodyShapeConfidence: number;
  flatteringSilhouettes: string[];
  colorPalette: string[];
  fabricRecommendations: string[];
  recommendedSpecializations: string[];
  summary: string;
  fromFallback: boolean;
  generatedAt: string;
}

export interface MyStyleProfileData {
  myStyleProfile: GqlStyleProfile | null;
}

export interface GenerateStyleProfileData {
  generateStyleProfile: GqlStyleProfile;
}
