import type {
  CreateVoucherInput,
  MerchantAccount,
  MerchantOrder,
  MerchantOrderFinancials,
  MerchantProduct,
  MerchantRegistrationDraft,
  MerchantStore,
  MerchantVoucher,
  NearbyRider,
  ProductImportResult,
  ProductImportRow,
  ProductVariant,
  StoreExpansionRequest,
  StoreInsights,
  StoreSlot,
  StoreTimelineEvent,
  ExpansionRequestType,
} from "../types";

export type CreateStoreInput = { name: string; category: string; address: string };
export type UpdateStoreInput = Partial<{
  name: string;
  category: string;
  address: string;
  coverageRadiusKm: number;
  description: string;
  phone: string;
  businessHours: string;
  logoLabel: string;
  coverImageLabel: string;
  latitude: number;
  longitude: number;
}>;
export type CreateProductInput = { name: string; price: number; productCategory: string; stock?: number };
export type UpdateProductInput = Partial<{ name: string; price: number; stock: number; isActive: boolean }>;
export type CreateVariantInput = { name: string; priceDelta: number; stock: number; sku: string };
export type UpdateVariantInput = Partial<CreateVariantInput>;
export type CreateExpansionRequestInput = {
  type: ExpansionRequestType;
  proposedAddress?: string;
  requestedCoverageRadiusKm?: number;
  note: string;
};

export type SaveRegistrationDraftInput = Partial<
  Omit<MerchantRegistrationDraft, "merchantAccountId" | "onboardingStatus" | "draftProducts">
>;

export type AddDraftProductInput = { name: string; price: number; productCategory: string };

/**
 * Single atomic transaction (Xano build, 2026-08-21): verifies the shared
 * OTP code, links the already-uploaded KYC assets to the account, creates
 * the Merchant profile + Main Store, and moves the account to
 * UNDER_REVIEW. Requires an authenticated session (Bearer token) -- caller
 * must already be logged in (register() -> login() -> verifyOtp() first).
 */
export type CompleteMerchantOnboardingInput = {
  otpCode: string;
  idType: string;
  idFrontAssetId: string;
  idBackAssetId: string;
  selfieAssetId: string;
  storeName: string;
  storeContact: string;
  storeCategory: string;
  storeSubcategory?: string;
  storeDescription: string;
  storeProvince: string;
  storeCity: string;
  storeBarangay: string;
  storeAddress: string;
  openingTime: string;
  closingTime: string;
};

export type CompleteMerchantOnboardingResult = {
  status: string;
  applicationId: string;
  merchantCode: string;
  storeCode: string;
  message: string;
};

export interface MerchantRepository {
  getMyAccount(): Promise<MerchantAccount>;

  completeOnboarding(input: CompleteMerchantOnboardingInput): Promise<CompleteMerchantOnboardingResult>;

  getRegistrationDraft(): Promise<MerchantRegistrationDraft>;
  saveRegistrationDraft(input: SaveRegistrationDraftInput): Promise<MerchantRegistrationDraft>;
  addDraftProduct(input: AddDraftProductInput): Promise<MerchantRegistrationDraft>;
  removeDraftProduct(draftProductId: string): Promise<MerchantRegistrationDraft>;
  submitRegistration(): Promise<MerchantRegistrationDraft>;

  getStoreSlots(): Promise<StoreSlot[]>;

  getMyStores(): Promise<MerchantStore[]>;
  getStoreById(storeId: string): Promise<MerchantStore | null>;
  createStore(input: CreateStoreInput): Promise<MerchantStore>;
  updateStore(storeId: string, input: UpdateStoreInput): Promise<MerchantStore>;
  toggleStoreStatus(storeId: string): Promise<MerchantStore>;

  getStoreProducts(storeId: string): Promise<MerchantProduct[]>;
  createProduct(storeId: string, input: CreateProductInput): Promise<MerchantProduct>;
  updateProduct(productId: string, input: UpdateProductInput): Promise<MerchantProduct>;
  bulkImportProducts(storeId: string, rows: ProductImportRow[]): Promise<ProductImportResult>;

  getProductVariants(productId: string): Promise<ProductVariant[]>;
  createVariant(productId: string, input: CreateVariantInput): Promise<ProductVariant>;
  updateVariant(variantId: string, input: UpdateVariantInput): Promise<ProductVariant>;
  deleteVariant(variantId: string): Promise<void>;

  getStoreExpansionRequests(storeId: string): Promise<StoreExpansionRequest[]>;
  createExpansionRequest(storeId: string, input: CreateExpansionRequestInput): Promise<StoreExpansionRequest>;

  getNearbyRiders(storeId: string): Promise<NearbyRider[]>;
  getStoreInsights(storeId: string): Promise<StoreInsights>;
  getStoreTimeline(storeId: string): Promise<StoreTimelineEvent[]>;

  getMyOrders(): Promise<MerchantOrder[]>;
  acceptOrder(orderId: string): Promise<MerchantOrder>;
  rejectOrder(orderId: string): Promise<MerchantOrder>;

  /** Delivery Fee Engine settlements for this store -- Distance, Delivery Fee, Customer Payment, Merchant Receives. */
  getOrderFinancials(storeId: string): Promise<MerchantOrderFinancials[]>;

  getMyVouchers(storeId: string): Promise<MerchantVoucher[]>;
  createVoucher(storeId: string, input: CreateVoucherInput): Promise<MerchantVoucher>;
  deactivateVoucher(voucherId: string): Promise<MerchantVoucher>;
}
