import type { WalletRepository } from "./WalletRepository";
import type { WalletSummary, WalletTransaction } from "../types";

const MOCK_DELAY_MS = 300;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

let balance = 1500;

const transactions: WalletTransaction[] = [
  { id: "txn-1", label: "Order #order-1001", amount: 268, direction: "debit", occurredAt: "2026-07-30T11:20:00.000Z" },
  { id: "txn-2", label: "Cashback reward", amount: 20, direction: "credit", occurredAt: "2026-07-29T14:00:00.000Z" },
  { id: "txn-3", label: "Wallet top-up", amount: 1000, direction: "credit", occurredAt: "2026-07-28T09:15:00.000Z" },
];

function summary(): WalletSummary {
  return { balance, transactions: [...transactions] };
}

/**
 * Called by the order-settlement engine when a rider marks an order
 * delivered -- deducts the full order total (product + delivery fee +
 * platform fee) from the customer's wallet in one shot, per the
 * "Deduct Customer Wallet" step of order completion.
 */
export function debitWalletForOrder(orderId: string, amount: number): WalletSummary {
  if (amount <= 0) throw new Error("Wallet deduction amount must be greater than zero.");
  if (amount > balance) throw new Error("Insufficient wallet balance to complete this order.");
  balance -= amount;
  transactions.unshift({
    id: `txn-${Date.now()}`,
    label: `Order #${orderId} total`,
    amount,
    direction: "debit",
    occurredAt: new Date().toISOString(),
  });
  return summary();
}

/** Stands in for the real Xano-backed WalletRepository until that API contract is provided. */
export class MockWalletRepository implements WalletRepository {
  async getWalletSummary(): Promise<WalletSummary> {
    return delay(summary());
  }
}
