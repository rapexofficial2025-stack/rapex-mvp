import type {
  AdminAccessGrant,
  CurrentAdmin,
  CustomerSummary,
  EngineChangeLogEntry,
  EngineKey,
  EngineTierRule,
  PendingMerchantApproval,
  PlatformStats,
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
}
