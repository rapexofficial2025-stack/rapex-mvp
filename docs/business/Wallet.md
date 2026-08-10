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

**Payment rules (Alpha vs. Beta):** Alpha = RAPEX Wallet only (matches what's
already built in `CheckoutScreen`). Beta = PayMongo QR, QRPH, GCash, Maya,
Bank.

**Alpha status — Escrow Hold is described as ✅ ACTIVE** ("ensures customer
has funds before merchant starts preparing"), separately from other
wallet-adjacent features (Loyalty, Partnership Commissions) which are
explicitly bypassed/disabled for Alpha — see `docs/business/Rewards.md` and
`docs/business/Referral.md` for that distinction, and the flagged conflict
noted there against what's already shipped in the Customer App's Earn tab.

**Audit rule:** every wallet-adjacent action is logged — Login, Wallet,
Orders, Price Changes, Delivery, Admin Changes.
