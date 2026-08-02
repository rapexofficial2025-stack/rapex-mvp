import type { ActiveDelivery, DeliveryAssignmentOffer, DeliveryOrderStatus, DeliveryProof } from "../types";

export interface DeliveryRepository {
  /** Long-poll/subscribe target: null when no offer is currently pending for this rider. */
  getCurrentOffer(): Promise<DeliveryAssignmentOffer | null>;
  acceptOffer(offerId: string): Promise<ActiveDelivery>;
  /** Rejecting (or letting the 20s countdown expire) hands the offer to the next-nearest rider. */
  rejectOffer(offerId: string): Promise<void>;
  getActiveDelivery(): Promise<ActiveDelivery | null>;
  advanceStatus(orderId: string, status: DeliveryOrderStatus, note?: string): Promise<ActiveDelivery>;
  submitProof(proof: DeliveryProof): Promise<ActiveDelivery>;
  getDeliveryHistory(): Promise<ActiveDelivery[]>;
}
