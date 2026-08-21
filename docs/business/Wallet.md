# Wallet

Business rules for Wallet.

## Status
**DRAFT PROPOSAL — not yet decided.** Everything below is a starting point extracted
from the separate contracted-developer codebase (`sh3ki/rapex_v3`, Django/DRF,
`backend/apps/wallet/models.py`), translated into a Xano-ready shape. It is **not**
an approved RAPEX decision — Irvin needs to review/edit this during the actual
Xano backend design conversation. Nothing here should be treated as a confirmed
contract until then.

This exists because RAPEX already has a live "RAPEX Wallet" payment path in the
customer app (`CheckoutScreen`, `WalletScreen`) backed by `XanoWalletRepository` /
`XanoFinanceRepository`, and the Admin Engine Center already reserves a `wallet`
engine slot ("Top-up, withdrawal, and transfer limits" —
`apps/admin-portal/src/features/engine-center/engines.ts`). Those exist today with
no written rule spec behind them; this draft is meant to close that gap, not to
introduce a new feature.

## Proposed model

### Wallet (one per owner)
- One wallet per `(owner_id, owner_type)` pair.
- Proposed `owner_type` enum: `USER` (customer), `RIDER`, `MERCHANT`.
  - The source repo only had `USER` and `RIDER` — RAPEX's merchant payout flow
    (Engine Center → `finance` engine, "Platform fees and commission earnings")
    implies merchants need a wallet too. **Open question for Irvin**: does the
    merchant side settle through the same wallet primitive, or a separate ledger?
- Fields: `balance` (decimal, never negative — enforced by the transaction rule
  below, not by a DB constraint alone).

### WalletTransaction (append-only ledger, one row per movement)
Every balance change is a row here, never a direct `balance` update. `balance`
on the wallet is a cached total; `balance_after` on each transaction is the
running total at that point, so the ledger is independently reconcilable.

Proposed `transaction_type` enum (carried over as-is from the source repo — these
map cleanly onto flows RAPEX already has or has planned):

| Type | Direction | When |
|---|---|---|
| `TOP_UP` | credit | User adds funds to wallet |
| `INITIAL_LOAD` | credit | First-load / signup bonus, if any |
| `PAYMENT_TO_MERCHANT` | debit (customer) | Order placed and paid from wallet |
| `DELIVERY_FEE_EARNED` | credit (rider) | Rider completes a delivery |
| `COMMISSION_DEDUCTED` | debit (merchant) | Platform commission on a sale |
| `REMITTANCE_DEDUCTED` | debit (rider) | Rider's periodic COD remittance owed to platform |
| `PENALTY` | debit | Admin-applied penalty |
| `INCENTIVE` | credit | Admin-applied bonus/incentive |
| `REFUND` | credit | Order refund |
| `POINTS_REDEEMED` | debit | Rewards points converted to wallet balance |
| `ADJUSTMENT` | either | Manual admin correction |

Every row should carry: `amount` (signed), `balance_after`, optional `order_id`
(links back to the order that caused it), optional `reference_number`, optional
`note`, and `performed_by` (`SYSTEM` / `ADMIN` / `SUPERADMIN` + id) for audit
trail — this is what the Admin Order & Financials screens
(`apps/admin-portal/src/features/order-financials`) currently show as
"Mock data — backend endpoint required."

### RiderRemittanceRecord (rider COD remittance cycle)
Only relevant if riders handle cash-on-delivery on RAPEX's behalf — needs
confirmation this applies to RAPEX's Alpha delivery model at all. If it does:
one row per `(rider, period_start, period_end)` with `amount_owed`,
`amount_paid`, `due_date`, and a status lifecycle
`CURRENT → DUE_SOON → OVERDUE → PAID` (or `WAIVED`). This is the data source
the Engine Center's rider-remittance view would need if/when it's built.

## Open questions for the Xano design conversation
1. ~~Does RAPEX need a merchant wallet~~ — **Resolved, see update below**: yes.
2. Is rider COD remittance in scope for launch, or wallet-only (no cash
   handling) for Alpha?
3. Minimum top-up amount, top-up payment rails (GCash/Maya/QRPH are already
   shown as "Requires configuration" in `CheckoutScreen`'s payment selector —
   do they feed wallet top-up, direct order payment, or both?).
4. Withdrawal rules for riders/merchants (the Engine Center `wallet` engine
   slot already anticipates "withdrawal limits" — no rule exists yet for what
   those limits are).

## Update (2026-08-10) — reconciled against a more authoritative source

A 2026-08-04 ChatGPT business-rules planning session (exported and handed to
Claude 2026-08-10) gives a more specific wallet structure than the draft
above, tied directly to the Alpha order/escrow flow. **Received, not
independently verified against live Xano** — but more authoritative than the
draft above since it's tied to the confirmed "Xano is the only backend" Alpha
rule set, not sourced from the abandoned developer's codebase. Treat this
section as superseding the draft above wherever they conflict.

**Wallet structure per role** (answers open question 1 — merchants do get a
wallet):
- **Customer Wallet:** `Balance`, `Reserved`, `Spendable`.
- **Merchant Wallet:** `Available`, `Pending`, `Total Earnings`.
- **Rider Wallet:** `Available`, `Total Earnings`.

**Escrow flow** (see `docs/business/Delivery.md` for the full order-status
tie-in): Customer checks out → **Wallet Reserved** → Merchant prepares →
Rider delivers → Completed → **Escrow Released** → Merchant Paid → Rider Paid
→ Platform Ledger Updated. This is the same "reserve on checkout, release on
completion" pattern `RiderRemittanceRecord`'s ledger-based design above
already anticipated, now confirmed as the actual Alpha mechanism.

**Payment rules (Alpha vs. Beta):** Originally locked as Alpha = RAPEX Wallet
only, Beta = PayMongo QR/QRPH/GCash/Maya/Bank. **Updated 2026-08-21, founder
decision:** GCash and QR Ph move into Alpha now that founder-provided
PayMongo test keys exist -- see `docs/business/PayMongoIntegration.md` for
the real scope of what's actually wired (client-side checkout UX + an
honest in-app simulator) versus what still needs a Xano developer (the
server-side endpoint that actually calls PayMongo, since that requires the
account's secret key, which cannot live in any of these apps). Maya and
Bank remain Beta -- no keys/integration exist for either. RAPEX Wallet
stays the default and only fully-real payment method until that Xano piece
ships.

**Alpha status — Escrow Hold is described as ✅ ACTIVE** ("ensures customer
has funds before merchant starts preparing"), separately from other
wallet-adjacent features (Loyalty, Partnership Commissions) which are
explicitly bypassed/disabled for Alpha — see `docs/business/Rewards.md` and
`docs/business/Referral.md` for that distinction, and the flagged conflict
noted there against what's already shipped in the Customer App's Earn tab.

**Audit rule:** every wallet-adjacent action is logged — Login, Wallet,
Orders, Price Changes, Delivery, Admin Changes.

## Update (2026-08-19) — "Baon" parent→child wallet funding (reported, not verified)

Self-reported by whoever is building Xano, as part of a "Backend Brain
Feature Complete" progress report — **not independently verified from
this environment**, and this is the *first* time this concept has
appeared in any RAPEX doc, so treat it as new information to confirm,
not an established rule yet.

**Claimed mechanism:** a Parent user's wallet can fund a Child account
(ties to the existing `role: CHILD` / Child Accounts feature — see
`apps/customer-app`'s Child Account registration flow). At checkout, if
the purchasing account's role is `CHILD`, the system is claimed to:
1. Detect role `CHILD`.
2. Validate against `child_baon_allocations` (a claimed new
   table/concept — not in `docs/database/data-dictionary.md`'s 66-table
   list, needs to be added there once confirmed).
3. Deduct the purchase amount from the **Parent's** wallet automatically,
   not the child's own balance.

**What's still needed before this is treated as real:**
- Exact `child_baon_allocations` schema (fields, limits — e.g. is there
  a daily/per-order cap the parent sets?).
- Whether this is a hard requirement for Alpha launch or a Beta-stage
  feature — not stated in the report.
- How this interacts with the existing Wallet structure above (does the
  Child get a `Reserved`/`Spendable` split too, or does the Parent's
  wallet absorb the escrow-reserve step directly on the child's behalf?).
- Confirmation this doesn't conflict with `docs/business/User.md`'s
  existing Child Account rules (a minor logs in with parent-created
  credentials — this Baon claim adds a *funding* layer on top of that,
  which is a reasonable extension but needs the same "not independently
  verified" caveat as everything else in this update).

### Scope decision (2026-08-20, via GPT reconciliation)
**Baon is Beta, not an Alpha requirement.** Backend foundation is
reportedly present (`green`), but not part of the previously established
core Alpha order flow. Do not build/wire Baon into any app for the
Sept 1 target. For Beta, the proposed (not yet finalized) default
direction: parent pre-authorizes a spending budget → child can spend
within that budget → parent can view transaction history. The exact caps
(per-order/daily/weekly/monthly, approval-per-purchase vs. pre-authorized
budget, spending categories, allocation expiry) are explicitly **not**
decided yet — do not invent these when Beta work starts, get them
confirmed first.

## Update (2026-08-19) — Xano "MVP Feature Complete" report (reported, not verified)

A report titled "FINAL MVP PROGRESS REPORT (Ready for Launch)" claims the
full backend — order lifecycle, formula/commission engine, wallet/escrow,
identity/auth, logistics — is implemented in XanoScript, with a specific
"Integration Map" of endpoints marked READY (`GET /rapex-auth/auth/me`,
`GET /super_app/locations/regions`, `GET /rapex-core/community-master`,
`POST /super_app/checkout`, `PATCH /rapex-orders/order/status`,
`POST /rapex-auth/submit-kyc`). **Received, not independently verified**
— same discipline as every other received-doc update in this file.
Notably:
- Does **not** explicitly confirm the `22P02` signup/seed error (see
  `docs/deployment/README.md`) is actually fixed — needs an explicit
  answer, not assumed from silence.
- States background workers (late-delivery ₱5/20-min reduction, Food
  cart 3h/5h expiration) need a **Xano plan upgrade** before they
  actually run — so these are implemented but not yet *active*.
- Firebase Cloud Messaging push notifications are not yet wired
  (`user_devices` table exists, integration doesn't).
- Endpoint *paths* being marked READY is a real step forward from
  "nothing exists," but per `docs/api/README.md`'s existing "Still
  needed" list, real (non-Mock) repository code still requires the
  actual field-level request/response JSON schemas per endpoint, which
  this report does not include. See that doc for exactly what's needed
  before Claude can write real integration code against these.
