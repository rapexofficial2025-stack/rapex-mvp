# Admin Portal — Xano Endpoints Needed (Batch 5: Error Center, Operational Settings)

## Status
Both screens are empty shells (`AdminDataModulePage.tsx`) with no repository
behind them. Read-only for the Error Center (the screen explicitly disables
acknowledge/assign/resolve until an audited contract exists); Operational
Settings is read + write but deliberately scoped away from anything
privileged (no credentials, infrastructure, or destructive tools — see the
screen's own description).

All endpoints require `Authorization: Bearer <token>`, Admin/Super Admin
only.

---

## 1. Error Center

### GET /admin-master-data/errors
Query params (optional): `status` (All incidents | Open | Acknowledged | Resolved), `severity`

Response: array of
```json
{
  "id": "ERR-...",
  "severity": "critical" | "warning" | "info",
  "application": "customer-app" | "rider-app" | "merchant-portal" | "admin-portal" | "xano",
  "module": "...",
  "endpoint": "...",
  "clientRedacted": "user-***4587",
  "occurrences": 12,
  "firstSeenAt": "...",
  "lastSeenAt": "...",
  "status": "open" | "acknowledged" | "resolved"
}
```
`clientRedacted` -- the screen's own column is literally "Client (redacted)",
so whatever PII would normally identify the affected user/session should
already be masked server-side before this response is built, not redacted
client-side.

This screen is explicitly read-only until acknowledge/assign/resolve gets a
confirmed, audited contract -- **do not build mutation endpoints for this
one in this batch.** Read-only `GET` is the only thing being requested here.

---

## 2. Operational Settings

Per the screen's own description, this intentionally excludes privilege
escalation, credentials, infrastructure, and destructive tools -- it only
covers day-to-day marketplace configuration. Four sub-areas, matching the
screen's tabs:

### GET /admin-master-data/settings/categories
### GET /admin-master-data/settings/delivery-types
### GET /admin-master-data/settings/vehicle-types
### GET /admin-master-data/settings/notification-templates
### GET /admin-master-data/settings/vouchers

Each returns an array shaped like:
```json
{ "id": "...", "setting": "...", "module": "...", "currentValue": "...", "status": "active" | "inactive", "updatedBy": "...", "updatedAt": "..." }
```

### PATCH /admin-master-data/settings/{sub_area}/{setting_id}
body: `{ currentValue: string, status?: "active" | "inactive" }`
response: updated record (audited action -- write `updatedBy`/`updatedAt`
server-side from the authenticated session, never trust a client-supplied
actor).

---

## Next batches (not written yet)
- Super Admin (Admin Accounts, Users & Roles, Stores & Merchants, Products &
  Listings, Audit & Recovery, Receipt Design, Secure Exports) -- flagged
  separately as the highest-sensitivity batch; see
  `AdminEndpoints-Batch6.md` for why this one needs the most security review
  before any real wiring happens, not just a contract.
- Merchant portal's remaining ~25 mock methods
