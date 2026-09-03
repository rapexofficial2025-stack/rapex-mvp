import type { PaymentCheckout, PaymentsRepository } from "./PaymentsRepository";

const store = new Map<string, PaymentCheckout>();

/**
 * Mock-only escape hatch so the in-app checkout simulator screen can move a
 * pending checkout to paid/failed without a real PayMongo webhook -- not
 * part of the PaymentsRepository interface on purpose (Xano's real
 * implementation will never need this; a real webhook drives status there).
 */
export function mockSimulatePaymentOutcome(referenceId: string, status: "paid" | "failed"): void {
  const existing = store.get(referenceId);
  if (existing) store.set(referenceId, { ...existing, status });
}

function generateReferenceId(): string {
  return `mock_pm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Simulates a PayMongo GCash/QR Ph checkout entirely client-side -- no real
 * PayMongo API call is made here, deliberately. Creating a real PayMongo
 * Source/Payment Intent requires the account's SECRET key over Basic Auth,
 * which can never be safely called from a public app bundle (customer-app
 * ships to end users' devices/browsers -- anyone could extract it). That
 * call has to happen server-side; see XanoPaymentsRepository's doc comment
 * for the exact Xano endpoint contract needed to make this real.
 */
export class MockPaymentsRepository implements PaymentsRepository {
  async createCheckout(input: { method: PaymentCheckout["method"]; amount: number; orderId: string }): Promise<PaymentCheckout> {
    const referenceId = generateReferenceId();
    const checkout: PaymentCheckout = {
      referenceId,
      method: input.method,
      amount: input.amount,
      checkoutUrl: `mock://payment-checkout/${referenceId}`,
      status: "pending",
    };
    store.set(referenceId, checkout);
    return checkout;
  }

  async getCheckoutStatus(referenceId: string): Promise<PaymentCheckout> {
    const found = store.get(referenceId);
    if (!found) throw new Error("Checkout not found.");
    return found;
  }
}
