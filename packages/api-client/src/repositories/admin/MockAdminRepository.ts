import { calculateOrderFinancials } from "@rapex/utils";
import type { AdminRepository, CreateEngineTierInput, GrantEngineAccessInput, UpdateEngineTierInput } from "./AdminRepository";
import type {
  AdminAccessGrant,
  AdminOrderRecord,
  CurrentAdmin,
  CustomerSummary,
  DashboardOverview,
  DeliveryTimelineEntry,
  EngineChangeLogEntry,
  EngineKey,
  EngineTierRule,
  PendingMerchantApproval,
  PlatformStats,
  VerificationApplicant,
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

/** Delivery Fee Engine demo settlements -- same formula as rider-app/customer-app, seeded with the spec's example distances. */
function buildTimeline(baseIso: string, orderId: string): DeliveryTimelineEntry[] {
  const base = new Date(baseIso).getTime();
  const statuses: DeliveryTimelineEntry["status"][] = [
    "waiting",
    "assigned",
    "accepted",
    "going-to-merchant",
    "arrived-merchant",
    "picked-up",
    "on-the-way",
    "arrived-customer",
    "delivered",
    "completed",
  ];
  return statuses.map((status, index) => ({
    status,
    occurredAt: new Date(base + index * 3 * 60 * 1000).toISOString(),
    note: status === "completed" ? `Order #${orderId} settled.` : undefined,
  }));
}

const orderFinancials: AdminOrderRecord[] = [
  {
    ...calculateOrderFinancials({ orderId: "order-5001", distanceKm: 2.5, productTotal: 120 }),
    customerName: "Elena Santos",
    merchantName: "Aling Nena's Carinderia",
    riderName: "Marco Villanueva",
    status: "completed",
    timeline: buildTimeline("2026-08-01T15:00:00.000Z", "order-5001"),
  },
  {
    ...calculateOrderFinancials({ orderId: "order-5002", distanceKm: 1.8, productTotal: 89 }),
    customerName: "Rafael Cruz",
    merchantName: "Kainan ni Aling Marites",
    riderName: "Jomar Reyes",
    status: "completed",
    timeline: buildTimeline("2026-08-01T12:30:00.000Z", "order-5002"),
  },
  {
    ...calculateOrderFinancials({ orderId: "order-5003", distanceKm: 5.2, productTotal: 340 }),
    customerName: "Bea Manalo",
    merchantName: "Trias Auto Parts",
    riderName: "Kevin Domingo",
    status: "completed",
    timeline: buildTimeline("2026-07-31T09:15:00.000Z", "order-5003"),
  },
];

const dashboardOverview: DashboardOverview = {
  revenueToday: 285420.75,
  revenueTodayChangePercent: 12.5,
  ordersToday: 1432,
  ordersTodayChangePercent: 8.2,
  completedOrdersToday: 1156,
  completedOrdersChangePercent: 9.6,
  pendingOrders: 276,
  pendingOrdersChangePercent: -4.1,
  onlineRiders: 128,
  onlineStores: 93,
  registeredCustomers: 12845,
  registeredMerchants: 1245,
  registeredRiders: 2356,
  productsListed: 18734,
  storesListed: 1089,
  categoriesCount: 156,
  municipalitiesCount: 145,
  activeAuctions: 23,
  revenueTrend: [
    { date: "2026-07-20T00:00:00.000Z", revenue: 210000 },
    { date: "2026-07-21T00:00:00.000Z", revenue: 245000 },
    { date: "2026-07-22T00:00:00.000Z", revenue: 268000 },
    { date: "2026-07-23T00:00:00.000Z", revenue: 190000 },
    { date: "2026-07-24T00:00:00.000Z", revenue: 205000 },
    { date: "2026-07-25T00:00:00.000Z", revenue: 260000 },
    { date: "2026-07-26T00:00:00.000Z", revenue: 285420.75 },
  ],
  revenueBreakdown: [
    { label: "merchants", amount: 193421.5 },
    { label: "riders", amount: 54120 },
    { label: "platform-fee", amount: 37879.25 },
  ],
  recentOrders: [
    { id: "order-2026-0726-001", storeName: "7-Eleven - Imus", customerName: "Ana Cruz", status: "preparing", occurredAt: "2026-07-26T02:00:00.000Z" },
    { id: "order-2026-0726-002", storeName: "Jollibee - Bacoor", customerName: "Miguel Torres", status: "out-for-delivery", occurredAt: "2026-07-26T01:55:00.000Z" },
    { id: "order-2026-0726-003", storeName: "Puregold - Dasmariñas", customerName: "Pedro Garcia", status: "delivered", occurredAt: "2026-07-26T01:52:00.000Z" },
    { id: "order-2026-0726-004", storeName: "Mercury Drug - Imus", customerName: "Anna Reyes", status: "pending", occurredAt: "2026-07-26T01:50:00.000Z" },
    { id: "order-2026-0726-005", storeName: "SM Hypermarket - Trece", customerName: "Mark Lopez", status: "accepted", occurredAt: "2026-07-26T01:48:00.000Z" },
  ],
  systemStatus: [
    { service: "Xano API", status: "operational" },
    { service: "Firebase", status: "operational" },
    { service: "Google Maps", status: "operational" },
    { service: "PayMongo", status: "operational" },
    { service: "SMS Gateway", status: "operational" },
    { service: "Email Service", status: "operational" },
  ],
  membershipExpirations: [{ merchantName: "RAPEX Hardware", expiresAt: "2026-08-01T00:00:00.000Z", daysLeft: 6 }],
};

let verificationQueue: VerificationApplicant[] = [
  { id: "usr-ver-01", name: "Carlo Bautista", role: "merchant", submittedAt: "2026-07-26T00:00:00.000Z", documentLabels: ["DTI Certificate", "Business Permit", "ID"], status: "pending" },
  { id: "usr-ver-02", name: "Miguel Torres", role: "rider", submittedAt: "2026-07-25T21:00:00.000Z", documentLabels: ["Driver License", "Vehicle Reg", "NBI Clearance"], status: "pending" },
  { id: "usr-ver-03", name: "Anna Lim", role: "service-provider", submittedAt: "2026-07-25T02:00:00.000Z", documentLabels: ["DTI Certificate", "Insurance", "ID"], status: "pending" },
  { id: "usr-ver-04", name: "Pedro Reyes", role: "merchant", submittedAt: "2026-07-25T02:00:00.000Z", documentLabels: ["Business Permit", "BIR Certificate", "ID"], status: "pending" },
  { id: "usr-ver-05", name: "Jose Manalo", role: "rider", submittedAt: "2026-07-24T02:00:00.000Z", documentLabels: ["Driver License", "Vehicle Reg"], status: "pending" },
  { id: "usr-ver-06", name: "Teresa Aquino", role: "merchant", submittedAt: "2026-07-23T02:00:00.000Z", documentLabels: ["DTI Certificate", "Business Permit", "BIR Certificate", "ID"], status: "pending" },
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

  async getOrderFinancials(): Promise<AdminOrderRecord[]> {
    return delay(orderFinancials);
  }

  async getDashboardOverview(): Promise<DashboardOverview> {
    return delay(dashboardOverview);
  }

  async getVerificationQueue(): Promise<VerificationApplicant[]> {
    return delay(verificationQueue.filter((a) => a.status === "pending"));
  }

  async approveApplicant(applicantId: string): Promise<void> {
    verificationQueue = verificationQueue.map((a) => (a.id === applicantId ? { ...a, status: "approved" } : a));
    return delay(undefined);
  }

  async rejectApplicant(applicantId: string): Promise<void> {
    verificationQueue = verificationQueue.map((a) => (a.id === applicantId ? { ...a, status: "rejected" } : a));
    return delay(undefined);
  }
}
