import { useRepositories } from "../RepositoryProvider";
import { useAsync, type AsyncState } from "./useAsync";
import { useAsyncAction, type AsyncActionState } from "./useAsyncAction";
import type { CartLine, OrderSummary } from "../repositories/types";

export function useMyOrders(): AsyncState<OrderSummary[]> {
  const { orders } = useRepositories();
  return useAsync(() => orders.getMyOrders(), []);
}

export function usePlaceOrderAction(): AsyncActionState<[CartLine[]], OrderSummary> {
  const { orders } = useRepositories();
  return useAsyncAction((lines: CartLine[]) => orders.placeOrder(lines));
}
