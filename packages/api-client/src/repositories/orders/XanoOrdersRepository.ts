import type { HttpClient } from "../../core/httpClient";
import type { OrdersRepository } from "./OrdersRepository";
import type { CartLine, CheckoutSummary, OrderSummary } from "../types";

/** Manila fallback coordinates -- used only until a real location picker/GPS capture is wired into Checkout. */
const FALLBACK_DELIVERY_LAT = 14.5995;
const FALLBACK_DELIVERY_LNG = 120.9842;

function subtotalOf(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
}

/**
 * Real Xano-backed OrdersRepository, wired per the 2026-08-04 handover
 * (base https://x8ki-letl-twmt.n7.xano.io/api:rapex-orders/):
 *
 *   POST /create   { items: [{product_id, quantity}], delivery_lat, delivery_lng, payment_method }
 *                  -> { success, order_id, total_amount }
 *
 * Known gaps (reported, not guessed around):
 * - No documented endpoint for checkout preview, order list, or order-by-id
 *   yet -- those three methods delegate to the supplied fallback repository
 *   (Mock) rather than inventing a Xano endpoint. Swap the fallback for a
 *   real implementation once those contracts land.
 * - CartLine has no delivery coordinates, so `placeOrder` uses a fixed
 *   Manila fallback point until a real location picker is wired into
 *   Checkout -- this makes delivery fee/ETA wrong for any real address.
 * - `payment_method` is hardcoded to "wallet" per the Alpha scope (PayMongo
 *   deferred).
 * - Not yet tested against a live response -- unblocked once the Xano draft
 *   is published.
 */
export class XanoOrdersRepository implements OrdersRepository {
  private readonly client: HttpClient;
  private readonly fallback: OrdersRepository;

  constructor(client: HttpClient, fallback: OrdersRepository) {
    this.client = client;
    this.fallback = fallback;
  }

  async getCheckoutSummary(lines: CartLine[]): Promise<CheckoutSummary> {
    return this.fallback.getCheckoutSummary(lines);
  }

  async placeOrder(lines: CartLine[]): Promise<OrderSummary> {
    const result = await this.client.request<{ success: boolean; order_id: string | number; total_amount: number }>({
      path: "/create",
      method: "POST",
      body: {
        items: lines.map((line) => ({ product_id: line.productId, quantity: line.quantity })),
        delivery_lat: FALLBACK_DELIVERY_LAT,
        delivery_lng: FALLBACK_DELIVERY_LNG,
        payment_method: "wallet",
      },
    });

    return {
      id: String(result.order_id),
      storeName: lines[0]?.storeName ?? "RAPEX Store",
      status: "pending",
      total: result.total_amount ?? subtotalOf(lines),
      placedAt: new Date().toISOString(),
      itemCount: lines.length,
    };
  }

  async getMyOrders(): Promise<OrderSummary[]> {
    return this.fallback.getMyOrders();
  }

  async getOrderById(orderId: string): Promise<OrderSummary | null> {
    return this.fallback.getOrderById(orderId);
  }
}
