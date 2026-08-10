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

## Update (2026-08-10) — real earn-rate numbers + a flagged conflict

A 2026-08-04 ChatGPT business-rules planning session (exported and handed to
Claude 2026-08-10) answers question 1 above with real numbers, and separately
raises a genuine conflict worth a decision.

**Order-based earn rate (answers open question 1):** ₱1-₱249 spent = 0
points; every ₱250 block spent = +1 point, with the remainder carried over in
a `pending_pesos`-style column until the next purchase crosses ₱250 again
(e.g. spend ₱400 → 1 point now, ₱150 carries over).

**Loyalty tiers:** Level 1 (Newbie) = standard rates. Level 5+ (Silver) = 5%
discount on delivery fees. Level 10+ (Gold) = 10% discount on delivery fees +
early access to auctions.

**Alpha status — real tension with what's already shipped:** this source
states Loyalty Points/Rewards are explicitly **disabled** as a user-facing
feature during Alpha ("Future rules — explicitly DISABLED during Alpha:
...Rewards, Loyalty Points...", listed alongside Auction and Referral
Earnings) — but also separately notes Loyalty Level Up tracking is "✅ ACTIVE
(background only)" even while disabled, i.e. the backend keeps counting
points, only the UI is meant to stay hidden until Alpha's core order flow is
proven.

**This conflicts with what's already shipped**: the Customer App's bottom
navigation was explicitly specified this session as `HOME | MARKETPLACE |
WISHLIST | ORDERS | EARN` (a direct, explicit instruction), and `EarnScreen`
is live and reachable today. **Flagging rather than silently resolving**:
Irvin, do you want the Earn tab to stay visible for Alpha (it's harmless
today — it only ever shows 0 points, no live backend), or hidden/removed
until Rewards is actually turned on? Either is a one-line nav change once
decided.
