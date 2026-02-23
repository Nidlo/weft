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
  clientId: string;
  designerId: string;
  measurementId: string | null;
  blueprint: BlueprintData;
  status: string;
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  isRush: boolean;
  notes: string | null;
  createdAt: string;
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
