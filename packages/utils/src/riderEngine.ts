/**
 * Pure calculation engines shared by the rider domain. No I/O, no framework
 * dependencies -- these are the formulas from the rider business rules,
 * kept independent of any repository implementation so they can be unit
 * tested and reused by both the rider-app and (eventually) admin reporting.
 */

// ---- Delivery type / fare engine ----
export type VehicleType = "motorcycle" | "bicycle" | "car" | "van";

export type DeliveryTypeRule = {
  vehicleType: VehicleType;
  maxWeightKg: number;
  maxDistanceKm: number;
  estimatedSpeedKph: number;
  baseFare: number;
  perKmRate: number;
  /** Distance (km) included in the base fare before per-km charges start. */
  baseIncludedKm: number;
};

export const DELIVERY_TYPE_RULES: Record<VehicleType, DeliveryTypeRule> = {
  bicycle: { vehicleType: "bicycle", maxWeightKg: 8, maxDistanceKm: 5, estimatedSpeedKph: 15, baseFare: 25, perKmRate: 6, baseIncludedKm: 2 },
  motorcycle: { vehicleType: "motorcycle", maxWeightKg: 20, maxDistanceKm: 15, estimatedSpeedKph: 35, baseFare: 39, perKmRate: 9, baseIncludedKm: 2 },
  car: { vehicleType: "car", maxWeightKg: 100, maxDistanceKm: 30, estimatedSpeedKph: 30, baseFare: 69, perKmRate: 13, baseIncludedKm: 2 },
  van: { vehicleType: "van", maxWeightKg: 500, maxDistanceKm: 50, estimatedSpeedKph: 25, baseFare: 129, perKmRate: 18, baseIncludedKm: 2 },
};

export function isWithinVehicleCapacity(vehicleType: VehicleType, distanceKm: number, weightKg: number): boolean {
  const rule = DELIVERY_TYPE_RULES[vehicleType];
  return distanceKm <= rule.maxDistanceKm && weightKg <= rule.maxWeightKg;
}

export function estimateDeliveryMinutes(vehicleType: VehicleType, distanceKm: number): number {
  const rule = DELIVERY_TYPE_RULES[vehicleType];
  return Math.ceil((distanceKm / rule.estimatedSpeedKph) * 60);
}

/** Base + per-km fare before any bonuses/subsidies/discounts are applied. */
export function calculateBaseDeliveryFee(vehicleType: VehicleType, distanceKm: number): { baseFare: number; distanceFare: number } {
  const rule = DELIVERY_TYPE_RULES[vehicleType];
  const chargeableKm = Math.max(0, distanceKm - rule.baseIncludedKm);
  return { baseFare: rule.baseFare, distanceFare: round2(chargeableKm * rule.perKmRate) };
}

// ---- Commission engine ----
export const PEAK_HOUR_BONUS = 15;
export const HEAVY_ITEM_BONUS = 10;
export const PLATFORM_COMMISSION_RATE = 0.2;
/** Distance beyond a vehicle's `baseIncludedKm` at which "extra distance" surcharge kicks in, on top of the per-km fare. */
export const EXTRA_DISTANCE_THRESHOLD_KM = 8;
export const EXTRA_DISTANCE_RATE_PER_KM = 3;

export type CommissionInput = {
  vehicleType: VehicleType;
  distanceKm: number;
  isPeakHour: boolean;
  isHeavyItem: boolean;
  merchantSubsidy: number;
  voucherSubsidy: number;
  promoDiscount: number;
  riderIncentive: number;
  customerTip: number;
};

export type CommissionResult = {
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
};

/**
 * Delivery Fee - Platform Commission + Tips + Incentives = Net Rider Income.
 * Platform commission is charged on the delivery fee only (not subsidies,
 * tips, or incentives -- those pass through to the rider in full).
 */
export function calculateCommission(input: CommissionInput): CommissionResult {
  const { baseFare, distanceFare } = calculateBaseDeliveryFee(input.vehicleType, input.distanceKm);
  const extraKm = Math.max(0, input.distanceKm - EXTRA_DISTANCE_THRESHOLD_KM);
  const extraDistanceFare = round2(extraKm * EXTRA_DISTANCE_RATE_PER_KM);
  const peakHourBonus = input.isPeakHour ? PEAK_HOUR_BONUS : 0;
  const heavyItemBonus = input.isHeavyItem ? HEAVY_ITEM_BONUS : 0;

  const deliveryFee = round2(
    baseFare +
      distanceFare +
      extraDistanceFare +
      peakHourBonus +
      heavyItemBonus +
      input.merchantSubsidy +
      input.voucherSubsidy -
      input.promoDiscount,
  );

  const platformCommission = round2(deliveryFee * PLATFORM_COMMISSION_RATE);
  const netRiderIncome = round2(deliveryFee - platformCommission + input.customerTip + input.riderIncentive);

  return {
    baseFare,
    distanceFare,
    extraDistanceFare,
    peakHourBonus,
    heavyItemBonus,
    merchantSubsidy: input.merchantSubsidy,
    voucherSubsidy: input.voucherSubsidy,
    promoDiscount: input.promoDiscount,
    platformCommission,
    riderIncentive: input.riderIncentive,
    customerTip: input.customerTip,
    deliveryFee,
    netRiderIncome,
  };
}

// ---- Weekly incentive engine ----
export const WEEKLY_INCENTIVE_TARGET_DELIVERIES = 60;
export const WEEKLY_INCENTIVE_REWARD = 500;

/** Monday 00:00:00.000 of the week containing `date`, in UTC. */
export function getIncentiveWeekStart(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diffToMonday);
  return d;
}

export function getIncentiveWeekEnd(weekStart: Date): Date {
  const d = new Date(weekStart);
  d.setUTCDate(d.getUTCDate() + 6);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

export type IncentiveProgressResult = {
  weekStart: string;
  weekEnd: string;
  completedDeliveries: number;
  targetDeliveries: number;
  remaining: number;
  rewardAmount: number;
  achieved: boolean;
};

/**
 * completedDeliveries must already exclude cancelled and failed deliveries --
 * this engine only counts what it's given, per the "completed only" rule.
 */
export function computeWeeklyIncentiveProgress(completedDeliveries: number, referenceDate: Date): IncentiveProgressResult {
  const weekStart = getIncentiveWeekStart(referenceDate);
  const weekEnd = getIncentiveWeekEnd(weekStart);
  const achieved = completedDeliveries >= WEEKLY_INCENTIVE_TARGET_DELIVERIES;

  return {
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
    completedDeliveries,
    targetDeliveries: WEEKLY_INCENTIVE_TARGET_DELIVERIES,
    remaining: Math.max(0, WEEKLY_INCENTIVE_TARGET_DELIVERIES - completedDeliveries),
    rewardAmount: achieved ? WEEKLY_INCENTIVE_REWARD : 0,
    achieved,
  };
}

// ---- Referral engine ----
export const REFERRAL_POINTS_PER_APPROVED_RIDER = 2;
export const REFERRAL_MAX_POINTS_PER_MONTH = 100;

/** Caps monthly referral points at the program max regardless of how many riders were approved. */
export function calculateReferralPointsEarned(approvedRidersThisMonth: number): number {
  return Math.min(approvedRidersThisMonth * REFERRAL_POINTS_PER_APPROVED_RIDER, REFERRAL_MAX_POINTS_PER_MONTH);
}

// ---- Rider assignment eligibility + scoring ----
export type RiderAssignmentCandidate = {
  riderId: string;
  verificationStatus: "pending" | "verified" | "rejected" | "suspended";
  availabilityStatus: "offline" | "online" | "busy";
  operationalBalance: number;
  minimumOperationalBalance: number;
  latitude: number;
  longitude: number;
  locationPermissionEnabled: boolean;
};

export function isRiderEligibleForAssignment(candidate: RiderAssignmentCandidate, deliveryRadiusKm: number, distanceKm: number): boolean {
  return (
    candidate.verificationStatus === "verified" &&
    candidate.availabilityStatus === "online" &&
    candidate.locationPermissionEnabled &&
    candidate.operationalBalance >= candidate.minimumOperationalBalance &&
    distanceKm <= deliveryRadiusKm
  );
}

export const ASSIGNMENT_OFFER_SECONDS = 20;

// ---- Wallet business rules ----
export function canAcceptDelivery(operationalBalance: number, minimumOperationalBalance: number): boolean {
  return operationalBalance >= minimumOperationalBalance;
}

// ---- Performance engine ----
export type PerformanceInput = {
  totalOffersReceived: number;
  totalOffersAccepted: number;
  totalDeliveriesStarted: number;
  totalDeliveriesCompleted: number;
  totalDeliveriesCancelled: number;
  totalRatingSum: number;
  totalRatingCount: number;
  totalDeliveryMinutesSum: number;
};

export type PerformanceResult = {
  acceptanceRatePercent: number;
  cancellationRatePercent: number;
  completionRatePercent: number;
  averageRating: number;
  averageDeliveryTimeMinutes: number;
};

export function computeRiderPerformance(input: PerformanceInput): PerformanceResult {
  const acceptanceRatePercent = percent(input.totalOffersAccepted, input.totalOffersReceived);
  const cancellationRatePercent = percent(input.totalDeliveriesCancelled, input.totalDeliveriesStarted);
  const completionRatePercent = percent(input.totalDeliveriesCompleted, input.totalDeliveriesStarted);
  const averageRating = input.totalRatingCount === 0 ? 0 : round2(input.totalRatingSum / input.totalRatingCount);
  const averageDeliveryTimeMinutes =
    input.totalDeliveriesCompleted === 0 ? 0 : round2(input.totalDeliveryMinutesSum / input.totalDeliveriesCompleted);

  return { acceptanceRatePercent, cancellationRatePercent, completionRatePercent, averageRating, averageDeliveryTimeMinutes };
}

function percent(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return round2((numerator / denominator) * 100);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
