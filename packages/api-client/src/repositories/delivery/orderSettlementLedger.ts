/**
 * The Alpha "one complete financial transaction" demo: when a rider marks
 * an order delivered, this is what a real Xano transaction would do
 * atomically -- debit the customer, credit the merchant, credit the rider,
 * record platform revenue, and persist the settlement record. Each mock
 * repository here only mutates its OWN in-memory module state (there is no
 * shared process across the rider/customer/merchant/admin apps yet), so
 * this demonstrates the engine's math end-to-end within a single running
 * app rather than true cross-app sync -- that synchronization is exactly
 * the piece Xano is responsible for once it exists.
 */
import { calculateOrderFinancials } from "@rapex/utils";
import { debitWalletForOrder } from "../wallet/MockWalletRepository";
import { creditDeliveryIncome } from "../wallet/MockRiderWalletRepository";
import type { OrderFinancials } from "../types";

const merchantRevenueTransactions: { orderId: string; amount: number; occurredAt: string }[] = [];
const platformRevenueTransactions: { orderId: string; amount: number; source: "delivery-commission" | "platform-fee"; occurredAt: string }[] = [];
const orderFinancialsByOrderId = new Map<string, OrderFinancials>();

function creditMerchantRevenue(orderId: string, amount: number): void {
  merchantRevenueTransactions.unshift({ orderId, amount, occurredAt: new Date().toISOString() });
}

function recordPlatformRevenue(orderId: string, deliveryCommission: number, platformFee: number): void {
  if (deliveryCommission > 0) {
    platformRevenueTransactions.unshift({ orderId, amount: deliveryCommission, source: "delivery-commission", occurredAt: new Date().toISOString() });
  }
  if (platformFee > 0) {
    platformRevenueTransactions.unshift({ orderId, amount: platformFee, source: "platform-fee", occurredAt: new Date().toISOString() });
  }
}

export type SettleOrderInput = { orderId: string; distanceKm: number; productTotal: number };

/**
 * Runs the full settlement: Customer Wallet -> Merchant Revenue -> Rider
 * Earnings -> Platform Revenue -> Order Completion, in that order, using
 * the shared Delivery Fee Engine formula so every number matches what the
 * checkout/offer screens already previewed.
 */
export function settleOrder(input: SettleOrderInput): OrderFinancials {
  const financials = calculateOrderFinancials(input);

  debitWalletForOrder(financials.orderId, financials.walletDeduction);
  creditMerchantRevenue(financials.orderId, financials.merchantReceives);
  creditDeliveryIncome(financials.orderId, financials.riderEarnings);
  recordPlatformRevenue(financials.orderId, financials.platformRevenue - financials.platformFee, financials.platformFee);

  orderFinancialsByOrderId.set(financials.orderId, financials);
  return financials;
}

export function getOrderFinancials(orderId: string): OrderFinancials | null {
  return orderFinancialsByOrderId.get(orderId) ?? null;
}
