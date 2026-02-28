export interface GqlUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  otherNames: string | null;
  fullName: string | null;
  phone: string | null;
  email: string | null;
  avatarUrl: string | null;
  city: string | null;
  isVerified: boolean;
  isDesigner: boolean;
  isOnboarded: boolean;
}

export interface RequestOtpData {
  requestOtp: {
    success: boolean;
    message: string;
  };
}

export interface VerifyOtpData {
  verifyOtp: {
    token: string;
    isNew: boolean;
    user: GqlUser;
  };
}

export interface SocialLoginData {
  socialLogin: {
    token: string;
    isNew: boolean;
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
  me: GqlUser;
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
  profileCompleteness: number;
  createdAt: string;
  updatedAt: string;
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
  locationLat?: number;
  locationLng?: number;
  isAcceptingOrders?: boolean;
  equipment?: string[];
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
}

export interface GqlMeasurement {
  id: string;
  label: string;
  unit: string;
  data: MeasurementData;
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

export interface ExtractAiMeasurementsData {
  extractAiMeasurements: MeasurementData;
}

export interface CreateMeasurementInput {
  label: string;
  unit?: string;
  data: MeasurementData;
  source?: string;
}

export interface UpdateMeasurementInput {
  label?: string;
  unit?: string;
  data?: MeasurementData;
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
  materials: GqlOrderMaterial[];
  payments: GqlPayment[];
  paymentSummary: GqlPaymentSummary | null;
  conversation: { id: string } | null;
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

export interface GqlOrderMaterial {
  id: string;
  orderId: string;
  name: string;
  unitCost: number;
  quantity: number;
  totalCost: number;
  isPurchased: boolean;
  createdAt: string;
}

export interface GqlProfitSummary {
  totalMaterialCost: number;
  confirmedPrice: number;
  profit: number;
  marginPercent: number;
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

export interface AddMaterialData {
  addMaterial: GqlOrderMaterial;
}

export interface TogglePurchasedData {
  togglePurchased: GqlOrderMaterial;
}

export interface RemoveMaterialData {
  removeMaterial: boolean;
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
export type PaymentMethodValue = "card" | "momo_mtn" | "momo_vodafone" | "momo_airteltigo";
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
}

export interface InitiatePaymentInput {
  orderId: string;
  type: "deposit" | "balance";
  method: PaymentMethodValue;
  callbackUrl: string;
  phone?: string;
  otp?: string;
  sessionId?: string;
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
