# Rewards

Business rules for Rewards.

## Status
**DRAFT PROPOSAL — not yet decided.** Sourced from the separate contracted-developer
codebase (`sh3ki/rapex_v3`, `backend/apps/wallet/models.py` —
`UserLoyaltyPoints`/`PointsTransaction`), translated into a Xano-ready shape. Not an
approved RAPEX decision — needs Irvin's review during the actual Xano backend design
conversation.

The Admin Engine Center already reserves a `rewards` engine slot
("Points, referrals, and conversion rates" —
`apps/admin-portal/src/features/engine-center/engines.ts`), and the customer app's
`EarnScreen` already displays a "rewards points" value (hardcoded to 0 today). This
draft gives both a concrete model to point at; it doesn't change either.

## Proposed model

### UserLoyaltyPoints (one balance per customer)
- `total_points` (current spendable balance, integer).
- `lifetime_earned` (never decreases — for tier/status display, leaderboards,
  etc. if RAPEX wants that later).
- `rollover_balance` (decimal) — the source repo carries this alongside points;
  likely for a peso-equivalent value that didn't convert to a whole point.
  **Open question**: does RAPEX want fractional rollover, or round to whole
  points and drop the remainder (simpler)?

### PointsTransaction (append-only ledger, same pattern as Wallet)
Proposed `transaction_type` enum:

| Type | Meaning |
|---|---|
| `EARNED` | Points awarded (from an order, a referral credit, a promo, etc.) |
| `REDEEMED` | Points converted to something spendable — proposed: wallet balance via `WalletTransaction.POINTS_REDEEMED` (see `Wallet.md`) |
| `ADJUSTED` | Manual admin correction |
| `EXPIRED` | Points removed for aging out, if RAPEX adopts a points-expiry rule |

Each row: `points` (signed), optional `order_id` (what earned it), optional
`note`.

## How points get earned (needs RAPEX-specific decisions)
The source repo's model supports earning points from orders and from referrals
but does not hardcode a rate — that logic lived in application code RAPEX
doesn't have. Concretely still open:
1. **Order-based earn rate**: e.g. "1 point per ₱X spent" — no number decided.
2. **Referral earn rate**: see `Referral.md` — `ReferralRecord.points_credited`
   would write an `EARNED` row here.
3. **Redemption rate**: how many points = ₱1 when redeeming into wallet balance.
4. **Expiry policy**: do points expire at all for Alpha, and if so after how
   long?
5. **Minimum redeemable balance**: is there a floor before a customer can
   redeem, or is any positive balance redeemable?

## Scope note for Sept 1
`EarnScreen` already works with zero backend support (points always show 0, no
error state) — so Rewards can safely be treated as a fast-follow rather than an
Alpha blocker if the above rate decisions aren't ready in time. This doc exists
so that when it is prioritized, the ledger shape is ready to hand to Xano rather
than designed from scratch under launch pressure.
