/**
 * Alpha delivery fee + order financial settlement engine. Pure calculations
 * only -- the authoritative version of these formulas lives here so every
 * app (rider, customer, merchant, admin) computes and displays identical
 * numbers. Route distance itself (Google Maps Directions API, road distance)
 * is NOT computed here: that call must be proxied server-side by Xano (the
 * Maps API key can never ship in a client bundle), so `estimateRoadDistanceKm`
 * below is explicitly a temporary Alpha stand-in used only by Mock
 * repositories until that endpoint exists.
 */
import type { LatLng } from "./location";
import { distanceKm as haversineDistanceKm } from "./location";

// ---- TEMPORARY Alpha pricing ----
export const ALPHA_BASE_FARE = 40;
export const ALPHA_BASE_INCLUDED_KM = 2;
export const ALPHA_PER_KM_RATE = 10;

/** Rider keeps this share of the delivery fee; the remainder is platform revenue. */
export const ALPHA_RIDER_DELIVERY_SHARE = 0.8;
/** "Platform Fee (if any)" on the customer's product total -- 0 for Alpha, wired for later. */
export const ALPHA_PLATFORM_FEE_RATE = 0;

export type DeliveryFeeQuote = {
  distanceKm: number;
  baseFare: number;
  chargeableKm: number;
  perKmRate: number;
  deliveryFee: number;
};

/**
 * Base fare covers the first 2 km. Every succeeding kilometer (rounded up)
 * adds a flat ₱10. Matches the spec examples exactly:
 * 1.8km->₱40, 2.5km->₱50, 3.8km->₱60, 5.2km->₱80.
 */
export function calculateAlphaDeliveryFee(distanceKm: number): DeliveryFeeQuote {
  const excessKm = Math.max(0, distanceKm - ALPHA_BASE_INCLUDED_KM);
  const chargeableKm = Math.ceil(excessKm);
  const deliveryFee = ALPHA_BASE_FARE + chargeableKm * ALPHA_PER_KM_RATE;
  return { distanceKm, baseFare: ALPHA_BASE_FARE, chargeableKm, perKmRate: ALPHA_PER_KM_RATE, deliveryFee };
}

/** Road-distance factor applied to straight-line distance while no Directions API proxy exists. */
const ROAD_DISTANCE_FACTOR = 1.35;
const AVERAGE_CITY_SPEED_KPH = 28;

export type RouteEstimate = {
  distanceKm: number;
  durationMinutes: number;
  source: "google-directions" | "road-distance-estimate";
};

/**
 * TEMPORARY: approximates road distance from straight-line distance.
 * Replace with a Xano endpoint that proxies Google Maps Directions API
 * (server-side, so the API key is never exposed to the client) -- every
 * call site takes this through a repository method so swapping the
 * implementation later touches no screens.
 */
export function estimateRoadDistanceKm(origin: LatLng, destination: LatLng): RouteEstimate {
  const straightLineKm = haversineDistanceKm(origin, destination);
  const distanceKm = Math.round(straightLineKm * ROAD_DISTANCE_FACTOR * 10) / 10;
  return { distanceKm, durationMinutes: estimateDurationMinutes(distanceKm), source: "road-distance-estimate" };
}

export function estimateDurationMinutes(distanceKm: number): number {
  return Math.ceil((distanceKm / AVERAGE_CITY_SPEED_KPH) * 60);
}

// ---- Order financial settlement ----
export type OrderFinancialsInput = {
  orderId: string;
  distanceKm: number;
  productTotal: number;
  platformFeeRate?: number;
};

export type OrderFinancials = {
  orderId: string;
  distanceKm: number;
  productTotal: number;
  deliveryFee: number;
  platformFee: number;
  finalTotal: number;
  merchantReceives: number;
  platformRevenue: number;
  riderEarnings: number;
  walletDeduction: number;
};

/**
 * The full settlement math for one order:
 *   finalTotal = productTotal + deliveryFee + platformFee
 *   riderEarnings = deliveryFee * ALPHA_RIDER_DELIVERY_SHARE
 *   platformRevenue = (deliveryFee - riderEarnings) + platformFee
 *   merchantReceives = productTotal   (Alpha: no marketplace commission on product sales yet)
 *   walletDeduction = finalTotal      (single deduction from the customer wallet)
 * This is the pure math only -- applying it to real wallets/ledgers is the
 * caller's job (see MockDeliveryRepository's settlement step).
 */
export function calculateOrderFinancials(input: OrderFinancialsInput): OrderFinancials {
  const { orderId, distanceKm, productTotal } = input;
  const platformFeeRate = input.platformFeeRate ?? ALPHA_PLATFORM_FEE_RATE;

  const { deliveryFee } = calculateAlphaDeliveryFee(distanceKm);
  const platformFee = round2(productTotal * platformFeeRate);
  const finalTotal = round2(productTotal + deliveryFee + platformFee);

  const riderEarnings = round2(deliveryFee * ALPHA_RIDER_DELIVERY_SHARE);
  const platformRevenueFromDelivery = round2(deliveryFee - riderEarnings);
  const merchantReceives = productTotal;
  const platformRevenue = round2(platformRevenueFromDelivery + platformFee);

  return {
    orderId,
    distanceKm,
    productTotal,
    deliveryFee,
    platformFee,
    finalTotal,
    merchantReceives,
    platformRevenue,
    riderEarnings,
    walletDeduction: finalTotal,
  };
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
