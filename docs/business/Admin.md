# Admin

Business rules for Admin accounts. See `Authentication.md` for the
shared cross-role auth architecture this plugs into.

## Status
**Received, not independently verified.** Pasted by the founder
2026-08-20 as a GPT-authored reconciliation doc — review only until
confirmed against real Xano.

## Core rule: never a public registration
Unlike Customer/Rider/Merchant, Admin account creation is **not**
public. Admin accounts are created/invited by an authorized
administrator only — no "Create Admin Account" button anywhere in the
product.

## Registration flow
1. **Invitation** — an authorized admin invites a new admin.
2. **Basic Admin Form** — First Name, Last Name, Email, Mobile Number,
   Password, Confirm Password, Profile Photo.
3. **Verification** — Email verification, Mobile OTP, admin
   invitation/authorization check, role assignment.

Status chain:
```
INVITED → ACCOUNT CREATED → EMAIL VERIFIED → MOBILE VERIFIED →
ADMIN APPROVED → ACTIVE
```

## Roles
Current system needs only `ADMIN`. `SUPER ADMIN` exists as a future
role — **do not activate the Super Admin system yet.**

## Security (beyond registration)
The registration form is simple; the security behind it is not. Admin
login should eventually support: strong password requirements, OTP/MFA,
session expiration, device/session tracking, login history, failed
login tracking, IP/security logging, role-based permissions, account
suspension, and full audit logs (ties to `error_logs`/`audit_log`/
`auth_event_logs` in `docs/database/data-dictionary.md`).

## Xano rule (same as everywhere else)
Use one identity/authentication foundation (see `Authentication.md`),
not a separate system for Admin. Use Xano's native `id` internally and
`rapid_code` (`ADMN-...`) for RAPEX-facing identifiers.
