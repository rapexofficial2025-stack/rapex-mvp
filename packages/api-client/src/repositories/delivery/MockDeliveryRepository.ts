import {
  ASSIGNMENT_OFFER_SECONDS,
  calculateAlphaDeliveryFee,
  calculateOrderFinancials,
  estimateDurationMinutes,
  estimateRoadDistanceKm,
  round2,
  type LatLng,
} from "@rapex/utils";
import { settleOrder, getOrderFinancials as getStoredOrderFinancials } from "./orderSettlementLedger";
import type { DeliveryRepository } from "./DeliveryRepository";
import type {
  ActiveDelivery,
  DeliveryAssignmentOffer,
  DeliveryFeeQuote,
  DeliveryOrderStatus,
  DeliveryProof,
  DeliveryTimelineEntry,
  OrderFinancials,
  RouteEstimate,
} from "../types";

const MOCK_DELAY_MS = 300;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

/** Valid forward transitions per the delivery workflow engine -- advanceStatus rejects anything not listed here. */
const NEXT_STATUS: Record<DeliveryOrderStatus, DeliveryOrderStatus[]> = {
  waiting: ["assigned"],
  assigned: ["accepted", "cancelled"],
  accepted: ["going-to-merchant", "cancelled"],
  "going-to-merchant": ["arrived-merchant", "cancelled"],
  "arrived-merchant": ["picked-up", "cancelled"],
  "picked-up": ["on-the-way", "failed-delivery"],
  "on-the-way": ["arrived-customer", "failed-delivery"],
  "arrived-customer": ["delivered", "failed-delivery"],
  delivered: ["completed"],
  completed: [],
  cancelled: [],
  "failed-delivery": ["returned"],
  returned: [],
};

const SEED_PICKUP_DISTANCE_KM = 1.8;
/** Matches the spec's canonical example: 2.5km -> ₱50 delivery fee. */
const SEED_DELIVERY_DISTANCE_KM = 2.5;
const SEED_PRODUCT_TOTAL = 120;

let nextOfferSeq = 1;

/** Regenerated each time the previous offer is accepted/rejected/expires -- stands in for a live assignment engine dispatching the next nearby order. */
function buildSeedOffer(): DeliveryAssignmentOffer {
  const seq = nextOfferSeq++;
  const orderId = `order-500${seq}`;
  const { deliveryFee } = calculateAlphaDeliveryFee(SEED_DELIVERY_DISTANCE_KM);
  const financials = calculateOrderFinancials({
    orderId,
    distanceKm: SEED_DELIVERY_DISTANCE_KM,
    productTotal: SEED_PRODUCT_TOTAL,
  });

  return {
    offerId: `offer-${seq}`,
    orderId,
    merchantName: "Aling Nena's Carinderia",
    merchantAddress: "Purok 3, Bayan Luma, Imus, Cavite",
    merchantLatitude: 14.4297,
    merchantLongitude: 120.9367,
    customerAddress: "Lancaster New City, Phase 3, General Trias, Cavite",
    customerLatitude: 14.339,
    customerLongitude: 120.9146,
    pickupDistanceKm: SEED_PICKUP_DISTANCE_KM,
    deliveryDistanceKm: SEED_DELIVERY_DISTANCE_KM,
    totalDistanceKm: round2(SEED_PICKUP_DISTANCE_KM + SEED_DELIVERY_DISTANCE_KM),
    estimatedTimeMinutes: estimateDurationMinutes(SEED_PICKUP_DISTANCE_KM + SEED_DELIVERY_DISTANCE_KM),
    productTotal: SEED_PRODUCT_TOTAL,
    deliveryFee,
    estimatedRiderEarnings: financials.riderEarnings,
    itemCount: 3,
    isHeavyItem: false,
    isPeakHour: true,
    expiresAt: new Date(Date.now() + ASSIGNMENT_OFFER_SECONDS * 1000).toISOString(),
    secondsToRespond: ASSIGNMENT_OFFER_SECONDS,
  };
}

let pendingOffer: DeliveryAssignmentOffer | null = buildSeedOffer();

let activeDelivery: ActiveDelivery | null = null;
const history: ActiveDelivery[] = [];

function timelineEntry(status: DeliveryOrderStatus, note?: string): DeliveryTimelineEntry {
  return { status, occurredAt: new Date().toISOString(), note };
}

/** Stands in for the real Xano-backed DeliveryRepository (assignment + workflow + delivery fee engines) until that API contract is provided. */
export class MockDeliveryRepository implements DeliveryRepository {
  async getCurrentOffer(): Promise<DeliveryAssignmentOffer | null> {
    if (pendingOffer && new Date(pendingOffer.expiresAt).getTime() < Date.now()) {
      pendingOffer = null;
    }
    // No offer waiting and the rider is free -- the assignment engine keeps dispatching new candidates.
    if (!pendingOffer && !activeDelivery) {
      pendingOffer = buildSeedOffer();
    }
    return delay(pendingOffer);
  }

  async acceptOffer(offerId: string): Promise<ActiveDelivery> {
    if (!pendingOffer || pendingOffer.offerId !== offerId) {
      throw new Error("This offer is no longer available.");
    }
    const offer = pendingOffer;
    pendingOffer = null;

    activeDelivery = {
      orderId: offer.orderId,
      status: "accepted",
      merchantName: offer.merchantName,
      merchantAddress: offer.merchantAddress,
      merchantLatitude: offer.merchantLatitude,
      merchantLongitude: offer.merchantLongitude,
      customerName: "Elena Santos",
      customerAddress: offer.customerAddress,
      customerLatitude: offer.customerLatitude,
      customerLongitude: offer.customerLongitude,
      customerPhone: "09181234567",
      itemCount: offer.itemCount,
      pickupDistanceKm: offer.pickupDistanceKm,
      deliveryDistanceKm: offer.deliveryDistanceKm,
      estimatedTimeMinutes: offer.estimatedTimeMinutes,
      productTotal: offer.productTotal,
      deliveryFee: offer.deliveryFee,
      estimatedRiderEarnings: offer.estimatedRiderEarnings,
      timeline: [timelineEntry("waiting"), timelineEntry("assigned"), timelineEntry("accepted")],
    };
    return delay(activeDelivery);
  }

  async rejectOffer(offerId: string): Promise<void> {
    if (pendingOffer && pendingOffer.offerId === offerId) {
      pendingOffer = null;
    }
    return delay(undefined);
  }

  async getActiveDelivery(): Promise<ActiveDelivery | null> {
    return delay(activeDelivery);
  }

  async advanceStatus(orderId: string, status: DeliveryOrderStatus, note?: string): Promise<ActiveDelivery> {
    if (!activeDelivery || activeDelivery.orderId !== orderId) {
      throw new Error("No active delivery matches this order.");
    }
    const allowed = NEXT_STATUS[activeDelivery.status];
    if (!allowed.includes(status)) {
      throw new Error(`Cannot move delivery from "${activeDelivery.status}" to "${status}".`);
    }

    activeDelivery = {
      ...activeDelivery,
      status,
      timeline: [...activeDelivery.timeline, timelineEntry(status, note)],
    };

    if (status === "completed" || status === "cancelled" || status === "returned") {
      history.unshift(activeDelivery);
      const finished = activeDelivery;
      activeDelivery = null;
      return delay(finished);
    }

    return delay(activeDelivery);
  }

  /**
   * The Order Completion Engine: rider taps "Mark as Delivered" -> proof is
   * validated -> status moves to delivered -> settlement runs immediately
   * (Customer Wallet -> Merchant Revenue -> Rider Earnings -> Platform
   * Revenue) -> status moves straight to completed. One rider action, one
   * atomic transaction (in the real Xano-backed version).
   */
  async submitProof(proof: DeliveryProof): Promise<ActiveDelivery> {
    if (!activeDelivery || activeDelivery.orderId !== proof.orderId) {
      throw new Error("No active delivery matches this proof submission.");
    }
    if (activeDelivery.status !== "arrived-customer") {
      throw new Error("Proof of delivery can only be submitted after arriving at the customer.");
    }

    const delivered = await this.advanceStatus(proof.orderId, "delivered", "Proof of delivery captured.");

    settleOrder({
      orderId: delivered.orderId,
      distanceKm: delivered.deliveryDistanceKm,
      productTotal: delivered.productTotal,
    });

    activeDelivery = delivered;
    return this.advanceStatus(proof.orderId, "completed", "Order settled and completed.");
  }

  async getDeliveryHistory(): Promise<ActiveDelivery[]> {
    return delay(history);
  }

  async calculateRoute(origin: LatLng, destination: LatLng): Promise<RouteEstimate> {
    return delay(estimateRoadDistanceKm(origin, destination));
  }

  async quoteDeliveryFee(distanceKm: number): Promise<DeliveryFeeQuote> {
    return delay(calculateAlphaDeliveryFee(distanceKm));
  }

  async getOrderFinancials(orderId: string): Promise<OrderFinancials | null> {
    return delay(getStoredOrderFinancials(orderId));
  }
}
