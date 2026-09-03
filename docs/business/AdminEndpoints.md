# Admin Portal — Xano Endpoints Needed (Batch 1: Users, Merchant Approvals, Verification, Order Financials, Engine Center, Dashboard)

## Status
None of these exist in Xano yet. `AdminRepository` (the frontend interface these
map to) is fully defined in `packages/api-client/src/repositories/admin/AdminRepository.ts`
and currently backed only by `MockAdminRepository`. `apps/admin-portal/src/features/user-management/UserManagementPage.tsx`
doesn't even have a repository yet -- it runs on a hardcoded placeholder array.

Field names below match the frontend TypeScript types exactly
(`packages/api-client/src/repositories/types.ts`) -- Xano's response should use
these exact keys (camelCase) or the frontend adapter layer will need a mapping
step. All endpoints require `Authorization: Bearer <token>` and should only
succeed for an authenticated Admin/Super Admin session.

---

## 1. Users (User Management page)

### GET /admin-master-data/users
Query params (optional): `search` (matches name/email/phone/id), `role`
(Customer | Merchant | Rider | Service provider | Admin)

Response: array of
```json
{
  "id": "USR-2026-101",
  "name": "Maria Santos",
  "contact": "maria@example.com · 09171234587",
  "role": "Customer",
  "status": "Active",
  "location": "Imus, Cavite",
  "joined": "2026-08-12",
  "review": {
    "orderReference": "ORD-...",
    "signal": "Repeated cancelled requests",
    "remark": "..."
  }
}
```
`review` is present only when the account has an open manual-review flag.

### POST /admin-master-data/users/{user_id}/status
**This must be an audited action** -- the current UI explicitly refuses to
change any account status without one (see the screen's own warning copy:
"Do not call an account a scammer based on an automated flag... use an
audited Xano action"). The endpoint must write a permanent record of who
made the change, when, and why -- not just flip a status field silently.

body: `{ status: "Active" | "Pending review" | "Restricted", reason: string }`
response: `{ success: true, user: <same shape as above, updated> }`

The audit record itself (admin id, target user id, old status, new status,
reason, timestamp) should be queryable later for `super-admin/audit` (see
Batch 2, not written yet).

---

## 2. Merchant Approvals (Dashboard's pending-approvals widget)

### GET /admin-master-data/merchants/pending
Response: array of
```json
{ "id": "...", "storeName": "...", "ownerName": "...", "submittedAt": "2026-08-20T10:00:00Z" }
```

### POST /admin-master-data/merchants/{merchant_id}/approve
No body. Response: `{ success: true }`

### POST /admin-master-data/merchants/{merchant_id}/reject
No body (or `{ reason?: string }` if you want to capture why). Response: `{ success: true }`

---

## 3. Verification Queue (Rider/Merchant/Service-provider KYC review)

### GET /admin-master-data/verification-queue
Response: array of
```json
{
  "id": "...",
  "name": "...",
  "role": "merchant" | "rider" | "service-provider",
  "submittedAt": "2026-08-20T10:00:00Z",
  "documentLabels": ["Valid ID", "Selfie with ID", "Business Permit"],
  "status": "pending" | "approved" | "rejected"
}
```

### POST /admin-master-data/verification-queue/{applicant_id}/approve
No body. Response: `{ success: true }`

### POST /admin-master-data/verification-queue/{applicant_id}/reject
`{ reason?: string }`. Response: `{ success: true }`

---

## 4. Order Financials (Delivery Fee Engine settlements)

### GET /admin-master-data/order-financials
Response: array of order records, each combining base order info with the
settlement breakdown:
```json
{
  "id": "...",
  "distanceKm": 2.5,
  "deliveryFee": 50,
  "merchantReceives": 120,
  "platformRevenue": 15,
  "riderEarnings": 45,
  "walletDeduction": 10,
  "orderTimeline": [{ "status": "placed", "at": "2026-08-20T10:00:00Z" }, ...]
}
```
Exact field names TBD by whoever confirms `AdminOrderRecord`/`OrderFinancials`
in `types.ts` (line ~745) -- ping us if the shape needs adjusting once you
see what's actually in the orders table.

---

## 5. Engine Center (Formula Engines -- Super Admin system configuration)

`EngineKey` is one of: `marketplace | delivery | pricing | promotions | finance
| membership | rewards | wallet | coverage | verification | orders |
notifications | maps | developer`

### GET /admin-master-data/engines/{engine_key}/tiers
Response: array of
```json
{
  "id": "...", "engineKey": "delivery", "label": "Tier 1",
  "fromAmount": 0, "toAmount": 500,
  "commissionRatePercent": 10, "markupRatePercent": 5,
  "active": true, "createdAt": "2026-08-01T00:00:00Z"
}
```

### POST /admin-master-data/engines/{engine_key}/tiers
body: `{ label, fromAmount, toAmount, commissionRatePercent, markupRatePercent, active }`
response: the created tier (same shape as above)

### PATCH /admin-master-data/engines/tiers/{tier_id}
body: any subset of the fields above
response: the updated tier

### DELETE /admin-master-data/engines/tiers/{tier_id}
response: `{ success: true }`

### GET /admin-master-data/engines/{engine_key}/history
Response: array of
```json
{ "id": "...", "engineKey": "delivery", "summary": "Updated Tier 1 commission from 8% to 10%", "changedBy": "admin@rapex.ph", "changedAt": "2026-08-20T10:00:00Z" }
```
Every create/update/delete on a tier should append one of these automatically
-- this is the audit trail for engine changes.

### GET /admin-master-data/engine-access
Response: array of
```json
{ "id": "...", "adminId": "...", "email": "...", "grantedBy": "...", "grantedAt": "2026-08-20T10:00:00Z" }
```

### POST /admin-master-data/engine-access
body: `{ adminId, email }`
response: the created grant (same shape as above)

### DELETE /admin-master-data/engine-access/{grant_id}
response: `{ success: true }`

---

## 6. Dashboard Overview

### GET /admin-master-data/dashboard-overview
Response:
```json
{
  "revenueToday": 47640, "revenueTodayChangePercent": 12.5,
  "ordersToday": 121, "ordersTodayChangePercent": 8.2,
  "completedOrdersToday": 108, "completedOrdersChangePercent": 9.6,
  "pendingOrders": 9, "pendingOrdersChangePercent": 0,
  "onlineRiders": 0, "onlineStores": 0,
  "registeredCustomers": 0, "registeredMerchants": 0, "registeredRiders": 0,
  "productsListed": 0, "storesListed": 0, "categoriesCount": 0,
  "municipalitiesCount": 0, "activeAuctions": 0,
  "revenueTrend": [{ "date": "2026-08-14", "revenue": 12000 }, ...],
  "revenueBreakdown": [{ "label": "merchants", "amount": 30000 }, { "label": "riders", "amount": 10000 }, { "label": "platform-fee", "amount": 7640 }],
  "recentOrders": [{ "id": "...", "storeName": "...", "customerName": "...", "status": "pending", "occurredAt": "..." }],
  "systemStatus": [{ "service": "Xano API", "status": "operational" }],
  "membershipExpirations": [{ "merchantName": "...", "expiresAt": "...", "daysLeft": 5 }]
}
```

### GET /admin-master-data/platform-stats
Response: `{ "customerCount": 0, "merchantCount": 0, "ordersToday": 0, "revenueToday": 0 }`

---

## Next batches (all written — see individual files)
- `AdminEndpoints-Batch2.md` — Product Monitoring, Product Categories/
  Variants/Options/Images, Inventory
- `AdminEndpoints-Batch3.md` — Master Data (Registration Monitor, Age
  Engine, Locations, Communities), full Merchant Management
- `AdminEndpoints-Batch4.md` — Order Management, Delivery Monitoring,
  Rider Management + Active Deliveries
- `AdminEndpoints-Batch5.md` — Error Center, Operational Settings
- `AdminEndpoints-Batch6.md` — Super Admin (Admin Accounts, Users & Roles,
  Stores & Merchants, Products & Listings, Formula Engines, Audit &
  Recovery) — **flagged as needing a security review pass before building**,
  not just a contract read-through
- `AdminEndpoints-Batch7.md` — Merchant portal's remaining ~25 mock methods
  (stores, registration draft, products/variants, expansion requests,
  insights, orders, vouchers)

Total across all 7 documents: ~90 endpoints spanning Admin, Super Admin, and
Merchant. Every one of these is currently Mock-only in the frontend — none
of this is guessed at the contract level; field names were taken directly
from the already-designed TypeScript interfaces
(`packages/api-client/src/repositories/*/*.ts`, `types.ts`) or from what the
existing UI screens already render. Wiring the frontend to each real
endpoint once Xano builds it is a small, mechanical change per method (swap
a `fallback.method()` call for a real `client.request()` call) — the slow
part was always the backend, not the frontend adapter.
