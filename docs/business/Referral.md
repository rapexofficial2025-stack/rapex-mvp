# Referral

Business rules for Referral.

## Status
**DRAFT PROPOSAL — not yet decided.** Sourced from the separate contracted-developer
codebase (`sh3ki/rapex_v3`, `backend/apps/referrals/models.py`), translated into a
Xano-ready shape. Not an approved RAPEX decision — needs Irvin's review during the
actual Xano backend design conversation.

RAPEX's customer app already has a working `EarnScreen` (referral code display +
native Share) that generates a code from the account ID and always shows 0 reward
points, explicitly because no referral/rewards backend rule existed to wire it to
(`apps/customer-app/screens/EarnScreen.tsx`). This draft is meant to give that
screen something real to call once Xano implements it — it does not change the
screen itself.

## Proposed model

### ReferralCode (one per referring owner)
- One code per `(owner_id, owner_role)`. Proposed `owner_role`: `USER`, `RIDER` —
  i.e. both customers and riders can refer people, not just customers.
- Fields: `code` (unique, short alphanumeric — this is what `EarnScreen` already
  generates client-side today as a placeholder), optional `qr_code_url`,
  `total_used` (denormalized count, for quick display).

### ReferralRecord (one per referred person)
Tracks a single invite through its lifecycle:

`INVITED → REGISTERED → QUALIFIED → CREDITED` (or `CAP_REACHED` if the referrer
hit their monthly cap before this one could pay out).

- `INVITED`: link/code shared, nothing happened yet.
- `REGISTERED`: the referred person signed up using the code.
- `QUALIFIED`: the referred person met the payout condition — **needs a
  decision**: is it "first order placed," "account verified," or something
  else? The source repo tracks the state but doesn't hardcode the condition
  in the model, so RAPEX has a free choice here.
- `CREDITED`: points were actually paid to the referrer's rewards balance
  (`points_credited`, `credited_at`).
- `CAP_REACHED`: qualified, but the referrer had already hit their monthly cap
  (see below) — recorded rather than silently dropped, so it can be paid out
  later if the cap is lifted or rolls over.

### ReferralMonthlyTracker (anti-abuse cap)
One row per `(owner_id, owner_role, month_year)` holding `points_credited` for
that calendar month. Purpose: cap how many referral points one person can earn
per month, so the referral loop can't be farmed. **Open question**: what's the
actual cap number, and does RAPEX want this at all for Alpha, or is it a
post-launch abuse-prevention feature to defer?

## How this connects to Rewards
Referral payouts are proposed to land as `points_credited` — i.e. referral is a
*source* of rewards points, not a separate currency. See `Rewards.md` for the
points ledger this would write into. This mirrors the source repo's design
(`ReferralRecord.points_credited` feeds `PointsTransaction`) and avoids RAPEX
needing two parallel point systems.

## Open questions for the Xano design conversation
1. ~~What actually triggers `QUALIFIED`~~ — **Partially answered below**, per role.
2. Referral reward amount per qualified referral, and whether rider referrals
   pay the same rate as customer referrals.
3. Monthly cap value, and whether `CAP_REACHED` referrals ever get paid out
   later or are simply forfeited.
4. Whether referral is in scope for the Sept 1 Alpha launch at all, or a
   fast-follow — `EarnScreen` works either way since it degrades gracefully to
   "0 points" with no backend.

## Update (2026-08-10) — a Partnership/referral program exists, with real numbers, plus a flagged conflict

A 2026-08-04 ChatGPT business-rules planning session (exported and handed to
Claude 2026-08-10) describes a considerably larger **Partnership/Referral
program** than the model drafted above — worth reconciling before either is
built. **Received, not independently verified against live Xano.**

**Qualification trigger per referral type** (answers open question 1, more
precisely than "first order" alone): Customer = after first completed
purchase; Merchant = after verification + first successful order; Rider =
after first delivery; Service Provider = after first paid service; Company =
after verified + first client booking.

**36-Month Lock (a much bigger number than a typical referral bonus):** once
a Partner refers a Merchant, the Partner earns residual commission
(~1%-2%) on every order that merchant completes, for exactly **3 years**, not
a one-time payout. Reported backend function name: `partnerships/track_referral`.

**Annual Renewal (Quota):** Partner must refer ≥1 new merchant per year to
keep commission active; failing that, status moves to `grace_period` then
`inactive`, pausing (not forfeiting) earnings.

**Settlement:** commissions calculated during `accounting/distribute_funds`,
credited to the Partner's wallet immediately on order completion.

**Partner Levels (progression ladder):** Explorer → Ambassador → Partner →
Elite Partner → Diamond Partner → Founder's Circle — higher levels unlock
higher commission %, badges, early feature access, priority support.

**Alpha status — same conflict as `Rewards.md`:** this source lists
"Referral Earnings" among features explicitly **disabled** for Alpha, and
separately says Partnership Commissions specifically are "⏸️ Bypassed —
focus on basic order flow first." That's a much larger, structurally
different feature (a 3-year recurring commission program with its own
Partner role and levels) than what `EarnScreen`'s simple one-time
customer-referral-code UI currently implies. **Flagging for a decision,
not resolving silently**: is the shipped `EarnScreen` referral code meant to
eventually plug into this Partnership program, or is Partnership a separate,
later, bigger initiative with its own onboarding flow? They're not
obviously the same feature at two different sizes.

**Structural note (not yet decided, per the source):** there's a proposal to
merge all of this into a single universal "Earn" tab per role rather than a
separate Partner app — which, if adopted, would actually validate keeping
`EarnScreen` as the long-term home for this, just with more depth added
later rather than being the wrong abstraction.
