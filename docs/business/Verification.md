# Verification

General verification pattern shared across roles. Role-specific detail
lives in each role's own doc (`Merchant.md` §11, `Rider.md` §3,
`Authentication.md`'s Admin section).

## Status
**Received, not independently verified.** Extracted from the same
GPT-authored auth-flow reconciliation doc as `Authentication.md` and
`Merchant.md` (2026-08-20) — review only until confirmed against real
Xano.

## Core rule: separate status flags, never one boolean
Don't collapse verification into a single `verified = true`. Admin
needs to know **exactly what passed**, not just an opaque pass/fail.
The pattern, generalized from the Merchant case (`Merchant.md` §11):

- `is_active` (account)
- `email_verified`
- `mobile_verified`
- `identity_verified`
- `business_verified` (Merchant only)
- `store_verified` (Merchant only)
- `payout_verified` (Merchant/Rider)
- an overall computed/summary flag (e.g. `merchant_verified`,
  `rider_verified`) derived from the individual flags, not stored as an
  independently-settable field.

## Review status chain (shared shape across roles)
```
PENDING → UNDER REVIEW → APPROVED
```
or:
```
REJECTED → CORRECTION REQUIRED → RESUBMITTED → UNDER REVIEW
```

## What Admin reviews, per role
- **Merchant**: Identity (email, mobile, ID, selfie), Business
  information, Store (name, category, address, GPS, photos, documents,
  bank/payout info). Full detail: `Merchant.md` §10.
- **Rider**: Identity Verification (ID type/number, ID front/back,
  selfie with ID), vehicle information. Full detail: `Rider.md` §1, §3.
- **Admin** (internal): invitation-based, not a public registration —
  see `Authentication.md`'s Admin section.
- **Customer**: verification is conditional, not required just to
  browse or place a basic order — ID/selfie verification only for
  specific higher-risk actions, never a signup blocker. See `User.md`.

## Why this matters for Alpha
Merchant verification specifically is now a declared Alpha blocker (see
`Authentication.md`) — real store verification/approval by Admin is a
required step in the Sept 1 core loop, not a nice-to-have. This makes
`docs/deployment/production-readiness-audit.md`'s existing "Verification
Queue" UI (already built in `apps/admin-portal/src/features/
verification/`) load-bearing rather than decorative — it needs real
data flowing through it before launch, not just the UI shell.
