import type { LatLng } from "@rapex/utils";
import type {
  ActiveDelivery,
  DeliveryAssignmentOffer,
  DeliveryFeeQuote,
  DeliveryOrderStatus,
  DeliveryProof,
  OrderFinancials,
  RouteEstimate,
} from "../types";

export interface DeliveryRepository {
  /** Long-poll/subscribe target: null when no offer is currently pending for this rider. */
  getCurrentOffer(): Promise<DeliveryAssignmentOffer | null>;
  acceptOffer(offerId: string): Promise<ActiveDelivery>;
  /** Rejecting (or letting the 20s countdown expire) hands the offer to the next-nearest rider. */
  rejectOffer(offerId: string): Promise<void>;
  getActiveDelivery(): Promise<ActiveDelivery | null>;
  advanceStatus(orderId: string, status: DeliveryOrderStatus, note?: string): Promise<ActiveDelivery>;
  /**
   * Submitting proof settles the order: marks delivered, then automatically
   * deducts the customer wallet, credits merchant + rider, records platform
   * revenue, and advances the order straight to completed -- see
   * docs/business/Delivery.md#delivery-fee-engine.
   */
  submitProof(proof: DeliveryProof): Promise<ActiveDelivery>;
  getDeliveryHistory(): Promise<ActiveDelivery[]>;

  /** Road distance between two points -- proxies Google Maps Directions API server-side once Xano exists. */
  calculateRoute(origin: LatLng, destination: LatLng): Promise<RouteEstimate>;
  quoteDeliveryFee(distanceKm: number): Promise<DeliveryFeeQuote>;
  getOrderFinancials(orderId: string): Promise<OrderFinancials | null>;
}
