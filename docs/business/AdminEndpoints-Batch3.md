# Admin Portal — Xano Endpoints Needed (Batch 3: Master Data — Registration Monitor, Age Engine, Locations, Communities, Merchant Management)

## Status
None of these exist in Xano yet. All screens below are empty shells
(`AdminDataModulePage.tsx`) with no repository behind them. Column names
match what the UI already displays.

All endpoints require `Authorization: Bearer <token>`, Admin/Super Admin
only. List endpoints support `search`, `page`, `perPage` unless noted.

Note: `regionId`/`provinceId`/`municipalityId`/`barangayId` below match the
naming already used in `RegisterInput` (`packages/api-client/src/
repositories/auth/AuthRepository.ts`) — the same location-hierarchy IDs a
user's registration record references, so these screens are effectively
managing the lookup tables that registration reads from.

---

## 1. User Registration Monitor

### GET /admin-master-data/registrations
Query params (optional): `search`, `stage` (in_progress | complete | needs_review)

Response: array of
```json
{
  "userId": "USR-...",
  "name": "...",
  "currentStep": "Profile setup",
  "progressPercent": 60,
  "missingRequirement": "Valid ID upload",
  "startedAt": "...",
  "lastActivityAt": "..."
}
```
Read-only monitoring — the screen has no edit action, just visibility into
where users are stuck in onboarding.

---

## 2. Age & Registration Engine

### GET /admin-master-data/age-checks
Query params (optional): `search`, `status` (passed | locked | needs_review)

Response: array of
```json
{
  "userId": "USR-...",
  "name": "...",
  "birthYear": 2001,
  "ageResult": "Eligible",
  "checkStatus": "passed",
  "checkedAt": "...",
  "lockout": false
}
```
This mirrors what `POST /pre-auth/check-age` already decides at signup time
(see `XanoAuthRepository.checkAge`) — this screen just needs read access to
the log of those results, not a new decision engine.

---

## 3. Address & Location Management

### GET /admin-master-data/locations/regions
### GET /admin-master-data/locations/provinces?regionId=...
### GET /admin-master-data/locations/municipalities?provinceId=...
### GET /admin-master-data/locations/barangays?municipalityId=...

Each returns an array of:
```json
{ "id": "...", "name": "...", "code": "...", "parentId": "...", "active": true, "createdAt": "...", "updatedAt": "..." }
```
`parentId` is omitted/null for regions.

### POST /admin-master-data/locations/{level}
(`level` = regions | provinces | municipalities | barangays)
body: `{ name, code, parentId?, active }`
response: created record

### PATCH /admin-master-data/locations/{level}/{id}
body: any subset of the fields above
response: updated record

### DELETE /admin-master-data/locations/{level}/{id}
response: `{ success: true }` — should refuse deletion if any user or store
row references this ID (same orphan-prevention rule as Batch 2's product
categories).

**This is the highest-priority item in this batch** — it directly unblocks
the registration flow's documented gap: `RegisterInput`'s doc comment
currently says "no confirmed region/province/municipality/barangay ID lookup
exists" and registration may be rejected by Xano until it's wired. Once
these four GETs exist and are confirmed, the Customer/Rider/Merchant
registration screens can add a real address picker instead of leaving those
fields unset.

---

## 4. Community & Culture

### GET /admin-master-data/communities
Response: array of
```json
{ "id": "...", "name": "...", "description": "...", "active": true, "usersCount": 0, "createdAt": "...", "updatedAt": "..." }
```

### POST /admin-master-data/communities
body: `{ name, description, active }` — response: created record

### PATCH /admin-master-data/communities/{id}
body: any subset — response: updated record

### DELETE /admin-master-data/communities/{id}
response: `{ success: true }`

---

## 5. Merchant Management (full list — broader than Batch 1's pending-approvals widget)

Batch 1 already covers `GET /admin-master-data/merchants/pending` +
approve/reject for the dashboard widget. This is the full merchant list
screen, which needs every merchant regardless of status, plus rollups.

### GET /admin-master-data/merchants
Query params (optional): `search`, `status` (All | Pending | Active | Suspended | Rejected)

Response: array of
```json
{
  "id": "MER-...",
  "businessName": "...",
  "category": "...",
  "ownerName": "...",
  "location": "...",
  "verificationStatus": "verified" | "pending" | "rejected",
  "storeStatus": "open" | "closed" | "suspended",
  "ordersCount": 0,
  "salesTotal": 0,
  "createdAt": "..."
}
```

### POST /admin-master-data/merchants/{merchant_id}/suspend
body: `{ reason: string }` — response: `{ success: true }` (audited action)

### POST /admin-master-data/merchants/{merchant_id}/reinstate
response: `{ success: true }` (audited action)

---

## Next batches (not written yet)
- Order Management + Delivery Monitoring
- Rider Management + Active Deliveries
- Error Center, Operational Settings
- Super Admin (Admin Accounts, Users & Roles, Stores & Merchants, Products &
  Listings, Audit & Recovery, Receipt Design, Secure Exports)
- Merchant portal's remaining ~25 mock methods
