import { computeWeeklyIncentiveProgress, WEEKLY_INCENTIVE_TARGET_DELIVERIES } from "@rapex/utils";
import type { RiderEconomyRepository } from "./RiderEconomyRepository";
import type { IncentiveProgress, ReferralSummary, RiderEarningsSummary, RiderNotification } from "../types";

const MOCK_DELAY_MS = 300;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

/** Completed deliveries so far this incentive week (Monday-Sunday) -- cancelled/failed already excluded upstream. */
let completedThisWeek = 47;

const notifications: RiderNotification[] = [
  { id: "notif-1", type: "new-order", title: "New delivery request", body: "A delivery request from Aling Nena's Carinderia is waiting.", read: false, createdAt: "2026-08-02T09:05:00.000Z" },
  { id: "notif-2", type: "bonus-earned", title: "Weekly incentive close", body: `You're ${WEEKLY_INCENTIVE_TARGET_DELIVERIES - completedThisWeek} deliveries away from this week's ₱500 bonus.`, read: false, createdAt: "2026-08-01T20:00:00.000Z" },
  { id: "notif-3", type: "verification-approved", title: "Verification approved", body: "Your rider account has been verified.", read: true, createdAt: "2026-06-01T08:10:00.000Z" },
];

/** Stands in for the real Xano-backed RiderEconomyRepository until that API contract is provided. */
export class MockRiderEconomyRepository implements RiderEconomyRepository {
  async getEarningsSummary(): Promise<RiderEarningsSummary> {
    return delay({
      todayEarnings: 612.4,
      weeklyEarnings: 3841.2,
      monthlyEarnings: 15230.75,
      lifetimeEarnings: 128450.5,
      deliveryCount: 361,
      averageEarningsPerDelivery: 71.2,
      totalDistanceKm: 2140.6,
      averageDeliveryTimeMinutes: 22,
    });
  }

  async getIncentiveProgress(): Promise<IncentiveProgress> {
    const computed = computeWeeklyIncentiveProgress(completedThisWeek, new Date());
    return delay({
      weekStart: computed.weekStart,
      weekEnd: computed.weekEnd,
      completedDeliveries: computed.completedDeliveries,
      targetDeliveries: computed.targetDeliveries,
      rewardAmount: computed.rewardAmount,
      achieved: computed.achieved,
      paidOut: false,
    });
  }

  async getReferralSummary(): Promise<ReferralSummary> {
    return delay({
      referralCode: "RIDER-MARCO12",
      qrCodeDataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#fff"/><rect x="10" y="10" width="20" height="20" fill="#000"/><rect x="70" y="10" width="20" height="20" fill="#000"/><rect x="10" y="70" width="20" height="20" fill="#000"/><rect x="40" y="40" width="20" height="20" fill="#000"/></svg>',
      )}`,
      invitedCount: 9,
      approvedCount: 6,
      pointsThisMonth: 12,
      maxPointsPerMonth: 100,
      history: [
        { riderName: "Jomar Reyes", status: "approved", pointsAwarded: 2, occurredAt: "2026-07-28T10:00:00.000Z" },
        { riderName: "Kevin Domingo", status: "approved", pointsAwarded: 2, occurredAt: "2026-07-20T10:00:00.000Z" },
        { riderName: "Angelo Cruz", status: "invited", pointsAwarded: 0, occurredAt: "2026-07-30T10:00:00.000Z" },
      ],
    });
  }

  async getNotifications(): Promise<RiderNotification[]> {
    return delay([...notifications]);
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    const target = notifications.find((n) => n.id === notificationId);
    if (target) target.read = true;
    return delay(undefined);
  }
}
