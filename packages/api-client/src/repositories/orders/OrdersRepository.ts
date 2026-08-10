import type { CartLine, CheckoutSummary, OrderSummary } from "../types";

export interface OrdersRepository {
  getCheckoutSummary(lines: CartLine[]): Promise<CheckoutSummary>;
  placeOrder(lines: CartLine[]): Promise<OrderSummary>;
  getMyOrders(): Promise<OrderSummary[]>;
  getOrderById(orderId: string): Promise<OrderSummary | null>;
}
