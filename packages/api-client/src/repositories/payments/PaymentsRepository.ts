export type PaymentMethodType = "gcash" | "qrph";

export type PaymentCheckoutStatus = "pending" | "paid" | "failed";

export type PaymentCheckout = {
  referenceId: string;
  method: PaymentMethodType;
  amount: number;
  /** Where to send the customer to complete payment (PayMongo-hosted page, or the in-app mock simulator until a real Xano endpoint exists). */
  checkoutUrl: string;
  status: PaymentCheckoutStatus;
};

export interface PaymentsRepository {
  createCheckout(input: { method: PaymentMethodType; amount: number; orderId: string }): Promise<PaymentCheckout>;
  getCheckoutStatus(referenceId: string): Promise<PaymentCheckout>;
}
