import type { CustomerSummary, PendingMerchantApproval, PlatformStats } from "../types";

export interface AdminRepository {
  getPendingMerchantApprovals(): Promise<PendingMerchantApproval[]>;
  approveMerchant(merchantId: string): Promise<void>;
  rejectMerchant(merchantId: string): Promise<void>;
  getCustomers(): Promise<CustomerSummary[]>;
  getPlatformStats(): Promise<PlatformStats>;
}
