/**
 * Provisional UI-facing shapes -- what screens need to render, not confirmed
 * Xano entity schemas. These will be reconciled field-for-field once the
 * real API contract lands; repositories are the only thing that should need
 * to change at that point.
 */
import type { ID, ISODateString, Paginated } from "@rapex/types";

// ---- Auth ----
export type AuthUser = {
  id: ID;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "merchant" | "admin" | "super-admin";
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
export type MerchantApprovalStatus = "pending" | "approved" | "rejected";

export type MerchantProfile = {
  id: ID;
  storeName: string;
  approvalStatus: MerchantApprovalStatus;
};

export type MerchantOrder = OrderSummary & {
  customerName: string;
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

export type { Paginated };
