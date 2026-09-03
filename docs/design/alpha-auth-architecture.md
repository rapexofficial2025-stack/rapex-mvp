# RAPEX Alpha authentication architecture

Status: frontend contract reference. Customer and Rider mobile implementations remain owned by Claude. This document does not claim that the listed Xano endpoints or workflows are live.

## One identity foundation

RAPEX uses one account/authentication foundation with role-specific profile tables:

```text
USER / ACCOUNT
├── CUSTOMER PROFILE
├── RIDER PROFILE
├── MERCHANT PROFILE
│   └── STORE(S)
└── ADMIN PROFILE
```

Xano native IDs remain internal. Public identifiers use role prefixes: `USR-`, `RDR-`, `MCT-`, and `ADMN-`.

## Alpha role rules

| Role | Basic auth | ID verification | Approval |
| --- | --- | --- | --- |
| Customer | Required | Conditional | Not required |
| Rider | Required | Required | Admin approval |
| Merchant | Required | Required | Admin approval |
| Admin | Invitation only | Internal verification | Authorized Admin approval |

Customer government ID must not block browsing. A delivery address is required before ordering. Rider assignment requires both `APPROVED` and `ACTIVE`. Merchant selling requires an approved Merchant identity and active Store. Admin registration is never public.

## Status chains

- Customer: `REGISTERED → EMAIL_VERIFIED → MOBILE_VERIFIED → PROFILE_COMPLETE → ACTIVE`
- Rider: `REGISTERED → EMAIL_VERIFIED → MOBILE_VERIFIED → IDENTITY_SUBMITTED → RIDER_REVIEW → APPROVED → ACTIVE`
- Merchant: `MERCHANT_REGISTERED → EMAIL_VERIFIED → MOBILE_VERIFIED → IDENTITY_SUBMITTED → STORE_CREATED → ADMIN_REVIEW → APPROVED → STORE_ACTIVE`
- Admin: `INVITED → ACCOUNT_CREATED → EMAIL_VERIFIED → MOBILE_VERIFIED → ADMIN_APPROVED → ACTIVE`

These are separate states. Do not collapse email, mobile, identity, business, Store, payout, approval, suspension, and account activity into one `verified` boolean.

## Required Xano contracts

1. Role-aware account creation based on the shared account table.
2. Email OTP request/verify and Mobile OTP request/verify with expiry, attempt limits, throttling, and audit history.
3. Role profile onboarding endpoints with field-level schemas.
4. Signed verification-asset upload endpoints for profile photo, ID front/back, selfie, vehicle, Store logo, and Store cover.
5. Merchant onboarding transaction that creates the Merchant profile and Main Store without enforcing one Merchant = one Store.
6. Conditional verification rules for Merchant documents and activated capabilities.
7. Rider review/approval and assignment eligibility checks.
8. Admin invitation creation, token verification, expiry/revocation, role assignment, OTP, approval, and activation.
9. Session expiry, device/session tracking, failed-login tracking, IP/security logging, suspension, permissions, and audit logs.

Frontend navigation and preview screens must never be accepted as proof of verification, approval, role, or capability. Every protected read and mutation rechecks the authenticated account and permission server-side.
