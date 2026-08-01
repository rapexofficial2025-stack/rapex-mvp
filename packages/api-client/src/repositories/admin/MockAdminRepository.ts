import type { AdminRepository } from "./AdminRepository";
import type { CustomerSummary, PendingMerchantApproval, PlatformStats } from "../types";

const MOCK_DELAY_MS = 350;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

let pendingApprovals: PendingMerchantApproval[] = [
  { id: "merchant-2", storeName: "Tejero Home Services", ownerName: "Liza Ocampo", submittedAt: "2026-07-31T10:00:00.000Z" },
  { id: "merchant-3", storeName: "Trias Auto Parts", ownerName: "Ferdinand Cruz", submittedAt: "2026-08-01T07:30:00.000Z" },
];

const customers: CustomerSummary[] = [
  { id: "user-1", name: "Juan dela Cruz", email: "juan@example.com", ordersCount: 6, joinedAt: "2026-06-10T00:00:00.000Z" },
  { id: "user-2", name: "Maria Santos", email: "maria@example.com", ordersCount: 12, joinedAt: "2026-05-02T00:00:00.000Z" },
];

/** Stands in for the real Xano-backed AdminRepository until that API contract is provided. */
export class MockAdminRepository implements AdminRepository {
  async getPendingMerchantApprovals(): Promise<PendingMerchantApproval[]> {
    return delay(pendingApprovals);
  }

  async approveMerchant(merchantId: string): Promise<void> {
    pendingApprovals = pendingApprovals.filter((m) => m.id !== merchantId);
    return delay(undefined);
  }

  async rejectMerchant(merchantId: string): Promise<void> {
    pendingApprovals = pendingApprovals.filter((m) => m.id !== merchantId);
    return delay(undefined);
  }

  async getCustomers(): Promise<CustomerSummary[]> {
    return delay(customers);
  }

  async getPlatformStats(): Promise<PlatformStats> {
    return delay({ customerCount: customers.length, merchantCount: 5, ordersToday: 121, revenueToday: 47640 });
  }
}
