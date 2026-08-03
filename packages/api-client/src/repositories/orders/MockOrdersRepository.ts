import { calculateAlphaDeliveryFee } from "@rapex/utils";
import type { OrdersRepository } from "./OrdersRepository";
import type { CartLine, CheckoutSummary, OrderSummary } from "../types";
import { MOCK_ORDERS } from "./mockData";

const MOCK_DELAY_MS = 350;
/** No live merchant<->customer coordinates in this mock yet -- matches the Delivery Fee Engine's canonical example (2.5km -> ₱50). */
const MOCK_DELIVERY_DISTANCE_KM = 2.5;
const PLATFORM_FEE = 0;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

function subtotalOf(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
}

const orders: OrderSummary[] = [...MOCK_ORDERS];

/** Stands in for the real Xano-backed OrdersRepository until that API contract is provided. */
export class MockOrdersRepository implements OrdersRepository {
  async getCheckoutSummary(lines: CartLine[]): Promise<CheckoutSummary> {
    const subtotal = subtotalOf(lines);
    const { deliveryFee } = calculateAlphaDeliveryFee(MOCK_DELIVERY_DISTANCE_KM);
    return delay({ lines, subtotal, deliveryFee, platformFee: PLATFORM_FEE, total: subtotal + deliveryFee + PLATFORM_FEE });
  }

  async placeOrder(lines: CartLine[]): Promise<OrderSummary> {
    const subtotal = subtotalOf(lines);
    const { deliveryFee } = calculateAlphaDeliveryFee(MOCK_DELIVERY_DISTANCE_KM);
    const order: OrderSummary = {
      id: `order-${Math.floor(1000 + Math.random() * 9000)}`,
      storeName: lines[0]?.storeName ?? "RAPEX Store",
      status: "pending",
      total: subtotal + deliveryFee + PLATFORM_FEE,
      placedAt: new Date().toISOString(),
      itemCount: lines.length,
    };
    orders.unshift(order);
    return delay(order);
  }

  async getMyOrders(): Promise<OrderSummary[]> {
    return delay(orders);
  }

  async getOrderById(orderId: string): Promise<OrderSummary | null> {
    return delay(orders.find((o) => o.id === orderId) ?? null);
  }
}
