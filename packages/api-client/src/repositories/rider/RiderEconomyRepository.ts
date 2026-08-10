import type { IncentiveProgress, ReferralSummary, RiderEarningsSummary, RiderNotification } from "../types";

/** Earnings dashboard + weekly incentive engine + referral engine + rider notifications. */
export interface RiderEconomyRepository {
  getEarningsSummary(): Promise<RiderEarningsSummary>;
  getIncentiveProgress(): Promise<IncentiveProgress>;
  getReferralSummary(): Promise<ReferralSummary>;
  getNotifications(): Promise<RiderNotification[]>;
  markNotificationRead(notificationId: string): Promise<void>;
}
