/**
 * UI-layer types for the Operations Command Center only -- these are NOT
 * @rapex/types entities. They exist to shape mock data for this screen and
 * will be reconciled with the real Xano schema once Firebase/Maps/live data
 * actually get wired in.
 */

export type RiderStatus = "online-available" | "online-delivering" | "barangay-dedicated" | "offline" | "emergency";

export type MerchantStatus = "open" | "closed" | "busy" | "paused";

export type MerchantCategory = "Food" | "Marketplace" | "Hardware" | "Industrial" | "Services" | "Auction" | "Provider";

export type Rider = {
  id: string;
  name: string;
  photoUrl?: string;
  phone: string;
  vehicle: string;
  plateNumber: string;
  licenseNumber: string;
  status: RiderStatus;
  currentSpeedKph: number;
  batteryPercent: number | null;
  municipality: string;
  barangay: string;
  todayDeliveries: number;
  completedDeliveries: number;
  currentEarnings: number;
  acceptanceRatePercent: number;
  assignedOrderIds: string[];
  walletBalance: number;
  x: number;
  y: number;
};

export type Merchant = {
  id: string;
  storeName: string;
  merchantName: string;
  merchantId: string;
  logoUrl?: string;
  phone: string;
  category: MerchantCategory;
  status: MerchantStatus;
  openHours: string;
  ordersToday: number;
  completedOrdersToday: number;
  cancelledOrdersToday: number;
  pendingOrders: number;
  preparingOrders: number;
  readyForPickupOrders: number;
  avgPrepTimeMinutes: number;
  rating: number;
  walletBalance: number;
  revenueToday: number;
  commissionToday: number;
  currentVoucherCampaign: string | null;
  onlineStaffCount: number;
  municipality: string;
  barangay: string;
  lastActivity: string;
  x: number;
  y: number;
};

export type ActivityEventType =
  | "merchant-opened"
  | "merchant-closed"
  | "rider-online"
  | "rider-offline"
  | "new-order"
  | "order-accepted"
  | "order-cancelled"
  | "delivery-started"
  | "delivery-completed"
  | "voucher-redeemed"
  | "referral-registered";

export type ActivityEvent = {
  id: string;
  type: ActivityEventType;
  message: string;
  timestamp: string;
};

export type MapFilter =
  | "all-riders"
  | "all-merchants"
  | MerchantCategory
  | "online-only"
  | "offline-only"
  | "busy-only"
  | "barangay-riders-only";
