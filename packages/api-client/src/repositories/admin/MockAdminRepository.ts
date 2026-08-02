import type { AdminRepository, CreateEngineTierInput, GrantEngineAccessInput, UpdateEngineTierInput } from "./AdminRepository";
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

const MOCK_DELAY_MS = 350;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

let nextId = 5000;
function generateId(prefix: string): string {
  return `${prefix}-${nextId++}`;
}

let pendingApprovals: PendingMerchantApproval[] = [
  { id: "merchant-2", storeName: "Tejero Home Services", ownerName: "Liza Ocampo", submittedAt: "2026-07-31T10:00:00.000Z" },
  { id: "merchant-3", storeName: "Trias Auto Parts", ownerName: "Ferdinand Cruz", submittedAt: "2026-08-01T07:30:00.000Z" },
];

const customers: CustomerSummary[] = [
  { id: "user-1", name: "Juan dela Cruz", email: "juan@example.com", ordersCount: 6, joinedAt: "2026-06-10T00:00:00.000Z" },
  { id: "user-2", name: "Maria Santos", email: "maria@example.com", ordersCount: 12, joinedAt: "2026-05-02T00:00:00.000Z" },
];

const currentAdmin: CurrentAdmin = {
  id: "admin-1",
  name: "RAPEX Super Admin",
  email: "rapexofficial2025@gmail.com",
  role: "super-admin",
};

/** Commission Engine seeded with the ₱1-100=20% / ₱101-1,000=15% / ₱1,001+=10% example from the RAPEX spec. */
const engineTiers: Record<EngineKey, EngineTierRule[]> = {
  marketplace: [],
  delivery: [
    { id: "et-1", engineKey: "delivery", label: "Motorcycle Base", fromAmount: 0, toAmount: 3, commissionRatePercent: 0, markupRatePercent: 0, active: true, createdAt: "2026-07-01T00:00:00.000Z" },
  ],
  pricing: [
    { id: "et-2", engineKey: "pricing", label: "Tier 1", fromAmount: 1, toAmount: 100, commissionRatePercent: 20, markupRatePercent: 0, active: true, createdAt: "2026-07-01T00:00:00.000Z" },
    { id: "et-3", engineKey: "pricing", label: "Tier 2", fromAmount: 101, toAmount: 1000, commissionRatePercent: 15, markupRatePercent: 0, active: true, createdAt: "2026-07-01T00:00:00.000Z" },
    { id: "et-4", engineKey: "pricing", label: "Tier 3", fromAmount: 1001, toAmount: null, commissionRatePercent: 10, markupRatePercent: 0, active: true, createdAt: "2026-07-01T00:00:00.000Z" },
  ],
  promotions: [],
  finance: [
    { id: "et-5", engineKey: "finance", label: "Platform Fee", fromAmount: 0, toAmount: null, commissionRatePercent: 0, markupRatePercent: 5, active: true, createdAt: "2026-07-01T00:00:00.000Z" },
  ],
  membership: [],
  rewards: [],
  wallet: [],
  coverage: [],
  verification: [],
  orders: [],
  notifications: [],
  maps: [],
  developer: [],
};

const engineHistory: Record<EngineKey, EngineChangeLogEntry[]> = Object.fromEntries(
  (Object.keys(engineTiers) as EngineKey[]).map((key) => [key, [] as EngineChangeLogEntry[]]),
) as Record<EngineKey, EngineChangeLogEntry[]>;
engineHistory.pricing = [
  { id: "hist-1", engineKey: "pricing", summary: "Seeded default commission tiers (20% / 15% / 10%).", changedBy: currentAdmin.email, changedAt: "2026-07-01T00:00:00.000Z" },
];

let accessGrants: AdminAccessGrant[] = [
  { id: "grant-1", adminId: currentAdmin.id, email: currentAdmin.email, grantedBy: "system", grantedAt: "2026-07-01T00:00:00.000Z" },
];

function logChange(engineKey: EngineKey, summary: string) {
  engineHistory[engineKey] = [
    { id: generateId("hist"), engineKey, summary, changedBy: currentAdmin.email, changedAt: new Date().toISOString() },
    ...engineHistory[engineKey],
  ];
}

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

  async getCurrentAdmin(): Promise<CurrentAdmin> {
    return delay(currentAdmin);
  }

  async getEngineTiers(engineKey: EngineKey): Promise<EngineTierRule[]> {
    return delay(engineTiers[engineKey] ?? []);
  }

  async createEngineTier(engineKey: EngineKey, input: CreateEngineTierInput): Promise<EngineTierRule> {
    const tier: EngineTierRule = { id: generateId("et"), engineKey, createdAt: new Date().toISOString(), ...input };
    engineTiers[engineKey] = [...(engineTiers[engineKey] ?? []), tier];
    logChange(engineKey, `Added rule "${input.label}" (${input.commissionRatePercent}% commission, ${input.markupRatePercent}% markup).`);
    return delay(tier);
  }

  async updateEngineTier(tierId: string, input: UpdateEngineTierInput): Promise<EngineTierRule> {
    for (const engineKey of Object.keys(engineTiers) as EngineKey[]) {
      const tier = engineTiers[engineKey].find((t) => t.id === tierId);
      if (tier) {
        Object.assign(tier, input);
        logChange(engineKey, `Updated rule "${tier.label}".`);
        return delay(tier);
      }
    }
    throw new Error(`Engine tier ${tierId} not found`);
  }

  async deleteEngineTier(tierId: string): Promise<void> {
    for (const engineKey of Object.keys(engineTiers) as EngineKey[]) {
      const tier = engineTiers[engineKey].find((t) => t.id === tierId);
      if (tier) {
        engineTiers[engineKey] = engineTiers[engineKey].filter((t) => t.id !== tierId);
        logChange(engineKey, `Removed rule "${tier.label}".`);
        return delay(undefined);
      }
    }
    throw new Error(`Engine tier ${tierId} not found`);
  }

  async getEngineHistory(engineKey: EngineKey): Promise<EngineChangeLogEntry[]> {
    return delay(engineHistory[engineKey] ?? []);
  }

  async getEngineAccessGrants(): Promise<AdminAccessGrant[]> {
    return delay(accessGrants);
  }

  async grantEngineAccess(input: GrantEngineAccessInput): Promise<AdminAccessGrant> {
    const grant: AdminAccessGrant = {
      id: generateId("grant"),
      adminId: input.adminId,
      email: input.email,
      grantedBy: currentAdmin.email,
      grantedAt: new Date().toISOString(),
    };
    accessGrants = [...accessGrants, grant];
    return delay(grant);
  }

  async revokeEngineAccess(grantId: string): Promise<void> {
    accessGrants = accessGrants.filter((g) => g.id !== grantId);
    return delay(undefined);
  }
}
