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
1. Does RAPEX need a merchant wallet, or does merchant settlement stay outside
   the wallet ledger entirely?
2. Is rider COD remittance in scope for launch, or wallet-only (no cash
   handling) for Alpha?
3. Minimum top-up amount, top-up payment rails (GCash/Maya/QRPH are already
   shown as "Requires configuration" in `CheckoutScreen`'s payment selector —
   do they feed wallet top-up, direct order payment, or both?).
4. Withdrawal rules for riders/merchants (the Engine Center `wallet` engine
   slot already anticipates "withdrawal limits" — no rule exists yet for what
   those limits are).
