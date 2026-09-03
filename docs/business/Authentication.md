# Authentication

Business rules for Authentication — shared architecture across all 4
roles (Customer, Rider, Merchant, Admin), plus role-specific detail
that lives in each role's own doc (`User.md`, `Rider.md`, `Merchant.md`,
`Admin.md`).

## Status
**Received, not independently verified.** Pasted by the founder
2026-08-20 as a GPT-authored reconciliation doc — review only until
confirmed against real Xano. This declares merchant registration/
verification an **Alpha blocker** (see bottom of this doc) — that's a
real scope change, not just documentation.

## Core architecture rule (for Xano)
Don't build a separate authentication system per role. One shared
identity/account foundation, then role-specific profile tables:
```
USER / ACCOUNT
    ├── CUSTOMER PROFILE
    ├── RIDER PROFILE
    ├── MERCHANT PROFILE
    │       └── STORE(S)
    └── ADMIN PROFILE
```
Use the RAPEX public identifier per role (`USR-...`, `RDR-...`,
`MCT-...`, `ADMN-...` — see `docs/database/data-dictionary.md`'s
`rapid_code` rule) while Xano's native `id` stays the internal database
identifier throughout.

## Role comparison

| Role | Basic Auth | ID Verification | Admin Approval |
|---|---|---|---|
| Customer | Required | Conditional (not required just to browse) | No |
| Rider | Required | Required | Required |
| Merchant | Required | Required | Required |
| Admin | Required | Internal verification | Required (invitation-only, never public) |

## Philosophy
Registration should be easy; verification happens according to the role
and what the account actually needs to do. Don't force a normal customer
to upload a government ID just to browse RAPEX — but Rider and Merchant
handle money/goods/customer locations, so they need real KYC before
going active.

## Per-role auth chain (overview — see each role's own doc for full detail)

```
                    RAPEX AUTH
                        │
        ┌───────────────┼────────────────┐
        │               │                │
     CUSTOMER         RIDER           MERCHANT
        │               │                │
   Basic Auth      Basic Auth       Basic Auth
        │               │                │
   OTP Verify      OTP Verify       OTP Verify
        │               │                │
   Profile         Rider KYC       Merchant KYC
        │               │                │
     ACTIVE          ADMIN          STORE
                     REVIEW          REVIEW
                       │                │
                    ACTIVE           ACTIVE
```
Admin is separate and never public:
```
ADMIN
  │
INVITATION
  ↓
BASIC ACCOUNT
  ↓
OTP / VERIFY
  ↓
ADMIN APPROVAL
  ↓
ACTIVE
```

- **Customer** (full detail: `User.md`): Basic Account (name/email/
  mobile/password) → Email+Mobile OTP → Basic Profile (birthday, gender,
  address required before ordering) → Active. ID/selfie verification is
  conditional/later, never a signup blocker.
- **Rider** (full detail: `Rider.md` §1): Basic Account → OTP → Basic
  Info (birthday, address) → Vehicle Info (type, brand/model, plate,
  license, photo) → Identity Verification (ID + selfie with ID) →
  Submit → Admin Review → Approved → Active. Only `APPROVED` + `ACTIVE`
  riders can receive delivery assignments.
- **Merchant** (full detail: `Merchant.md`): the deepest flow — basic
  account → OTP → personal identity → merchant type → main store
  creation → store location → store operations → business documents
  (conditional on merchant type) → payout account → submit → Admin
  review → Store Active.
- **Admin**: never a public "Create Admin Account" button. Created/
  invited by an authorized administrator only. `INVITED → ACCOUNT
  CREATED → EMAIL VERIFIED → MOBILE VERIFIED → ADMIN APPROVED →
  ACTIVE`. Current system needs only `ADMIN` role; `SUPER ADMIN` exists
  as a future role, not activated yet. Security beyond registration
  should eventually include: strong password, OTP/MFA, session
  expiration, device/session tracking, login history, failed-login
  tracking, IP/security logging, role permissions, account suspension,
  audit logs (ties to `error_logs`/`audit_log`/`auth_event_logs` in
  `docs/database/data-dictionary.md`).

## Verification status flags — never one boolean
Every role needs **separate** status flags, not one `verified = true` —
Admin needs to know exactly what passed, not just a single opaque flag.
Example (Merchant, but the pattern applies to every role): `is_active`,
`email_verified`, `mobile_verified`, `identity_verified`,
`business_verified`, `store_verified`, `payout_verified`, and an overall
`merchant_verified` computed/summary flag. See `Verification.md` for the
general pattern and `Merchant.md` §11 for the merchant-specific set.

## Alpha blocker declaration (2026-08-20)
The full merchant loop is now explicitly part of the Sept 1 core loop —
not optional, not deferrable:
```
MERCHANT REGISTRATION → AUTHENTICATION → VERIFICATION → STORE CREATION
→ ADMIN APPROVAL → STORE ACTIVE → PRODUCT UPLOAD → RECEIVE ORDER
```
Rationale: without a real merchant onboarding+approval path, there's no
way for a real store to exist for the `Customer → Product → Checkout →
Merchant → Rider` order flow to actually run end-to-end. This sits
alongside the existing "MUST HAVE for Alpha" list in
`docs/deployment/production-readiness-audit.md`'s scope lock — it makes
"merchant acceptance" concrete rather than an abstract line item.
