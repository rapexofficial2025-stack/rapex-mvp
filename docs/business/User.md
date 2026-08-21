# User

Business rules for Customer/User accounts. See `Authentication.md` for
the shared cross-role auth architecture this plugs into.

## Status
**Received, not independently verified.** Pasted by the founder
2026-08-20 as a GPT-authored reconciliation doc — review only until
confirmed against real Xano.

## Philosophy
Registration should be easy — don't force a normal customer to upload a
government ID just to browse RAPEX. ID/selfie verification is
conditional, only for specific higher-risk actions later, never a
signup blocker.

## Registration flow
1. **Basic Account** — First Name, Last Name, Email, Mobile Number,
   Password, Confirm Password.
2. **Verify** — Email OTP, Mobile OTP.
3. **Basic Profile** — Birthday, Gender, Profile Photo (optional),
   Address (required before ordering, not before signup).

Status chain:
```
REGISTERED → EMAIL VERIFIED → MOBILE VERIFIED → PROFILE COMPLETE →
ACTIVE
```

Later/conditional (not part of initial registration): Government ID,
Selfie, additional identity verification for specific actions.

## Child Accounts
See `apps/customer-app`'s Child Account registration flow — a minor
logs in with parent-created credentials, not a separate public signup.
Ties to the Baon parent→child wallet-funding concept in `Wallet.md`
(Beta-scoped, not Alpha).

## Xano rule (same as everywhere else)
Use one identity/authentication foundation (see `Authentication.md`),
not a separate system for Customer. Use Xano's native `id` internally
and `rapid_code` (`USR-...`) for RAPEX-facing identifiers.
