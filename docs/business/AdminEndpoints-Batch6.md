# Admin Portal — Xano Endpoints Needed (Batch 6: Super Admin — Access, Admin Accounts, Users & Roles, Stores & Merchants, Products & Listings, Formula Engines, Audit & Recovery)

## ⚠️ Read this before building anything in this batch
Every other batch (1-5) is "safe" in the sense that a wrong field name just
means a frontend mapping tweak. **This batch is different.** It covers
account creation/suspension for other Admins, privilege elevation, and
platform-wide mutation tools ("God Mode"). The frontend
(`SuperAdminAccessPage.tsx`, `SuperAdminModulePage.tsx`) was deliberately
built as a locked shell that shows *zero* real actions until a verified
elevation token exists — every action button currently says "Hidden
operational controls become active only after Xano returns this action in
the current Super Admin capability set." That discipline needs to carry
through to the backend: **the frontend must never be the thing deciding
what's allowed.** Every mutation below must re-check authorization
server-side on every call, not just at the elevation step.

Recommend the founder (or whoever owns Xano security review) look at this
batch specifically before it's built — not because the frontend contract is
wrong, but because this is the one place on the platform where a mistake is
expensive. Batches 1-5 can be built and iterated on quickly; this one
deserves a slower, reviewed pass.

---

## 1. Super Admin step-up access (the gate everything else sits behind)

The frontend already documents its own intended contract exactly
(`SuperAdminAccessPage.tsx`) — this section just formalizes it.

### POST /super-admin/access/verify
body: `{ securityKey: string }` (sent over the already-authenticated Admin
session's Bearer token — this is a second factor on top of that, not a
replacement for it)

response:
```json
{
  "elevationToken": "...",
  "role": "super-admin",
  "allowedModules": ["admins", "users", "stores", "catalog", "engines", "audit"],
  "allowedActions": { "admins": ["invite", "edit-role", "suspend", "restore"], "...": ["..."] },
  "expiresAt": "2026-08-24T11:15:00Z"
}
```
- Never store `securityKey` anywhere except in transit (the frontend already
  guarantees this on its side — no localStorage/sessionStorage/cache).
- `elevationToken` should be short-lived (the UI's own copy says "short-lived
  elevation expiry and re-verification requirement") — every request in
  sections 2-6 below should require this token in addition to the normal
  Bearer token, and every one of those endpoints must independently verify
  it hasn't expired, not just check it was present at the client's page load.
- Every verify attempt (success or failure) writes an audit row: admin id,
  timestamp, success/failure, device/IP context.

### POST /super-admin/access/revoke
No body (revokes the calling session's own elevation early). response: `{ success: true }`

---

## 2. Admin Accounts

### GET /super-admin/admins
Response: array of
```json
{ "id": "...", "name": "...", "email": "...", "role": "admin" | "super-admin", "status": "active" | "suspended", "permissions": ["..."], "lastSessionAt": "..." }
```

### POST /super-admin/admins/invite
body: `{ email, role, permissions: string[] }` — response: `{ success: true, invitationId: "..." }`

### PATCH /super-admin/admins/{admin_id}/permissions
body: `{ permissions: string[] }` — response: updated record

### POST /super-admin/admins/{admin_id}/suspend
body: `{ reason: string }` — response: `{ success: true }`

### POST /super-admin/admins/{admin_id}/restore
response: `{ success: true }`

### GET /super-admin/admins/{admin_id}/sessions
Response: array of `{ id, device, ipPolicy, startedAt, endedAt, elevatedActions: string[] }` — the "review privileged sessions" action.

---

## 3. Users & Roles (platform-wide, beyond what Batch 1's `/admin-master-data/users` covers)

Batch 1 already covers list + audited status-change for regular user
accounts. This section is specifically the Super-Admin-only actions the UI
lists that Batch 1 didn't: creating an account directly (bypassing normal
signup) and assigning a "server-approved capability" (a role/permission
flag beyond the basic Customer/Rider/Merchant/Admin role).

### POST /super-admin/users
body: `{ email, role, firstName, lastName, ...same fields as /auth/signup }`
response: created user — audited, and should be rare/exceptional (normal
users go through `/auth/signup`; this is for support-created accounts).

### POST /super-admin/users/{user_id}/capability
body: `{ capability: string, granted: boolean }`
response: `{ success: true }` — audited.

---

## 4. Stores & Merchants (Super-Admin-level corrections beyond Batch 3's list/suspend)

### POST /super-admin/stores
body: `{ merchantId, name, category, address, ... }` — creates a store/branch directly. response: created store.

### PATCH /super-admin/stores/{store_id}/operating-status
body: `{ status: "open" | "closed" | "suspended", reason: string }` — response: `{ success: true }` (audited)

### GET /super-admin/merchants/{merchant_id}/audit-trail
Response: array of `{ id, action, changedBy, changedAt, oldValue, newValue }`

---

## 5. Products & Listings (Super-Admin corrections across all listing types)

### POST /super-admin/catalog/products
### POST /super-admin/catalog/services
### POST /super-admin/catalog/auctions
### POST /super-admin/catalog/pre-loved

Each: `{ ...type-specific fields... }` — response: created listing. Exact
per-type field shapes need to come from whoever owns each listing type's
schema (Auction and Pre-Loved in particular don't have a confirmed frontend
type yet anywhere in this repo — flag if those need to be designed from
scratch rather than just documented).

---

## 6. Formula & Platform Engines (Super-Admin layer on top of Batch 1's Engine Center)

Batch 1 already covers `GET/POST/PATCH/DELETE` for engine tiers, history,
and access grants — that's the Admin-level Engine Center. This adds the two
Super-Admin-only actions the UI lists that Batch 1 doesn't: versioned
activation/retirement and a server-side calculation test/preview.

### POST /super-admin/engines/{engine_key}/tiers/{tier_id}/activate
### POST /super-admin/engines/{engine_key}/tiers/{tier_id}/retire
Both: no body — response: `{ success: true }` (audited, with an effective
date the UI's "effective dates" copy implies should be supported — consider
`{ effectiveAt?: ISODateString }` on activate).

### POST /super-admin/engines/{engine_key}/test
body: `{ ...inputs matching whatever the engine calculates, e.g. distanceKm/orderAmount for delivery... }`
response: `{ result: number, breakdown: {...} }` — runs the calculation
server-side without creating/charging anything real. Exact input shape
depends on each engine — start with `delivery` and `pricing` since those are
the two with real frontend consumers already (Delivery Fee Engine, Checkout
pricing).

---

## 7. Audit & Recovery

### GET /super-admin/audit
Query params (optional): `actorId`, `module`, `dateFrom`, `dateTo`, `page`, `perPage`

Response: array of
```json
{ "id": "...", "actorId": "...", "actorEmail": "...", "module": "...", "action": "...", "oldValue": {}, "newValue": {}, "reason": "...", "traceId": "...", "occurredAt": "..." }
```
This is the single feed every audited action across Batches 1-6 should be
writing to — every `POST .../approve`, `.../suspend`, `.../status` etc.
across every batch should append one row here, not maintain separate
per-feature audit tables.

### GET /super-admin/exports
Response: array of past export requests: `{ id, requestedBy, type, status: "pending" | "ready" | "expired", requestedAt, readyAt }`

### POST /super-admin/exports
body: `{ type: "users" | "orders" | "merchants" | "audit-log", filters: {...} }`
response: `{ id, status: "pending" }` — a secure, expiring, downloadable
export job (per the UI's "Secure Exports" module) — never a synchronous raw
dump, given this can touch PII.

### GET /super-admin/receipts
Response: array of issued receipts: `{ id, orderId, issuedTo, amount, issuedAt }` (read-only monitoring of the receipt-design/issuance the UI references).

### POST /super-admin/recovery/{action_key}
body: `{ targetId, reason: string }` — the UI's "Start approved recovery
action" — exact `action_key` values (e.g. restore-deleted-account,
reverse-wallet-transaction) need to be enumerated by whoever designs this;
flagging the shape now so it's not built ad hoc later.

---

## Batches complete
This closes out the Admin/Super-Admin side of the "Next batches" list from
`AdminEndpoints.md`. Only remaining item: Merchant portal's ~25 mock
repository methods (store management, KYC review queue, order acceptance,
vouchers, wallet) — see `AdminEndpoints-Batch7.md`.
