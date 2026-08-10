import type { Theme } from "@rapex/theme";
import type { ActivityEventType, MerchantStatus, RiderStatus } from "./types";

// Barangay-dedicated riders get a purple accent that isn't part of the
// semantic theme palette (theme has no "purple" role token) -- kept as a
// literal here rather than added to @rapex/theme as a one-off.
const BARANGAY_PURPLE = "#8B5CF6";

export function riderStatusColor(status: RiderStatus, theme: Theme): string {
  switch (status) {
    case "online-available":
      return theme.colors.success;
    case "online-delivering":
      return theme.colors.warning;
    case "barangay-dedicated":
      return BARANGAY_PURPLE;
    case "offline":
      return theme.colors.textDisabled;
    case "emergency":
      return theme.colors.error;
  }
}

export const RIDER_STATUS_LABEL: Record<RiderStatus, string> = {
  "online-available": "Online — Available",
  "online-delivering": "Online — Delivering",
  "barangay-dedicated": "Dedicated Barangay Rider",
  offline: "Offline",
  emergency: "Emergency / SOS",
};

export function merchantStatusColor(status: MerchantStatus, theme: Theme): string {
  switch (status) {
    case "open":
      return theme.colors.success;
    case "closed":
      return theme.colors.textDisabled;
    case "busy":
      return theme.colors.warning;
    case "paused":
      return theme.colors.error;
  }
}

export const MERCHANT_STATUS_LABEL: Record<MerchantStatus, string> = {
  open: "Store Open — Accepting Orders",
  closed: "Store Closed",
  busy: "Temporarily Busy",
  paused: "Paused by Admin",
};

export const ACTIVITY_LABEL: Record<ActivityEventType, string> = {
  "merchant-opened": "Merchant Opened Store",
  "merchant-closed": "Merchant Closed Store",
  "rider-online": "Rider Online",
  "rider-offline": "Rider Offline",
  "new-order": "New Order",
  "order-accepted": "Order Accepted",
  "order-cancelled": "Order Cancelled",
  "delivery-started": "Delivery Started",
  "delivery-completed": "Delivery Completed",
  "voucher-redeemed": "Voucher Redeemed",
  "referral-registered": "Referral Registered",
};
