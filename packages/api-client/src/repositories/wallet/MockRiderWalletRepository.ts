import { canAcceptDelivery } from "@rapex/utils";
import type { RiderWalletRepository } from "./RiderWalletRepository";
import type { RiderWalletSummary, RiderWalletTransaction } from "../types";

const MOCK_DELAY_MS = 300;
const MINIMUM_OPERATIONAL_BALANCE = 50;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

let operationalBalance = 320;
let incomeBalance = 1845.5;

const transactions: RiderWalletTransaction[] = [
  { id: "rwtxn-1", walletType: "income", type: "delivery-income", label: "Delivery #order-4998 net income", amount: 78.4, direction: "credit", occurredAt: "2026-08-01T15:20:00.000Z" },
  { id: "rwtxn-2", walletType: "operational", type: "deduction", label: "Delivery #order-4998 operational hold", amount: 20, direction: "debit", occurredAt: "2026-08-01T14:55:00.000Z" },
  { id: "rwtxn-3", walletType: "operational", type: "top-up", label: "GCash top-up", amount: 200, direction: "credit", occurredAt: "2026-07-31T09:10:00.000Z" },
];

function summary(): RiderWalletSummary {
  return {
    operationalBalance,
    incomeBalance,
    minimumOperationalBalance: MINIMUM_OPERATIONAL_BALANCE,
    transactions: [...transactions],
  };
}

function pushTransaction(txn: RiderWalletTransaction): void {
  transactions.unshift(txn);
}

/**
 * Called by MockDeliveryRepository when a delivery completes -- auto-credits
 * rider earnings to the income wallet and deducts a small operational hold,
 * per "auto deduct operational funds" / "auto credit rider earnings" rules.
 */
export function creditDeliveryIncome(orderId: string, netRiderIncome: number, operationalHold = 20): void {
  incomeBalance += netRiderIncome;
  operationalBalance -= operationalHold;
  pushTransaction({
    id: `rwtxn-${Date.now()}`,
    walletType: "income",
    type: "delivery-income",
    label: `Delivery #${orderId} net income`,
    amount: netRiderIncome,
    direction: "credit",
    occurredAt: new Date().toISOString(),
  });
  pushTransaction({
    id: `rwtxn-${Date.now() + 1}`,
    walletType: "operational",
    type: "deduction",
    label: `Delivery #${orderId} operational hold`,
    amount: operationalHold,
    direction: "debit",
    occurredAt: new Date().toISOString(),
  });
}

export function getOperationalBalance(): number {
  return operationalBalance;
}

export function isWalletEligibleForDelivery(): boolean {
  return canAcceptDelivery(operationalBalance, MINIMUM_OPERATIONAL_BALANCE);
}

/** Stands in for the real Xano-backed RiderWalletRepository until that API contract is provided. */
export class MockRiderWalletRepository implements RiderWalletRepository {
  async getRiderWalletSummary(): Promise<RiderWalletSummary> {
    return delay(summary());
  }

  async topUpOperational(amount: number): Promise<RiderWalletSummary> {
    if (amount <= 0) throw new Error("Top-up amount must be greater than zero.");
    operationalBalance += amount;
    pushTransaction({
      id: `rwtxn-${Date.now()}`,
      walletType: "operational",
      type: "top-up",
      label: "Operational wallet top-up",
      amount,
      direction: "credit",
      occurredAt: new Date().toISOString(),
    });
    return delay(summary());
  }

  async requestRemittance(amount: number): Promise<RiderWalletSummary> {
    if (amount <= 0) throw new Error("Remittance amount must be greater than zero.");
    if (amount > incomeBalance) throw new Error("Remittance amount exceeds income wallet balance.");
    incomeBalance -= amount;
    pushTransaction({
      id: `rwtxn-${Date.now()}`,
      walletType: "income",
      type: "remittance",
      label: "Remittance to bank/e-wallet",
      amount,
      direction: "debit",
      occurredAt: new Date().toISOString(),
    });
    return delay(summary());
  }
}
