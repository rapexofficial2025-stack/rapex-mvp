import { ASSIGNMENT_OFFER_SECONDS } from "@rapex/utils";
import { creditDeliveryIncome } from "../wallet/MockRiderWalletRepository";
import type { DeliveryRepository } from "./DeliveryRepository";
import type { ActiveDelivery, DeliveryAssignmentOffer, DeliveryOrderStatus, DeliveryProof, DeliveryTimelineEntry } from "../types";

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

let pendingOffer: DeliveryAssignmentOffer | null = {
  offerId: "offer-1",
  orderId: "order-5001",
  merchantName: "Aling Nena's Carinderia",
  merchantAddress: "Purok 3, Bayan Luma, Imus, Cavite",
  merchantLatitude: 14.4297,
  merchantLongitude: 120.9367,
  customerAddress: "Lancaster New City, Phase 3, General Trias, Cavite",
  customerLatitude: 14.339,
  customerLongitude: 120.9146,
  distanceToMerchantKm: 1.8,
  totalDistanceKm: 6.4,
  deliveryFee: 92,
  estimatedRiderNet: 73.6,
  itemCount: 3,
  isHeavyItem: false,
  isPeakHour: true,
  expiresAt: new Date(Date.now() + ASSIGNMENT_OFFER_SECONDS * 1000).toISOString(),
  secondsToRespond: ASSIGNMENT_OFFER_SECONDS,
};

let activeDelivery: ActiveDelivery | null = null;
const history: ActiveDelivery[] = [];
/** netRiderIncome captured at accept-time, keyed by orderId, so completion can credit the wallet without re-deriving fare inputs. */
const netIncomeByOrderId = new Map<string, number>();

function timelineEntry(status: DeliveryOrderStatus, note?: string): DeliveryTimelineEntry {
  return { status, occurredAt: new Date().toISOString(), note };
}

/** Stands in for the real Xano-backed DeliveryRepository (assignment + workflow engines) until that API contract is provided. */
export class MockDeliveryRepository implements DeliveryRepository {
  async getCurrentOffer(): Promise<DeliveryAssignmentOffer | null> {
    if (pendingOffer && new Date(pendingOffer.expiresAt).getTime() < Date.now()) {
      pendingOffer = null;
    }
    return delay(pendingOffer);
  }

  async acceptOffer(offerId: string): Promise<ActiveDelivery> {
    if (!pendingOffer || pendingOffer.offerId !== offerId) {
      throw new Error("This offer is no longer available.");
    }
    const offer = pendingOffer;
    pendingOffer = null;
    netIncomeByOrderId.set(offer.orderId, offer.estimatedRiderNet);

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
      deliveryFee: offer.deliveryFee,
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

    if (status === "completed") {
      const netIncome = netIncomeByOrderId.get(orderId) ?? 0;
      creditDeliveryIncome(orderId, netIncome);
      netIncomeByOrderId.delete(orderId);
    }

    if (status === "completed" || status === "cancelled" || status === "returned") {
      history.unshift(activeDelivery);
      const finished = activeDelivery;
      activeDelivery = null;
      return delay(finished);
    }

    return delay(activeDelivery);
  }

  async submitProof(proof: DeliveryProof): Promise<ActiveDelivery> {
    if (!activeDelivery || activeDelivery.orderId !== proof.orderId) {
      throw new Error("No active delivery matches this proof submission.");
    }
    if (activeDelivery.status !== "arrived-customer") {
      throw new Error("Proof of delivery can only be submitted after arriving at the customer.");
    }
    return this.advanceStatus(proof.orderId, "delivered", "Proof of delivery captured.");
  }

  async getDeliveryHistory(): Promise<ActiveDelivery[]> {
    return delay(history);
  }
}
