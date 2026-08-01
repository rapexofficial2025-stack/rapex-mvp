import type { WalletRepository } from "./WalletRepository";
import type { WalletSummary } from "../types";

const MOCK_DELAY_MS = 300;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

const MOCK_WALLET: WalletSummary = {
  balance: 850,
  transactions: [
    { id: "txn-1", label: "Order #order-1001", amount: 268, direction: "debit", occurredAt: "2026-07-30T11:20:00.000Z" },
    { id: "txn-2", label: "Cashback reward", amount: 20, direction: "credit", occurredAt: "2026-07-29T14:00:00.000Z" },
    { id: "txn-3", label: "Wallet top-up", amount: 1000, direction: "credit", occurredAt: "2026-07-28T09:15:00.000Z" },
  ],
};

/** Stands in for the real Xano-backed WalletRepository until that API contract is provided. */
export class MockWalletRepository implements WalletRepository {
  async getWalletSummary(): Promise<WalletSummary> {
    return delay(MOCK_WALLET);
  }
}
