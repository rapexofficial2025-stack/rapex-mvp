/**
 * Provisional UI-facing shapes -- what screens need to render, not confirmed
 * Xano entity schemas. These will be reconciled field-for-field once the
 * real API contract lands; repositories are the only thing that should need
 * to change at that point.
 */
import type { ID, ISODateString, Paginated } from "@rapex/types";
import type { DeliveryFeeQuote, OrderFinancials, RouteEstimate } from "@rapex/utils";

// ---- Auth ----
export type AuthUser = {
  /** Internal DB primary key (UUID/native) -- used for all API calls, never shown to users. */
  id: ID;
  /**
   * Branded display ID (e.g. "USR-72726-000001") per the Hybrid Identity
   * Architecture decision (2026-08-04): DB relationships use the native
   * `id` above; this text field is for display/receipts/support only.
   * Optional because Mock repositories and any endpoint predating this
   * decision won't populate it.
   */
  rapexId?: string;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "rider" | "merchant" | "admin" | "super-admin";
};

export type AuthSession = {
  user: AuthUser;
  token: string;
};

// ---- Marketplace ----
export type Category = {
  id: ID;
  name: string;
  iconLabel: string;
};

export type StoreSummary = {
  id: ID;
  name: string;
  category: string;
  rating: number;
  isOpen: boolean;
  distanceKm: number;
  distanceLabel: string;
  deliveryTimeMinMinutes: number;
  deliveryTimeLabel: string;
};

export type ProductSummary = {
  id: ID;
  storeId: ID;
  name: string;
  price: number;
  imageLabel: string;
  productCategory: string;
};

export type ProductDetail = ProductSummary & {
  description: string;
  storeName: string;
  stock: number;
};

export type Review = {
  id: ID;
  authorName: string;
  rating: number;
  comment: string;
  date: ISODateString;
};

export type StoreDetail = StoreSummary & {
  coverImageLabel: string;
  logoLabel: string;
  isVerified: boolean;
  followerCount: number;
  reviewCount: number;
  description: string;
  businessHours: string;
  deliveryFee: number;
  minimumOrder: number;
  reviews: Review[];
};

// ---- Cart / Checkout ----
export type CartLine = {
  productId: ID;
  productName: string;
  storeName: string;
  unitPrice: number;
  quantity: number;
};

export type CheckoutSummary = {
  lines: CartLine[];
  subtotal: number;
  deliveryFee: number;
  /** "Platform Fee (if any)" -- 0 for Alpha, kept so the checkout breakdown never needs new fields to display it later. */
  platformFee: number;
  total: number;
};

// ---- Orders ----
export type OrderStatus = "pending" | "accepted" | "preparing" | "ready" | "delivering" | "completed" | "cancelled";

export type OrderSummary = {
  id: ID;
  storeName: string;
  status: OrderStatus;
  total: number;
  placedAt: ISODateString;
  itemCount: number;
};

// ---- Wallet ----
export type WalletTransaction = {
  id: ID;
  label: string;
  amount: number;
  direction: "credit" | "debit";
  occurredAt: ISODateString;
};

export type WalletSummary = {
  balance: number;
  transactions: WalletTransaction[];
};

// ---- Merchant ----
// Hierarchy: MerchantAccount -> MerchantStore[] -> MerchantProduct[] -> ProductVariant[].
// Products belong only to stores; variants belong only to products -- no global products.
export type MerchantApprovalStatus = "pending" | "approved" | "rejected";
export type MerchantVerificationStatus = "unverified" | "pending" | "verified";
export type MerchantStoreStatus = "online" | "offline";

export type MerchantAccount = {
  id: ID;
  ownerName: string;
  email: string;
  verificationStatus: MerchantVerificationStatus;
  onboardingStatus: MerchantOnboardingStatus;
  level: number;
  xp: number;
  xpForNextLevel: number;
};

// ---- Merchant Onboarding (KYC + guided registration) ----
export type MerchantOnboardingStatus = "draft" | "submitted" | "under_review" | "approved" | "rejected";

export type BusinessCategory = "food" | "market" | "shop" | "service";

export type BusinessStructure = "individual" | "dti" | "opc" | "corporation" | "partnership" | "cooperative";

export type VatStatus = "vat" | "non-vat";

export type DraftProduct = {
  id: ID;
  name: string;
  price: number;
  productCategory: string;
};

export type MerchantRegistrationDraft = {
  merchantAccountId: ID;
  currentStep: number;
  onboardingStatus: MerchantOnboardingStatus;

  // Step 1 -- KYC
  fullName: string;
  birthday: string;
  mobileNumber: string;
  email: string;
  residentialAddress: string;
  govIdUploaded: boolean;
  selfieUploaded: boolean;
  mobileOtpVerified: boolean;
  emailVerified: boolean;

  // Step 2 -- Business Category
  businessCategory: BusinessCategory | null;

  // Step 3 -- Business Nature
  businessNature: string | null;

  // Step 4 -- Store Details
  storeName: string;
  branchName: string;
  storeDescription: string;
  businessContactNumber: string;
  businessEmail: string;
  businessHours: string;
  operatingDays: string[];
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  storeAddress: string;
  latitude: number | null;
  longitude: number | null;

  // Step 5 -- Business Documents
  businessStructure: BusinessStructure | null;
  mayorsPermitUploaded: boolean;
  birRegistrationUploaded: boolean;
  tin: string;
  vatStatus: VatStatus | null;
  supportingDocumentsUploaded: boolean;

  // Step 6 -- Store Appearance
  logoUploaded: boolean;
  coverPhotoUploaded: boolean;
  galleryImageCount: number;

  // Step 7 -- Products (staged, created once the store exists)
  draftProducts: DraftProduct[];
};

export type StoreSlotStatus = "unlocked" | "available" | "locked";

export type StoreSlot = {
  index: number;
  label: string;
  status: StoreSlotStatus;
  unlockLevel: number;
  store: MerchantStore | null;
};

export type MerchantStore = {
  id: ID;
  merchantAccountId: ID;
  name: string;
  category: string;
  status: MerchantStoreStatus;
  approvalStatus: MerchantApprovalStatus;
  address: string;
  coverageRadiusKm: number;
  rating: number;
  productCount: number;
  description: string;
  phone: string;
  businessHours: string;
  logoLabel: string;
  coverImageLabel: string;
  latitude: number;
  longitude: number;
};

export type MerchantProduct = ProductSummary & {
  stock: number;
  isActive: boolean;
  variantCount: number;
};

export type ProductVariant = {
  id: ID;
  productId: ID;
  name: string;
  priceDelta: number;
  stock: number;
  sku: string;
};

export type MerchantOrder = OrderSummary & {
  customerName: string;
};

export type ExpansionRequestType = "new-branch" | "coverage-increase";
export type ExpansionRequestStatus = "pending" | "approved" | "rejected";

export type StoreExpansionRequest = {
  id: ID;
  storeId: ID;
  type: ExpansionRequestType;
  proposedAddress: string | null;
  requestedCoverageRadiusKm: number | null;
  note: string;
  status: ExpansionRequestStatus;
  submittedAt: ISODateString;
};

export type RiderAvailability = "available" | "busy" | "offline";

export type NearbyRider = {
  id: ID;
  name: string;
  vehicleType: string;
  distanceKm: number;
  rating: number;
  availability: RiderAvailability;
};

export type StoreInsightsTopProduct = {
  productId: ID;
  name: string;
  unitsSold: number;
  revenue: number;
};

export type StoreInsightsDailyRevenue = {
  date: ISODateString;
  revenue: number;
};

export type StoreInsights = {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  completionRate: number;
  last7DaysRevenue: StoreInsightsDailyRevenue[];
  topProducts: StoreInsightsTopProduct[];
};

export type StoreTimelineEventType = "order" | "store" | "product" | "system";

export type StoreTimelineEvent = {
  id: ID;
  storeId: ID;
  type: StoreTimelineEventType;
  message: string;
  occurredAt: ISODateString;
};

export type ProductImportRow = {
  name: string;
  price: number;
  productCategory: string;
  stock: number;
};

export type ProductImportResult = {
  imported: MerchantProduct[];
  failedCount: number;
};

// ---- Admin ----
export type PendingMerchantApproval = {
  id: ID;
  storeName: string;
  ownerName: string;
  submittedAt: ISODateString;
};

export type CustomerSummary = {
  id: ID;
  name: string;
  email: string;
  ordersCount: number;
  joinedAt: ISODateString;
};

export type PlatformStats = {
  customerCount: number;
  merchantCount: number;
  ordersToday: number;
  revenueToday: number;
};

// ---- Admin Dashboard ----
export type RecentOrderStatus = "pending" | "accepted" | "preparing" | "out-for-delivery" | "delivered" | "cancelled";

export type RecentOrderSummary = {
  id: ID;
  storeName: string;
  customerName: string;
  status: RecentOrderStatus;
  occurredAt: ISODateString;
};

export type SystemServiceStatus = "operational" | "degraded" | "down";

export type SystemStatusItem = {
  service: string;
  status: SystemServiceStatus;
};

export type MembershipExpiryItem = {
  merchantName: string;
  expiresAt: ISODateString;
  daysLeft: number;
};

export type RevenueBreakdownSlice = {
  label: "merchants" | "riders" | "platform-fee";
  amount: number;
};

export type DashboardOverview = {
  revenueToday: number;
  revenueTodayChangePercent: number;
  ordersToday: number;
  ordersTodayChangePercent: number;
  completedOrdersToday: number;
  completedOrdersChangePercent: number;
  pendingOrders: number;
  pendingOrdersChangePercent: number;
  onlineRiders: number;
  onlineStores: number;
  registeredCustomers: number;
  registeredMerchants: number;
  registeredRiders: number;
  productsListed: number;
  storesListed: number;
  categoriesCount: number;
  municipalitiesCount: number;
  activeAuctions: number;
  revenueTrend: { date: ISODateString; revenue: number }[];
  revenueBreakdown: RevenueBreakdownSlice[];
  recentOrders: RecentOrderSummary[];
  systemStatus: SystemStatusItem[];
  membershipExpirations: MembershipExpiryItem[];
};

// ---- Verification Queue ----
export type VerificationApplicantRole = "merchant" | "rider" | "service-provider";

export type VerificationApplicant = {
  id: ID;
  name: string;
  role: VerificationApplicantRole;
  submittedAt: ISODateString;
  documentLabels: string[];
  status: "pending" | "approved" | "rejected";
};

// ---- Engine Center (Super Admin system configuration) ----
export type AdminRole = "admin" | "super-admin";

export type CurrentAdmin = {
  id: ID;
  name: string;
  email: string;
  role: AdminRole;
};

export type EngineKey =
  | "marketplace"
  | "delivery"
  | "pricing"
  | "promotions"
  | "finance"
  | "membership"
  | "rewards"
  | "wallet"
  | "coverage"
  | "verification"
  | "orders"
  | "notifications"
  | "maps"
  | "developer";

export type EngineTierRule = {
  id: ID;
  engineKey: EngineKey;
  label: string;
  fromAmount: number;
  toAmount: number | null;
  commissionRatePercent: number;
  markupRatePercent: number;
  active: boolean;
  createdAt: ISODateString;
};

export type EngineChangeLogEntry = {
  id: ID;
  engineKey: EngineKey;
  summary: string;
  changedBy: string;
  changedAt: ISODateString;
};

export type AdminAccessGrant = {
  id: ID;
  adminId: string;
  email: string;
  grantedBy: string;
  grantedAt: ISODateString;
};

// ---- Rider ----
export type VehicleType = "motorcycle" | "bicycle" | "car" | "van";

export type RiderVerificationStatus = "pending" | "verified" | "rejected" | "suspended";

/** Online/offline/busy is independent of verification status -- a suspended rider can still be "offline". */
export type RiderAvailabilityStatus = "offline" | "online" | "busy";

export type RiderDocument = {
  type: "driver-license" | "valid-id" | "selfie-with-id" | "profile-photo";
  imageLabel: string;
  uploadedAt: ISODateString;
};

export type RiderProfile = {
  id: ID;
  fullName: string;
  profilePhotoLabel: string;
  birthday: ISODateString;
  age: number;
  phone: string;
  email: string;
  address: string;
  barangay: string;
  municipality: string;
  province: string;
  vehicleType: VehicleType;
  plateNumber: string;
  verificationStatus: RiderVerificationStatus;
  availabilityStatus: RiderAvailabilityStatus;
  locationPermissionEnabled: boolean;
  documents: RiderDocument[];
  rating: number;
  walletEligible: boolean;
  createdAt: ISODateString;
};

export type RiderEligibility = {
  eligible: boolean;
  reasons: string[];
};

// ---- Delivery type engine ----
export type DeliveryTypeRule = {
  vehicleType: VehicleType;
  capacityLabel: string;
  maxWeightKg: number;
  maxDistanceKm: number;
  estimatedSpeedKph: number;
  baseFare: number;
  perKmRate: number;
  available: boolean;
};

// ---- Delivery assignment + workflow ----
export type DeliveryOrderStatus =
  | "waiting"
  | "assigned"
  | "accepted"
  | "going-to-merchant"
  | "arrived-merchant"
  | "picked-up"
  | "on-the-way"
  | "arrived-customer"
  | "delivered"
  | "completed"
  | "cancelled"
  | "failed-delivery"
  | "returned";

export type DeliveryTimelineEntry = {
  status: DeliveryOrderStatus;
  occurredAt: ISODateString;
  note?: string;
};

export type DeliveryAssignmentOffer = {
  offerId: ID;
  orderId: ID;
  merchantName: string;
  merchantAddress: string;
  merchantLatitude: number;
  merchantLongitude: number;
  customerAddress: string;
  customerLatitude: number;
  customerLongitude: number;
  /** Rider's current location -> merchant. */
  pickupDistanceKm: number;
  /** Merchant -> customer (the leg the Delivery Fee Engine prices). */
  deliveryDistanceKm: number;
  /** pickupDistanceKm + deliveryDistanceKm */
  totalDistanceKm: number;
  estimatedTimeMinutes: number;
  productTotal: number;
  deliveryFee: number;
  estimatedRiderEarnings: number;
  itemCount: number;
  isHeavyItem: boolean;
  isPeakHour: boolean;
  expiresAt: ISODateString;
  secondsToRespond: number;
};

export type ActiveDelivery = {
  orderId: ID;
  status: DeliveryOrderStatus;
  merchantName: string;
  merchantAddress: string;
  merchantLatitude: number;
  merchantLongitude: number;
  customerName: string;
  customerAddress: string;
  customerLatitude: number;
  customerLongitude: number;
  customerPhone: string;
  itemCount: number;
  pickupDistanceKm: number;
  deliveryDistanceKm: number;
  estimatedTimeMinutes: number;
  productTotal: number;
  deliveryFee: number;
  estimatedRiderEarnings: number;
  timeline: DeliveryTimelineEntry[];
};

export type DeliveryProof = {
  orderId: ID;
  packagePhotoLabel: string;
  customerPhotoLabel: string | null;
  signatureDataUrl: string;
  latitude: number;
  longitude: number;
  capturedAt: ISODateString;
};

// ---- Commission engine ----
export type CommissionBreakdown = {
  orderId: ID;
  baseFare: number;
  distanceFare: number;
  extraDistanceFare: number;
  peakHourBonus: number;
  heavyItemBonus: number;
  merchantSubsidy: number;
  voucherSubsidy: number;
  promoDiscount: number;
  platformCommission: number;
  riderIncentive: number;
  customerTip: number;
  deliveryFee: number;
  netRiderIncome: number;
  computedAt: ISODateString;
};

// ---- Wallet (rider) ----
export type RiderWalletType = "operational" | "income";

export type RiderWalletTransactionType =
  | "top-up"
  | "deduction"
  | "delivery-income"
  | "adjustment"
  | "penalty"
  | "remittance";

export type RiderWalletTransaction = {
  id: ID;
  walletType: RiderWalletType;
  type: RiderWalletTransactionType;
  label: string;
  amount: number;
  direction: "credit" | "debit";
  occurredAt: ISODateString;
};

export type RiderWalletSummary = {
  operationalBalance: number;
  incomeBalance: number;
  minimumOperationalBalance: number;
  transactions: RiderWalletTransaction[];
};

// ---- Earnings ----
export type RiderEarningsSummary = {
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  lifetimeEarnings: number;
  deliveryCount: number;
  averageEarningsPerDelivery: number;
  totalDistanceKm: number;
  averageDeliveryTimeMinutes: number;
};

// ---- Weekly incentive engine ----
export type IncentiveProgress = {
  weekStart: ISODateString;
  weekEnd: ISODateString;
  completedDeliveries: number;
  targetDeliveries: number;
  rewardAmount: number;
  achieved: boolean;
  paidOut: boolean;
};

// ---- Referral engine ----
export type ReferralSummary = {
  referralCode: string;
  qrCodeDataUrl: string;
  invitedCount: number;
  approvedCount: number;
  pointsThisMonth: number;
  maxPointsPerMonth: number;
  history: { riderName: string; status: "invited" | "approved"; pointsAwarded: number; occurredAt: ISODateString }[];
};

// ---- Real-time location ----
export type RiderLocationPing = {
  latitude: number;
  longitude: number;
  headingDegrees: number;
  speedKph: number;
  accuracyMeters: number;
  updatedAt: ISODateString;
};

// ---- Performance engine ----
export type RiderPerformance = {
  acceptanceRatePercent: number;
  cancellationRatePercent: number;
  completionRatePercent: number;
  averageRating: number;
  averageDeliveryTimeMinutes: number;
  lifetimeEarnings: number;
  lifetimeDeliveries: number;
};

// ---- Rider notifications ----
export type RiderNotificationType =
  | "new-order"
  | "wallet-updated"
  | "remittance-due"
  | "bonus-earned"
  | "verification-approved"
  | "announcement";

export type RiderNotification = {
  id: ID;
  type: RiderNotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: ISODateString;
};

// ---- Delivery Fee Engine (re-exported from @rapex/utils so every app imports the same shapes from one place) ----
export type { RouteEstimate, DeliveryFeeQuote, OrderFinancials };

/** Admin's view of a settled order -- OrderFinancials plus the identifying/timeline context only admin needs. */
export type AdminOrderRecord = OrderFinancials & {
  customerName: string;
  merchantName: string;
  riderName: string;
  status: DeliveryOrderStatus;
  timeline: DeliveryTimelineEntry[];
};

/** Merchant's view of a settled order -- just the fields the spec calls out for the merchant screen. */
export type MerchantOrderFinancials = {
  orderId: ID;
  distanceKm: number;
  deliveryFee: number;
  /** productTotal + deliveryFee + platformFee -- what the customer paid. */
  customerPayment: number;
  merchantReceives: number;
};

export type { Paginated };

// ---- Child Accounts / Baon ----
// Provisional shapes per the Child Accounts/Baon technical proposal
// (2026-08-16) -- CHILD is a value of the same account_role as
// customer/rider/merchant/admin, not a separate app or auth system. Field
// names here are illustrative until a real Xano contract is confirmed
// (see ChildAccountRepository's Mock implementation for the working
// stand-in used until then).
export type ChildAccountStatus = "active" | "inactive";

export type ChildAccountSummary = {
  id: ID;
  fullName: string;
  email: string;
  dateOfBirth: ISODateString;
  gender: "Male" | "Female" | "Prefer not to say" | null;
  status: ChildAccountStatus;
  isStudent: boolean;
  createdAt: ISODateString;
};

export type CreateChildAccountInput = {
  fullName: string;
  email: string;
  password: string;
  dateOfBirth: ISODateString;
  gender: "Male" | "Female" | "Prefer not to say" | null;
  municipalityId: string | null;
  municipalityName: string | null;
  barangayId: string | null;
  barangayName: string | null;
  addressLine1: string;
  isStudent: boolean;
  /** Required when isStudent=true. */
  studentVerificationRef?: string | null;
  /** Required when isStudent=false. */
  nonStudentReason?: string | null;
  /** Required when isStudent=false. */
  intendedUsePurpose?: string | null;
  /** The primary account explicitly authorizing creation -- this IS the authorization step, no separate approval workflow. */
  parentAuthorizationConfirmed: boolean;
};

export type ChildBaonSummary = {
  childId: ID;
  allocatedBudget: number;
  spentAmount: number;
  remainingBudget: number;
};

export type ChildPurchaseHistoryEntry = OrderSummary & {
  childId: ID;
};

export type UnallocatedBalanceSummary = {
  walletBalance: number;
  totalCommittedToChildren: number;
  availableToAllocate: number;
};
