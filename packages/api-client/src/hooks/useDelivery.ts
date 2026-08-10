import { useRepositories } from "../RepositoryProvider";
import { useAsync, type AsyncState } from "./useAsync";
import type { ActiveDelivery, DeliveryAssignmentOffer } from "../repositories/types";

function requireDelivery() {
  const { delivery } = useRepositories();
  if (!delivery) throw new Error("DeliveryRepository is not configured on this app's RepositoryProvider.");
  return delivery;
}

export function useCurrentOffer(): AsyncState<DeliveryAssignmentOffer | null> {
  const delivery = requireDelivery();
  return useAsync(() => delivery.getCurrentOffer(), []);
}

export function useActiveDelivery(): AsyncState<ActiveDelivery | null> {
  const delivery = requireDelivery();
  return useAsync(() => delivery.getActiveDelivery(), []);
}
