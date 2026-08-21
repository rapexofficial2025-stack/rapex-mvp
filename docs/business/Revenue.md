# Revenue

Business rules for Revenue.

## Status
**Received, not independently verified.** The full Revenue/Formula
Engine spec (Commission, Markup, Platform Fees, Store Tiers, priority
rules, audit log) lives in `docs/business/Commissions.md` — the two
topics were pasted as one unified spec by the founder (2026-08-18) and
kept together there rather than duplicated across both files.

## Settlement after delivery (revenue breakdown per order)
After successful delivery, the system calculates and records: product
subtotal, markup amount, customer discount/coupon, delivery fee + any
delivery discount, merchant commission, merchant net settlement, rider
delivery earning, rider incentive/reward, RAPEX platform fee, other
configured adjustments, final customer amount, final settlement status.
See `docs/business/Orders.md` §23 and §28 for the full flow this feeds
into.
