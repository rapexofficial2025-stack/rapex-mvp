# Commissions

Business rules for Commissions.

## Status
**Received, not independently verified.** From a 2026-08-04 ChatGPT
business-rules planning session (exported and handed to Claude 2026-08-10) —
not confirmed against live Xano from this environment.

## Price Engine
`Customer Price = Merchant Price + Admin Markup`. Example: ₱100 merchant
price + 20% markup → ₱120 customer price. Calculated entirely by Xano — the
frontend only ever displays the number Xano returns, never computes it
locally. Merchants set their own base price but never the markup or the
customer-facing price; the Marketplace always shows Final Selling Price,
Store Rating, Distance, Store Status — **never** the Merchant Base Price.

## Admin rules
Admin works independently of checkout and may change Markup, Commission,
Delivery Fee, Wallet Adjustments, Categories, and Settings at any time —
**changes affect future orders only, never retroactively.**

## Commission rule
Platform commission is always controlled by Admin's Price Engine — the
merchant never edits it, and the frontend never calculates it.

## Store/Merchant Level rules
Merchant Level controls Branch Unlock, Store Slots, Analytics, Visibility,
and Badges. Level increases via Completed Orders, Ratings, Sales, Verified
Store status, and Profile Completion. See `docs/business/Levels.md` and
`apps/merchant-portal`'s Store Expansion section for the slot-unlock tiers
this ties to.
