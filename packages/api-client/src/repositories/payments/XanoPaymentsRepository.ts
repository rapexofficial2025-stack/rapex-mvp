import { MockPaymentsRepository } from "./MockPaymentsRepository";
import type { PaymentCheckout, PaymentsRepository } from "./PaymentsRepository";

/**
 * Not wired to a real Xano endpoint yet -- both methods delegate to Mock
 * until Xano exposes the contract below. This is intentional, not a
 * shortcut: creating a real PayMongo Source/Payment Intent needs the
 * account's SECRET key sent over HTTP Basic Auth, and that call can only
 * happen from a server that keeps the key private. Xano is that server for
 * this app (there is no other backend) -- the frontend can never hold the
 * secret key itself.
 *
 * Contract a Xano developer needs to build, using the PayMongo secret key
 * stored as a Xano *environment variable* (never hardcoded in the function,
 * never returned in any response):
 *
 *   POST /payments/paymongo/checkout
 *     body: { method: "gcash" | "qrph", amount: number (PHP), order_id: string }
 *     server-side: POST https://api.paymongo.com/v1/sources (Basic Auth:
 *       secret key as username, blank password) with
 *       { type: method, amount: amount * 100 (centavos), currency: "PHP",
 *         redirect: { success: "<app deep link>", failed: "<app deep link>" } }
 *     response to app: { reference_id: <PayMongo source id>, checkout_url:
 *       <PayMongo's redirect.checkout_url>, status: "pending" }
 *
 *   GET /payments/paymongo/status/{reference_id}
 *     server-side: either check PayMongo's GET /sources/{id} directly, or
 *       (better) look up a row a PayMongo webhook already wrote when the
 *       payment completed -- PayMongo webhooks need their own secret to
 *       verify the signature, also stored server-side only.
 *     response to app: { status: "pending" | "paid" | "failed" }
 *
 * See docs/business/PayMongoIntegration.md for the full handoff writeup.
 */
export class XanoPaymentsRepository implements PaymentsRepository {
  private readonly fallback = new MockPaymentsRepository();

  async createCheckout(input: { method: PaymentCheckout["method"]; amount: number; orderId: string }): Promise<PaymentCheckout> {
    return this.fallback.createCheckout(input);
  }

  async getCheckoutStatus(referenceId: string): Promise<PaymentCheckout> {
    return this.fallback.getCheckoutStatus(referenceId);
  }
}
