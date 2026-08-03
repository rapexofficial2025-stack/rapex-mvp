import type {
  AdminAccessGrant,
  AdminOrderRecord,
  CurrentAdmin,
  CustomerSummary,
  DashboardOverview,
  EngineChangeLogEntry,
  EngineKey,
  EngineTierRule,
  PendingMerchantApproval,
  PlatformStats,
  VerificationApplicant,
} from "../types";

export type CreateEngineTierInput = {
  label: string;
  fromAmount: number;
  toAmount: number | null;
  commissionRatePercent: number;
  markupRatePercent: number;
  active: boolean;
};

export type UpdateEngineTierInput = Partial<CreateEngineTierInput>;

export type GrantEngineAccessInput = { adminId: string; email: string };

export interface AdminRepository {
  getPendingMerchantApprovals(): Promise<PendingMerchantApproval[]>;
  approveMerchant(merchantId: string): Promise<void>;
  rejectMerchant(merchantId: string): Promise<void>;
  getCustomers(): Promise<CustomerSummary[]>;
  getPlatformStats(): Promise<PlatformStats>;

  getCurrentAdmin(): Promise<CurrentAdmin>;

  getEngineTiers(engineKey: EngineKey): Promise<EngineTierRule[]>;
  createEngineTier(engineKey: EngineKey, input: CreateEngineTierInput): Promise<EngineTierRule>;
  updateEngineTier(tierId: string, input: UpdateEngineTierInput): Promise<EngineTierRule>;
  deleteEngineTier(tierId: string): Promise<void>;
  getEngineHistory(engineKey: EngineKey): Promise<EngineChangeLogEntry[]>;

  getEngineAccessGrants(): Promise<AdminAccessGrant[]>;
  grantEngineAccess(input: GrantEngineAccessInput): Promise<AdminAccessGrant>;
  revokeEngineAccess(grantId: string): Promise<void>;

  /** Delivery Fee Engine settlements -- Distance, Delivery Fee, Merchant Receives, Platform Revenue, Rider Earnings, Wallet Deduction, Order Timeline. */
  getOrderFinancials(): Promise<AdminOrderRecord[]>;

  getDashboardOverview(): Promise<DashboardOverview>;

  getVerificationQueue(): Promise<VerificationApplicant[]>;
  approveApplicant(applicantId: string): Promise<void>;
  rejectApplicant(applicantId: string): Promise<void>;
}
