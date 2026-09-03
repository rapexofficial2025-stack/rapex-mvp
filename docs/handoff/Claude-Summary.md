# RAPEX — Claude Handoff Summary

Written at the point of pivot from this repo (rapex-mvp, Xano-based) to the
new path (`D:\JED\RAPEX_MVP`, Django + Next.js + Expo). This captures the
project rules, business logic, and domain knowledge accumulated here so
none of it needs to be rediscovered or reverse-engineered from code in the
new stack. It complements, not replaces, `docs/handoff/WebCodex-Summary.md`
and `docs/handoff/RNCodex-Summary.md` (screen-by-screen UI inventories) —
this one is rules and logic.

Section 8 was built incrementally across a complete Xano business-logic
deep-dive (2026-08-26) — the founder's own closing message called it "the
complete RAPEX logic map... every button in the app is governed by one of
these rules." It covers every domain: Merchant (incl. exact tiered-
commission numbers), Admin/Super Admin/God Mode, Partnership, Gamification,
Wallet/Accounting/Ledger, KYC, Auctions, Child/Baon, Rider dispatch,
Freelance/Service Provider, Google Maps/Geofencing, Referrals, Community/
Messaging, Marketing, the multi-store Cart/Checkout split architecture,
Pre-Loved/Variants, Ratings, System Health/Maintenance Mode, Agriculture/
Hardware dispatch constraints, the full 14-state Order Flow, and the four
vertical-specific purchase flows (Wet Market, No-POS, Carenderia,
Wholesale). Treat section 8 as the single most authoritative part of this
document; sections 3-6 above it were written earlier from frontend-side
inference and are superseded wherever the two disagree — this includes
the 14-state Order Flow explicitly superseding two earlier, narrower
state lists mentioned elsewhere in section 8 itself (see that
subsection's own reconciliation note).

**Section 9** adds the founder's own approved Child/Baon specification —
a higher-authority source than section 8 for that feature specifically
(see section 9's own note). **Section 10** adds a dedicated Rider App doc
with more precise delivery-fee/ETA math, and flags a real unresolved
conflict on proximity-unlock distance (150m vs. 500m vs. 50m — do not
implement any of these until confirmed) plus a dispatch-architecture
question (Merchant vs. Global Checkout) that needs reconciling with
section 8's child-order model, not silently merged. **Section 11**
closes out the remaining infrastructure/governance rules the source
itself called "100% of the logic currently existing in the RAPEX Xano
Workspace" — Error/Bug tracking, Inventory/Price history, Hub-to-Hub
logistics manifests, Session/Device governance, typed Messaging, and
PSGC-based location data.

Two open discrepancies remain flagged inline rather than silently
resolved: review XP (10 vs. 50 — section 11's later confirmations lean
toward 10, but this isn't fully closed), and the Bulk Upload
partial-vs-all-or-nothing conflict noted in section 11 (this document's
own earlier Merchant spec assumed partial import; section 11 confirms
all-or-nothing is correct — use all-or-nothing).

**This document is the designated "Fault Sync" correction reference** —
the source's own words: if any AI tool (including future Claude sessions)
proposes something that contradicts what's written here (a direct wallet
edit without a ledger entry, skipping an order-flow state, etc.), that
proposal is wrong and should be corrected against this document, not the
other way around.

Nothing here is Xano-specific in substance. Exact endpoint paths (`/rapex-market/products` etc.)
are dropped as noise; the request/response *shapes* and the *business rules
behind them* are kept, since those need to be re-implemented as real Django
serializers/views regardless of backend.

---

## 1. Non-negotiable project discipline

These held for the entire build and should hold in the new codebase too:

1. **Never fake a working feature.** Every screen with no confirmed backend
   shows an honest "placeholder data" / "not built yet" state — never
   silently pretend something is live. (Jed's own `instructions.md` already
   enforces an equivalent rule — this isn't new to his stack, just
   consistent with it.)
2. **Frontend visibility is never authorization.** A button rendering
   doesn't mean the action is allowed — the backend rechecks every
   permission on every call, not just at page load.
3. **Privileged/destructive actions need a real audited trail** — actor,
   target, old value, new value, reason, timestamp — never a silent status
   flip. This applies to: account status changes, merchant/rider
   suspension, engine-tier changes, wallet remittance approval, Super Admin
   actions.
4. **Never calculate money on the frontend.** Totals, commissions,
   markups, delivery fees — always trust the backend's computed number,
   never re-derive it client-side. This was a hard rule on the old Xano
   contract and matters even more with Django since a real payment
   pipeline sits behind it.
5. **Secrets never touch the frontend or git history.** OAuth client
   secrets, payment-provider secret keys, DB credentials — server-side env
   vars only. Non-secret config (OAuth client IDs, Maps API keys — the kind
   protected by domain/referrer restriction, not secrecy) is fine to
   commit.
6. **Don't guess an unconfirmed contract.** If a field name, response
   shape, or business rule isn't confirmed, say so and stop rather than
   inventing plausible-looking behavior.

---

## 2. Role model

Five roles, matching what Jed's own architecture already defines — no
mismatch here: **Admin, Merchant, Rider, Customer/User, Super Admin**
(Super Admin as an elevated Admin capability, not a fully separate account
type).

**Update — this gap is now resolved, confirmed from Xano**: Services/
Freelance is NOT a sixth role. A Freelancer is a **Customer account with
its `role` field upgraded from `CUSTOMER` to `FREELANCER`**, reached via
the Buyer/Customer app's Profile → "Become Freelancer" flow — not a
separate portal or app. (This project's standalone `provider-portal` app
was therefore a structural mismatch with the real backend model and
shouldn't be ported as its own app in the new stack — fold this into the
Customer/User surface instead.) See the Freelance subsection below for the
full rule set. **Auction and Partnership are still worth clarifying
separately** — Partnership is confirmed as its own distinct business role
(see below), but Auction's role model isn't confirmed either way yet.

---

## 3. Admin — business logic by domain

**User Management**: list + search/filter by role; account status changes
(Active / Pending review / Restricted) must be an *audited* action with a
required reason — this was deliberately left unimplemented on a
placeholder screen rather than built as a silent toggle, specifically
because no audited-action contract existed yet. Same discipline applies to
Merchant/Rider suspend-reinstate.

**Merchant approval pipeline**: merchant applies → Admin reviews → approve/
reject with audit trail → merchant can create one store per vertical/
category → each store separately moderated → products need review before
public availability. (This exact shape already matches Jed's own documented
approval-gated model almost field-for-field — good sign the business logic
transfers cleanly.)

**Verification queue**: KYC review for Merchant/Rider/Service-provider
applicants — documents list (valid ID, selfie-with-ID, business permits),
approve/reject with optional reason.

**Order Financials / Delivery Fee Engine**: every settled order has a
breakdown — distance, delivery fee, what the customer paid, what the
merchant receives, what the platform keeps as commission, what the rider
earns. This settlement should be one atomic transaction, computed
server-side, never assembled from multiple client calls.

**Engine Center**: versioned commission/markup tiers per "engine" (delivery,
pricing, promotions, finance, membership, rewards, wallet, coverage,
verification, orders, notifications, maps, developer) — tiers have
`fromAmount`/`toAmount` ranges, `commissionRatePercent`/`markupRatePercent`,
an `active` flag, and every create/update/delete auto-appends a
human-readable audit-log entry ("Updated Tier 1 commission from 8% to
10%"). Access to the Engine Center itself is grant-based (a list of which
admins can touch it).

**Dashboard**: revenue/orders-today with day-over-day percent deltas,
7-day revenue trend, revenue breakdown by recipient (merchants/riders/
platform-fee), recent orders feed, system status per integration
(Xano/API, Firebase, Maps, Payments, Push — each independently
"operational"/"unverified"), membership-expiration warnings.

**Super Admin / "God Mode"**: deliberately locked behind a step-up
verification the frontend never performs itself — a security key is
checked server-side, returns a short-lived elevation token with an
explicit allowed-actions list and expiry, and every privileged action
independently rechecks that elevation server-side (never trusts that the
UI showing the button means it's allowed). Modules: Admin Accounts (invite/
suspend/permission-edit other admins), Users & Roles, Stores & Merchants,
Products & Listings, Formula Engines (versioned activate/retire + a
server-side calculation test endpoint that never actually charges
anything), Audit & Recovery (one central audit feed every privileged action
across the whole platform writes to — not per-feature audit tables),
Secure Exports (async job, never a synchronous raw data dump, since it can
touch PII), Receipt Design. **This is the single highest-risk area of the
whole platform — recommend a dedicated security review pass before
building real elevation logic in the new stack, not just porting the UI
shell.**

**Live Map / Operations Command Center**: real-time-styled view of
riders/merchants as map markers, color-coded by role, click-to-detail
(name, phone, current location, wallet, license/plate for riders, logo/
revenue for merchants), filterable by municipality/barangay/category/
online-status/highest-transaction. Positions need a real live-location feed
(rider GPS pings, merchant fixed location) — this was mock-data-only the
entire time since no live location endpoint existed.

**Registration Monitor / Age Engine**: read-only visibility into onboarding
progress and the age-verification check result (birth-year based, with a
lockout state on repeated failure) — not a new decision engine, just
observability into a check that already runs at signup time.

**Locations (regions/provinces/municipalities/barangays)**: this was the
single highest-priority backend gap identified — registration for every
role needs a real Philippine address hierarchy lookup, and nothing had it
confirmed. Worth prioritizing early in the new stack too, since it's a
foundational dependency for Address/KYC/Store-location everywhere.

---

## 4. Merchant — business logic

**Onboarding**: KYC (gov ID, selfie, mobile/email OTP verification) →
business category → business nature → store details (name, hours,
delivery/pickup availability, address+lat/lng) → business documents
(structure-dependent: DTI/SEC, BIR, mayor's permit, VAT status) → store
appearance (logo, cover photo, gallery) → staged draft products created
once the store exists. This should be one atomic "complete onboarding"
transaction once all steps are done, not create-as-you-go across separate
calls — this project's *newest* onboarding endpoint had moved toward that
atomic pattern for exactly that reason.

**Store slots**: gamified unlock system — a merchant starts with fewer
store slots and unlocks more by leveling up (tied to a `level`/`xp`/
`xpForNextLevel` progression on the merchant account).

**Products**: belong to exactly one store, have variants (mutually
exclusive, e.g. "Family Pack" vs "Solo") separate from add-ons (any-number-
selected, e.g. "Extra Egg"). Bulk CSV import supported (name/price/
category/stock columns). The "Add Product" screen was deliberately built
single-task with a "keep for next product" field-lock pattern for batch-
adding, per an explicit founder spec: most merchants are non-technical,
phone-only vendors — "GCash-style" one-action-per-screen clarity mattered
more than a feature-dense form.

**Orders**: accept/reject only your own store's orders; order-financials
view mirrors Admin's settlement breakdown scoped to one store.

**Vouchers**: percent / fixed / free-delivery discount types, usage limits,
min-order thresholds, expiry — merchant-created, store-scoped.

**Nearby Riders / Store Insights / Timeline**: dashboard widgets — nearby
available riders with distance/rating, revenue/order/completion-rate
analytics with a 7-day trend and top products, and a chronological
activity feed (order/store/product/system events).

---

## 5. Customer/User — business logic

**Marketplace**: categories → stores (rating, open/closed, distance,
delivery-time estimate — these need the customer's location as input) →
products (with variants/add-ons as above) → search.

**Cart/Checkout**: pricing simulation must be a real server computation
(subtotal + delivery fee + platform fee = total) that the frontend only
displays, never recalculates. One open design question carried over: is
cart meant to be server-persisted, or is "client holds the array, only
sends it at checkout" the intended MVP shape? Worth deciding explicitly in
the new stack rather than defaulting either way.

**Orders**: standard status lifecycle (pending → accepted → preparing →
ready → delivering → completed / cancelled).

**Child Accounts / "Baon"**: a parent-controlled sub-account spending-
allowance feature — parent creates child accounts, allocates a budget
("baon") per child, child spends against it, parent can see purchase
history and an "unallocated balance" (parent's wallet minus every active
child's remaining budget). This was never discussed with the backend at
all — treat as a real but lower-priority feature, not core MVP-blocking.

**Free first-order delivery**: first order gets free delivery above a
₱150 minimum — a specific, already-decided promotional rule worth
preserving exactly.

---

## 6. Rider — business logic (the least-backed area of the whole project — treat as needing full backend build, not just porting)

**Availability**: `online`/`offline`/`busy`, independent of KYC
verification status (a suspended rider can still be technically "offline")
and independent of an "eligible for assignment" check, which the backend
must compute server-side from: verified + location-permission-on +
wallet-active + not-suspended + online. Never let the frontend combine
these fields itself into an eligibility decision.

**Wallet — two-bucket model**: `Operational` (rider tops this up
themselves, used for app-side costs) and `Income` (delivery earnings
accumulate here, rider withdraws/remits out). Every transaction is typed:
top-up, deduction, delivery-income, adjustment, penalty, remittance, with a
credit/debit direction. Confirm in the new backend whether this is the same
concept as this project's confirmed `wallet_type` enum
(`STANDARD`/`RIDER`/`MERCHANT`/`ESCROW`) split differently, or a genuinely
separate model.

**Auto Pick**: a toggle for automatically accepting nearby eligible orders
without the manual 20-second accept/reject countdown — needs to be
designed so it doesn't conflict with the manual offer-card flow when off.

**Dispatch / delivery assignment**: an offer has an expiry and a
`secondsToRespond` countdown (this project used 20s); rejecting or letting
it expire hands the offer to the next-nearest rider — this reassignment
logic must be entirely server-side, never client-orchestrated. Delivery has
a granular state machine (waiting → assigned → accepted →
going-to-merchant → arrived-merchant → picked-up → on-the-way →
arrived-customer → delivered → completed, plus cancelled/failed-
delivery/returned branches).

**150m Security Rule**: a documented (though never independently verified
live) rule where the customer's exact address/contact info is withheld
from the rider until the rider is within 150 meters of the merchant
pickup point — the backend omits the customer fields entirely when locked
(not a frontend hide). Worth confirming this rule still applies and
re-implementing it as a real server-side distance check, not a frontend
conditional.

**Proof of delivery settlement**: submitting delivery proof is meant to be
one atomic transaction that marks the order delivered, deducts the
customer wallet, credits merchant + rider, records platform revenue, and
advances the order to completed — all in one server-side operation, not
several client-orchestrated calls.

**Gamification**: rider level (tied to lifetime delivery count, e.g. "LV 8
· 361 deliveries"), a weekly incentive engine (target delivery count →
reward amount, achieved/paid-out flags), and a referral system (referral
code, QR code, invited/approved counts, monthly points cap, history feed).

**Route/fee calculation**: road-distance calculation should proxy Google
Maps Directions API server-side (API key never reaches the client), and
delivery-fee quoting should read from the same tiered formula source
Admin's Engine Center configures — not a separately-implemented copy.

**Category/opportunities tab**: Auction, Partnership, Services & Freelance,
Rewards surfaced as rider-facing side-opportunities beyond delivery — ties
back to the Services/Provider role-model gap noted in section 2.

---

## 7. Design system notes (for whoever owns the new frontend's visual language)

- Distinct marker colors per role on any map view (this project used
  green=customer, purple=merchant, orange=rider — arbitrary but consistent,
  worth just picking any consistent palette early rather than per-screen).
- Dark-map-theme was a specific, explicit founder ask for the Admin Live
  Map ("Grab/Uber-style ops dashboard" feel) — independent of the app's
  own light/dark theme toggle.
- Merchant's onboarding/product screens were explicitly built for
  low-literacy, phone-only small vendors — favor single-action screens and
  large touch targets over dense multi-field forms.
- Every placeholder/unbuilt screen showed an honest status badge rather
  than an empty blank — worth carrying that convention forward so nothing
  in the new codebase silently looks broken vs. intentionally-not-built-yet.

---

## 8. Confirmed business rules, verbatim from Xano (2026-08-26 — most authoritative source)

Everything below was retrieved directly from the actual Xano backend logic
(not inferred from frontend types like sections 3-6 above) — treat this as
the ground truth wherever it's more specific than something stated earlier
in this document.

### Merchant

- **One Pillar Rule**: a merchant owns at most one store per category
  pillar (one Food store, one Marketplace store, etc.) — stricter than
  "at most one per vertical" phrasing used elsewhere; confirm these are the
  same constraint before implementing.
- Products/variants belong to Stores, not directly to the Merchant —
  deleting a store cascades to its inventory.
- Stores and products are created hidden/inactive; visible to customers
  only after Super Admin approval.
- Onboarding state machine: `Signup → OTP/Email Verify → Merchant Profile
  → Main Store Creation → Store Location & Ops → Business Document Upload
  → Payout Setup`.
- **The 10-Second Rule — mobile (React Native) only, not Web**: after
  verification, a mandatory 10-second "Welcome Animation" with a countdown
  plays before the dashboard is reachable — no skip. Confirmed
  founder-corrected scope: this does not apply to the Merchant/Admin web
  portals, only the React Native apps. Also confirmed: the animation asset
  is an **MP4 video file**, not a Lottie/CSS/sprite animation — only ever
  produced for React Native, never for Web.
- A merchant cannot receive orders or list products until `kyc_status =
  verified`, admin-set.
- Order status control is merchant-exclusive through `merchant_accepted →
  preparing → ready_for_pickup`; unaccepted orders past a system window
  may auto-cancel or flag.
- **150m Security applies in both directions**: merchant cannot see rider
  personal details until the rider is within 150m for pickup (this
  document's earlier sections only had the reverse direction — rider
  can't see customer until near merchant. Confirm whether it's genuinely
  bidirectional or these are two separate rule instances).
- **Split Engine**: merchant receives `productPrice - commission`, split
  triggers atomically only at `completed` status — never partial/early.
- **Escrow**: funds sit in a platform wallet hold from checkout until
  final delivery, not released early.
- Performance tiers: commission rate can drop at higher sales volume
  (matches this doc's Engine Center description in section 3).
- Low-stock reminders respect a **Silent Window**: no notifications
  10PM–8AM.
- Bulk CSV upload validates category IDs and variant pricing before
  insertion, not after.

### Admin / Super Admin

- **God Mode override logic**: force-change any order status, impersonate
  users for troubleshooting, manually adjust any wallet balance. **This is
  the highest-risk capability on the entire platform — user impersonation
  and direct wallet mutation need a dedicated security design pass (auth
  scoping, mandatory audit capture, probably a break-glass approval flow)
  before being built for real, not a straight port of "it exists."**
- Automated penalty triggers: "Impossible Travel" (logins from
  geographically distant locations too fast) and "OTP Abuse" both able to
  auto-set an account to `locked`.
- **Randomized Inactivity Checks**: not a fixed idle timeout — the system
  counts "Inactivity Events" and force-logs-out after a threshold. (This
  project's own Admin idle-timeout feature used a fixed timer — this is a
  materially different, more sophisticated mechanism worth implementing
  as specified, not simplified back to a fixed timer.)
- **Formula Engine defaults** (the actual numbers, not placeholders):
  Markup Rate 20%, Platform Commission 10%, Logistics base fare ₱50 +
  ₱10/km. These are the real defaults to seed the Engine Rules tiers with.
- **Feature flags**: admin-controlled kill switches per module (e.g.
  disable Auctions or Wholesale platform-wide instantly).
- Verification loop covers: Rider licenses + vehicle photos, Merchant
  business permits, Store operating hours.
- Merchant-proposed vouchers only go live after Admin approves the
  discount value and usage limits — vouchers are never merchant-unilateral.
- Admin can manually assign a rider when auto-dispatch fails to find one
  within the service radius.
- Every admin mutation (status change, wallet adjustment, user edit) is
  audit-logged with `actor_user_id` **and a `risk_level`** — the risk
  scoring is a specific field to carry into the new audit model, not just
  a generic audit row.
- **REX Admin Copilot**: a read-only AI assistant for KPI summaries, audit
  log search, and system health checks — explicitly barred from
  performing any mutation. Worth remembering as a real planned feature,
  not scope creep, if an AI assistant surfaces in the new Admin UI later.
- **Alpha testing tools**: a "Global Seed" resets the workspace to a known
  state with pre-verified Founder/Test-Merchant/Test-Rider accounts, and
  Admins can mock rider GPS movement to test geofencing and the 150m rule
  without a real device.

### ID format convention (per role) — built on real PSGC codes, one detail still unclear

Confirmed format: `USR-<GeoCode>-<SerialNumber>` (e.g. `USR-72726-000001`
/ the Partnership section's shorthand example `USR-72726-001`) — a
branded, human-readable display ID separate from the internal DB primary
key, used for display/receipts/support/referral-link identification only,
never for joins.

**Merchant prefix confirmed**: `MCT-` (e.g. `MCT-72726-001`) — supersedes
the earlier unconfirmed `MID-` guess taken from mock data elsewhere in
this project.

**The geo segment is a real PSGC (Philippine Standard Geographic Code)**,
not an arbitrary internal number — all location master data (regions,
provinces, etc.) follows the actual PSGC standard. **One thing genuinely
unclear**: an example given separately ("regional IDs, e.g. 15 for ARMM,
used as the middle segment — `USR-15-...`") shows a *region-level* code
alone, while the confirmed `USR-72726-...` example looks like a more
granular municipality-level PSGC code (PSGC codes are hierarchical —
a single numeric code's leading digits already encode the region). These
may not actually conflict — PSGC codes are naturally hierarchical, so
`72726` could just be doing double duty as "the region, more precisely
specified" — but confirm the real intended granularity (region-only vs.
full municipality-level PSGC) before hardcoding either assumption into
the new backend's ID-generation logic.

**Rider/Admin/Super Admin prefixes still unconfirmed** — mock data
elsewhere in this project used `RIDER-1`-style placeholders; treat as
unconfirmed until Xano verifies the real prefix per remaining role.

### Registration progress — exact percentage breakdown (new)

`registration_progress` moves through fixed checkpoints, not an arbitrary
percentage: **20% (registration started) → 40% (basic info) → 60%
(address) → 80% (KYC upload) → 100% (OTP verified)**. Even at 100%, the
`next_step` still locks to `WelcomeIntro` until `welcome_seen` flips true
(per the earlier-confirmed onboarding state-machine detail) — 100%
registration progress and "fully onboarded" are two different gates, not
one.

### Merchant — technical enforcement detail (exact endpoints, not just rules)

- **Pillar Rule**: enforced at `POST /super_app/stores/create` via a
  `db.query` check for an existing `stores` row with the same
  `merchant_id` + `category` — rejects with "You already have a store in
  this category."
- **Approval Gate**: new stores/products default to `is_active: false` /
  `status: "pending"`; `GET /rapex-market/products` and `GET
  /rapex-market/nearby-stores` both hard-filter `status == "active"` — so
  the gate is enforced on the *read* side, not just at creation.
- **Onboarding state machine**: driven by `GET /rapex-auth/auth/me` +
  `function: util/get_auth_next_step`. `registration_progress` (int) plus
  a separate `welcome_seen` (bool) — even at 100% progress, `next_step`
  stays hard-locked to `WelcomeIntro` until `welcome_seen` flips true. This
  confirms the RN welcome animation is a real gating step in the auth flow,
  not just a cosmetic screen.
- **Split Engine, exact mechanics**: `function: accounting/distribute_funds`,
  triggered on `delivered_completed`, one atomic DB transaction: release
  escrow (deduct `held_amount` from customer) → merchant payout (`product
  price - commission`) → rider earning (`delivery_fee`) → admin ledger
  (`commission` + `platform_fee`). Full rollback on any partial failure —
  no partial payouts possible by design.
- **150m Rule, exact mechanics**: `GET /super_app/orders/delivery_details`
  computes rider-to-store distance server-side; beyond 150m,
  `customer_name`/`phone`/`precise_address` come back `null`/`HIDDEN` in
  the response itself — never a frontend-side hide of fields the API
  already sent.

### Partnership Program (V2.0) — entirely new, not previously documented anywhere in this project

A referral/reseller tier: users pay to become a "Partner" who earns
commission for bringing merchants onto the platform.

- **Entry**: `POST /super_app/partnerships/subscribe` — ₱500/year,
  checked against the user's wallet balance. Creates a `partnerships` row,
  `status: active`, `expires_at` = now + 365 days.
- **Quota**: partners must refer a set number of active merchants/year
  (`annual_quota_target`, admin-managed). Missing the quota by
  `expires_at` triggers a grace period, then either `is_reduced_rate:
  true` (commission cut) or the partnership is purged.
- **Referral counting**: tracked via the partner's `user_code`; a referral
  only counts once the referred merchant completes KYC *and* their main
  store is approved — not at signup. Enforced in `function:
  partnerships/track_referral`.
- **Commission**: percentage of every transaction by referred merchants,
  credited atomically during the same `accounting/distribute_funds` phase
  as the main order split. Tiered — more referrals unlocks a higher
  `commission_rate` (stored in `commission_tiers`).
- **Lifecycle automation**: `function: partnerships/check_annual_status`
  runs on a schedule; `auto_renew: true` attempts to deduct ₱500 to
  extend, otherwise status moves to `expired`/`suspended` on insufficient
  funds or missed quota.

This is a real, distinct business role from Merchant/Rider/Customer — worth
its own module in the new backend rather than bolting onto an existing one.

### Gamification — XP, Levels, Promos, Incentives, Wallet (detailed rules)

**Dual-currency**: XP (non-spendable, determines Level/Rank only) vs.
Reward Points (spendable, earned via purchases/deliveries) — two separate
tracked values, never conflated. Level progression has a real XP-per-level
table (Level 1→2 = 100 XP, scaling up through 50+). Buyers earn XP from
spending + reviews; Riders earn XP from completed deliveries weighted by
rating + speed. `function: gamification/process_xp` runs on level-up,
unlocking level-specific rewards (discount coupons, lower service fees,
profile badges).

**Vouchers/Promos**: merchant-created vouchers sit `pending` until
Super Admin approval (matches what was already documented) — new detail:
scoping is one of Store-specific (merchant-funded) / Product-specific
(brand-funded) / Global (platform-funded). Minimum-purchase is a hard
checkout-time rejection (cart below threshold = voucher rejected outright,
not silently ignored). Only **one voucher per child-order** (i.e. per
merchant split within a multi-store cart) — stacking beyond that isn't
allowed. Expired vouchers (`expires_at` passed) are excluded from `GET
/promotions` automatically, not just hidden client-side.

**Incentives**: conversion rate is **5 Reward Points = ₱5.00** (1:1 with
peso, just scaled), via `POST /super_app/marketing/points/convert` —
atomic points-deducted/balance-added operation. Riders get a speed-bonus
multiplier for beating ETA. Merchants with low cancellation rates unlock
better (lower) commission tiers — same tiering concept as the Split Engine
above, worth confirming these are the same tier table or two separate
ones.

**Wallet — Escrow and fraud rules (adds detail to section 3/6's Escrow mentions)**:
- Placing an order moves funds `available_balance → held_balance` — money
  is locked, not spendable elsewhere, for the order's duration.
- **₱100 P2P Rule**: peer-to-peer transfers require mobile OTP if the
  amount exceeds a threshold (₱100 referenced) or the sender has an
  elevated fraud "Risk Score."
- **Impossible-Travel fraud detection applies to P2P transfers too**, not
  just login (multiple transfers from different-city IPs within 5 minutes
  → auto-flag). This is a separate detection instance from the
  login-based Impossible Travel rule in section 8's Admin block — both
  need implementing, not just one.
- Fraud detection auto-sets `wallet.status = locked`, blocking all
  cash-outs pending Admin review.
- Withdrawals only allowed to bank accounts with a verified
  `verification_status` — checked at `POST /wallet/withdraw` time, not
  earlier.

### Freelance (resolves the role-model question above)

- A Freelancer = a Customer account with `role` upgraded `CUSTOMER →
  FREELANCER` — not a separate app or portal. Reached via Buyer app
  Profile → "Become Freelancer."
- Gate: requires **KYC Level 3** (selfie with ID) admin-approved, plus a
  mandatory `service_category_id` anchor — a freelancer must pick one
  system-defined service pillar, never "anything."
- Same Split Rule as merchants: ~10% of booking fee moves to the Admin
  wallet on job completion.
- Visibility gated on `approval_status == approved`, surfaced via `GET
  /super_app/merchants/services`.

### Service Provider (a DIFFERENT concept from Freelance — don't conflate)

Companies/agencies, not individuals — the B2B tier with team management,
distinct from the individual Freelancer role above. This is likely the
real backend equivalent of this project's standalone `provider-portal`
app, where Freelance is not.

- Subscription-based (`subscription_plans` table): **VIP** (priority
  search placement), **Partner** (lower commission), **Freelance/Pro**
  (advanced booking-management tools) tiers.
- Auto-renewal: `auto_renew: true` deducts the plan fee on
  `next_billing_date`; failure downgrades to inactive "Basic" status.
- Providers have their own `approval_status` gate (Pending → Approved)
  before subscription benefits activate — separate from KYC.

### Google Maps / Geofencing (adds detail + new rules beyond the 150m pickup rule)

- **150m Privacy Shield**: reinforces earlier detail — rider/store GPS
  distance check, customer `precise_address`/`phone_number` hidden until
  ≤150m.
- **2km Dispatch Radius**: new-order "Searching Rider" broadcast only
  reaches riders with `online_status: true` within 2km of the store —
  this is the initial candidate pool before the accept/reject/reassign
  flow (section 6) kicks in.
- **Geofencing**: `function: security/check_geofence` blocks placing
  orders/ride-requests entirely if the user's coordinates fall outside
  RAPEX's defined active service polygons (PH regional boundaries) — a
  hard platform-wide boundary check, not per-store.
- **Reverse-geocoding cache**: coordinates are geocoded once, then stored
  in `user_addresses`; repeat lookups for the same location read from the
  Xano DB instead of re-calling Google — a real cost-control measure worth
  replicating (don't re-call Maps geocoding for an address already on
  file).

### Referrals — two distinct systems, don't conflate

**User-to-User** (customer growth): only counts "successful" once the
referred user completes their **first** order (`delivered_completed`).
Reward rules live in `referral_configs` (PTS or PHP payout). **Monthly cap**
per user (example given: 10 successful referrals/month) to prevent gaming.
Every user has a `referral_id` tied to a `qr_payload` for the actual
share/scan mechanic.

**Partner-to-Merchant** (B2B, ties into the Partnership Program above):
quota credit only fires when the referred merchant hits `kyc_status:
verified` (not at signup). **Lifetime Rule**: once credited, the partner
earns commission on every future sale that merchant makes for the life of
the partnership — not a one-time bounty. Missing the annual quota
(`function: partnerships/check_annual_status`) drops the partner from
"Platinum" to a reduced rate, matching the Partnership section above.

> ⚠️ **FLAGGED CONFLICT (not resolved):** the founder's own Master Feature
> Checklist (see `OrderEngineOpenQuestions.md` Part A) lists a **"36-month
> merchant commission rule"** as a locked/confirmed item. That cannot both
> be true alongside this Lifetime Rule as written — 36 months is a hard
> cap, "life of the partnership" is not. Per standing project discipline
> this is flagged, not silently resolved in either direction. Needs an
> explicit founder decision: is Partnership commission lifetime, capped at
> 36 months, or lifetime for one tier and 36-month for another? See
> `docs/handoff/OrderEngineOpenQuestions.md` for the full context this
> surfaced from.

### Vehicles

Classes: `bicycle`, `motorcycle`, `hatchback`, `sedan`, `elf` (truck),
`van` — each with a `capacity_weight` and `capacity_volume` limit. Orders
over **20kg automatically disqualify** bicycle/motorcycle from the
dispatch pool — this is a real filter on the candidate-rider query, not
just a UI hint. A vehicle isn't "Active" until `license_number` and
`or_cr_photo_id` are Admin-verified — separate from the rider's own KYC.

### Dynamic pricing — Peak/Rush surge

- `function: orders/calculate_delivery_fee` applies a surge multiplier
  during peak windows defined in `system_settings` (example: 11AM-1PM
  lunch, 5PM-8PM dinner) — `base_fare` (₱50) × surge rate (example: 1.5x)
  to pull more riders online.
- Separately, a "Traffic Adjustment" fee applies when Google's estimated
  travel time significantly exceeds the distance-based average —
  distinct from the time-of-day peak surge, both can apply to the same
  order.

### Service radius / nearest-store ranking

- Default **10km radius** (`service_radius_km`) — stores/providers only
  visible to customers within it.
- `GET /rapex-market/stores` ranks by Haversine-formula distance ASC, with
  one exception: a **subscription-Promoted store can jump to the top even
  if further away** — ranking isn't pure distance-sort once paid
  promotion is a factor.
- Riders set their own `service_radius_km` and only receive new-order
  notifications for stores within it — a second, independent radius from
  the store's own 10km customer-visibility radius.

### Store categories/pillars (confirmed authoritative list) + operating hours

- **Seven pillars**: Food, Marketplace, Wholesale, Industrial,
  Agriculture, Services, Auction. (This project's own category lists
  elsewhere used a different set — e.g. Hardware instead of Wholesale/
  Industrial split — reconcile against this list as the real one.) One
  store per pillar per merchant (same Pillar Rule as section 8's Merchant
  audit).
- `store_hours` table tracks `open_time`/`close_time` per day;
  `open_status` auto-flips `false` outside those hours — a hard close, not
  a soft warning.
- **Basket Rule**: a closed store is still browsable, but "Add to Cart" is
  disabled with an "Opening Soon" label — never a fully blocked page.
- Stores open 10PM-5AM can carry a "Night Owl" delivery surcharge via
  `delivery_rates` — separate line item from the peak-hour surge above.

### Scam/Spam prevention (adds exact thresholds to section 8's earlier fraud mentions)

- **Chat leakage filter** (`function: security/chat_leakage_filter`):
  every chat message scanned for phone numbers, emails, and keywords
  ("Viber", "WhatsApp", "Messenger"); a hit blocks the message with:
  "For your security, contact information sharing is restricted until a
  booking is confirmed." — prevents off-platform deal-making that would
  bypass commission.
- Duplicate-ID detection: the same alphanumeric ID or mobile number can't
  be linked to more than one account.
- **Malicious Activity Score** (`function: security/evaluate_user_risk`) —
  exact thresholds: rapid failed logins, **more than one OTP request within
  60 seconds**, or Impossible Travel (**logins from two cities within 5
  minutes**) → auto-sets account to `locked` or `review`. (These are the
  same two triggers referenced generically in section 8's Admin block —
  now with real numbers to implement against.)

### IP security

- `blocked_ips` table, each entry with an `expires_at`; a high-risk audit
  event auto-adds the offending IP. Requests from a blacklisted IP are
  hard-rejected at the **API middleware level** with 403 — before reaching
  any view/business logic.
- Geographic IP-location vs. reported-GPS mismatch logs a "Security Event"
  (flag/log, not necessarily an auto-block by itself).

### Store Rewards/Loyalty — a SEPARATE system from the platform-wide Gamification in section 8, don't conflate

- Rewards can be **store-locked**: a merchant funds their own loyalty pool,
  valid only at that store.
- **Store XP** (rank within that one store, e.g. Bronze→Gold) is distinct
  from **Store Points** (spendable discount currency at that store) — and
  both are distinct from the platform-wide XP/Reward-Points pair described
  earlier. Three separate currencies total once both systems exist:
  platform XP, platform Reward Points, and per-store Points.
- Verified photo reviews auto-award Reward Points — an incentive for
  higher-quality feedback, not just review volume.

### Local Rider dispatch (adds detail to the 2km radius mentioned earlier)

- **2km broadcast, time-boxed**: when a store marks `ready_for_pickup`,
  the broadcast goes to riders within 2km **for the first 5 minutes**
  specifically — implies a fallback/expansion behavior after 5 minutes
  that wasn't detailed here; confirm what happens next (wider radius?
  admin manual assignment, per section 8?) before assuming silence means
  "never fills."
- **Home Hub priority**: riders can be anchored to a `home_hub_id`
  (municipality); dispatch prefers riders whose home hub matches the
  store's location, for local-knowledge/shortcut familiarity — a ranking
  factor, not a hard filter.
- The **Accept button itself is proximity-gated**: accepting an offer only
  succeeds if the rider is within their own `service_radius` of the store
  at accept-time — a second server-side check beyond the initial broadcast
  filter, so a rider who moved out of range can't accept a stale offer.

### Commission & Markup Engine — the real formula (implement exactly this, not a guess)

- **Markup** (customer-side): default **20%**. Merchant lists ₱100 →
  customer sees ₱120. The ₱20 difference is platform revenue, taken from
  the *customer* side.
- **Commission** (merchant-side): default **10%**. From the merchant's
  ₱100, ₱10 is deducted at order completion. Taken from the *merchant*
  side.
- **Double-Earnings**: these are two independent revenue streams RAPEX
  collects on the *same* transaction simultaneously — not one combined
  rate. `customerPrice = merchantListedPrice × (1 + markupRate)`;
  `merchantReceives = merchantListedPrice × (1 - commissionRate)`.
- **Overrides, two independent axes**:
  - Category-pillar-level: e.g. Agriculture commission 5% vs. Industrial
    15% — a default per pillar, not one global rate.
  - Merchant-specific: Admin can grant a star merchant a "Lower Rate"
    override that beats the pillar default — an explicit per-merchant
    exception, auditable.
- This is the authoritative source for the Engine Center's
  `commissionRatePercent`/`markupRatePercent` fields described in section
  3 — implement the Django Engine Rules models with markup and commission
  as two separate configurable rates (both tiered by pillar and
  overridable per-merchant), not a single blended percentage.

### KYC Permit Tiers (3-tier, gates far more than just "verified or not")

This is the real access model underlying every "verification" reference
elsewhere in this document — three tiers, each unlocking specific
capabilities:

- **Tier 0 — No Permit** (mobile/email unverified): "Guest View" only —
  can see merchants within 2km, cannot add to cart at all.
- **Tier 1 — Partial Permit** (email + mobile OTP confirmed): full
  marketplace browsing unlocked, plus COD orders **up to a limited peso
  cap** (exact cap not given — confirm before implementing a hard number).
- **Tier 2 — Full Permit** (gov ID + selfie, Admin-approved): required for
  — wallet withdrawal, becoming Merchant/Rider/Freelancer (any role
  upgrade), and placing high-value auction bids. This is the single gate
  behind four separate capabilities, not four separate checks.

### Auctions (role model still unconfirmed per section 2, but the mechanics below are real)

- **Escrow lock on bid**: placing a bid instantly locks that amount in the
  bidder's `held_balance` — you cannot bid money you don't have, checked
  at bid time not settlement time.
- **Anti-sniping**: a bid in the final 60 seconds extends `ends_at` by 2
  minutes automatically — repeats every time a last-60-second bid lands,
  not just once.
- **Reserve price**: highest bid below the seller's reserve →
  `pending_seller_approval`, seller manually accepts the lower amount
  rather than the sale auto-completing.
- **Settlement**: one atomic transfer on close — winner's funds to seller,
  platform cut taken, and the Auction Record converts into a real
  Marketplace Order for delivery fulfillment (i.e. auctions ride the same
  order/delivery pipeline once won, not a separate fulfillment path).

### Child/Baon — confirms and extends the earlier Xano confirmation

- Parent sets `daily_limit` or `weekly_budget` per child.
- Child never sees the parent's actual balance — only their assigned Baon
  allowance.
- **Linked, not pre-funded**: a child's order checks the *parent's* wallet
  at order time and charges the parent directly (updating the child's
  `spent_amount` for tracking) — the child's Baon isn't a separately
  pre-loaded balance sitting in the child's own account.
- Parents can toggle off entire store categories per child (e.g. child can
  spend Baon on Food but not Marketplace) — a category-level allowlist/
  denylist per child, not just a peso limit.

### Age restriction (18+, adds the exact check to what was already documented)

- Pre-auth check, before the signup screen is even reachable: birth year
  entered → `(currentYear - birthYear) < 18` → hard `ACTION_NOT_ALLOWED`,
  account never created. (Matches this project's own `checkAge()`
  pre-auth call — same gate, same intent.)
- **KYC cross-check**: at Full Permit review, Admin must confirm the
  uploaded ID's birthdate matches the profile's stated birthdate — a
  mismatch is a real `kyc_rejected`, not just a warning. This is a second,
  independent age check beyond the signup-time one.

### Rider registration + selection algorithm (the real dispatch priority order)

**Registration**: Professional Driver's License + OR/CR (vehicle
registration) + a vehicle photo required. The "Go Online" toggle is
**hard-disabled** until `verified: true` is Super-Admin-set — not just a
warning banner, the toggle itself doesn't work.

**Selection, in priority order** — this is the real algorithm, worth
implementing exactly in this order rather than picking a different
weighting:
1. Filter: `online_status: true` AND `is_active: true`.
2. Filter: within 2km of the store.
3. Weight: riders with a **4.5+ rating** prioritized.
4. Filter: order weight (from the product record) vs. vehicle capacity —
   a heavy order (example given: "a Rice Sack") is never routed to a
   Bicycle rider. (Matches and reinforces the earlier ">20kg disqualifies
   bicycle/motorcycle" rule.)
5. **Auto-reassign on timeout**: no Accept within **60 seconds** → offer
   moves to the next-closest eligible rider automatically.

### Wallet Atomic Split — now confirmed as FOUR parties, not three

Supersedes the earlier three-party split description — the real split on
order completion has four legs in one atomic transaction:
- **Merchant**: `Price − Commission`
- **Rider**: `Delivery Fee − Rider Platform Fee` (new detail: the rider's
  own delivery fee has a platform cut taken out of it too — a separate fee
  from the merchant's commission)
- **Partner**: referral commission, only if the merchant was
  partner-referred (ties into the tiered rates below)
- **RAPEX Admin**: `Platform Fee + Markup + Commissions` — three of
  Admin's own revenue streams bundled into one ledger credit, not three
  separate transactions

**COD rules**: requires at least **KYC Tier 1**. Orders **over ₱2,000**
automatically disable COD as an option (protects the merchant from
high-value no-shows) — this is a hard cutoff to implement exactly, not a
soft warning.

### Auction — 24-Hour Finalization + Delivery specifics

- **24-Hour Rule**: once an auction ends, the winner has 24 hours to
  confirm delivery address + payment method (if not already wallet-paid).
  Miss the window → auction marked `forfeited`, seller can re-list. This
  needs a scheduled/background task (`auto_expiration_task`), not a
  request-time check.
- Auction→Order conversion happens **immediately at auction close**,
  landing directly at order status `preparing` (not `pending` — skips the
  merchant-acceptance step other orders go through, since the "sale" was
  already agreed via the winning bid).
- Auction delivery fee: either an Admin-set flat rate, or the standard
  weight-based vehicle-capacity logic (heavy/bulky auction items require
  ELF/Van, same rule as regular orders).

### Delivery Types — Rapid Express vs. Standard (new, not previously documented)

Two distinct logistics tiers, not one uniform delivery system:

- **Rapid Express**: 2-5km radius only, carries a "Priority Surcharge"
  (higher base fare), broadcasts exclusively to motorcycle/bicycle riders.
- **Standard Delivery**: 10-50km (municipality-wide), fee = `Base Fare +
  (km × rate)`, and orders **can be bundled** — one rider handling multiple
  pickups in one trip. Bundling is a real Standard-tier capability worth
  designing for, not an edge case.

### Partnership commission tiers — exact rates (supersedes "tiered, unspecified rate" language earlier)

- **Silver**: 1% of referred-merchant sales, 1-5 referrals
- **Gold**: 2%, 6-15 referrals
- **Platinum**: 3%, 16+ referrals
- `function: partnerships/track_referral` links the merchant's `id` to the
  partner's `user_code` **permanently** ("forever") — this is what backs
  the earlier-documented Lifetime Rule; the link itself, once made, is
  never broken even if the partnership later lapses.

### Invitations + Store completeness gate

- **Admin invites**: Super Admin generates an `invite_code`; that exact
  code is required to sign up with the `ADMIN` role — this is the real,
  confirmed mechanic (supersedes the generic `POST /super-admin/admins/
  invite` shape guessed in the earlier Xano spec batch — use the
  invite-code flow instead, not an email-invitation-link flow).
- **Merchant store setup**: requires KYC Tier 2 (Identity Verified) before
  a store can even be created; One-Store-Limit per category reinforced
  again here.
- **The 100% Rule**: a store stays `is_active: false` until its profile is
  fully complete — Name, Category, GPS Location, Operating Hours, and
  Verified Business Docs, all five, not a partial-completion threshold.
  This is a stricter gate than "pending admin approval" alone — the store
  can't even reach the review queue until every field is filled.

### Community — new feature, not previously documented anywhere in this project

- **Hyper-local feed**: `GET /community/get_feed` auto-filters by the
  viewer's `province_id` + `municipality_id` — a social feed scoped to the
  user's own area by default, not a global feed.
- **Buy-from-Feed**: posts can tag a `product_id`/`store_id`; a tagged post
  renders a "Buy Now" that adds straight to cart from the social feed
  itself — commerce and community share the same cart/checkout pipeline,
  not a separate purchase path.
- **Reputation**: `community_reputation_log` tracks points earned from
  post engagement (likes/love); high-reputation users get priority feed
  visibility, low-reputation or reported users get **shadow-banned**
  algorithmically (not a visible ban — posts just stop surfacing).

### Gamification — exact XP amounts (supersedes the generic "earn XP" language earlier)

- **Buyers**: 1 XP per ₱10 spent, 50 XP per written review.
- **Riders**: 100 XP per completed delivery, 20 XP per 5-star rating
  received.
- **Merchants**: 50 XP per fulfilled order, 10 XP for fast preparation.
- `level_rewards` table drives what unlocks per level (example given:
  Level 5 → Bronze Badge, Level 10 → 5% discount voucher) — level-to-reward
  mapping is admin-configurable data, not hardcoded per level in code.
- `gamification_tasks` defines rotating **Daily Quests** (example: "Complete
  3 orders today") granting bonus Reward Points — a separate mechanic from
  the passive XP-per-action rules above.

### Integrations — the real architectural boundary of each third-party service (important for the new backend's design)

- **Firebase**: push notifications and Google/social login **only**.
  100% of account data and session logic lives in Xano/Django — Firebase
  is never the source of truth for a user record. (Matches this project's
  own Firebase usage — good, no correction needed here, just confirms the
  pattern was right.)
- **Google Maps**: used only for address lookups and route polylines.
  **All distance calculation and geofencing runs server-side inside
  Xano/Django using stored coordinate polygons** — not a live Maps API
  call per request. This is the real reason the 150m/2km/geofence rules
  throughout this document are described as Xano-side logic, not
  Maps-API-side.
- **PayMongo**: Xano/Django generates the Checkout URL, then **waits for a
  webhook** to confirm payment before touching the wallet balance — never
  trusts a browser redirect as proof of payment (matches this project's
  own established payment-security discipline exactly).
- **Google Sheets "Bridge"** (new, not previously known): all 20+ backend
  tables sync to Google Sheets via `function: google_sheets/sync`, purely
  so the Admin team can monitor data without opening the Xano dashboard.
  Worth deciding whether this pattern is still wanted once the backend is
  Django (e.g. a scheduled export job) or whether Django's own admin panel
  replaces the need for it entirely.

### Marketing — voucher funding source + referral/ad rules

- **Voucher funding, two distinct sources** (adds financial detail to
  section 8's voucher-scoping description): merchant-funded vouchers
  deduct from *the merchant's own payout*; platform-funded (global)
  vouchers are covered by *platform markup revenue* — these need to debit
  different ledger accounts in the Split Engine, not one shared "discount"
  line.
- **Referral escrow**: referral rewards (cash or points) stay frozen until
  the referred friend completes their **first successful delivery** —
  same trigger as the User-to-User referral rule documented earlier, now
  explicitly framed as fraud prevention against fake-account referral
  farming.
- **Ad placement**: `marketing_ads` table, rotation by `priority` +
  `target_audience`, with real exclusion logic (example given: a "Become a
  Rider" ad is never shown to a user who's already a Rider) — targeting
  needs to read the viewer's actual role/state, not just a static segment
  tag.
- **5-for-5 conversion** reconfirmed: 5 Reward Points = ₱5.00, via
  `marketing/points/convert` — same rate as documented earlier, now with
  its own dedicated function reference.

### Vertical-specific purchase flows — the marketplace is NOT one uniform checkout, four real variants

Important for checkout/cart UI design: these aren't edge cases, they're
four genuinely different purchase mechanics depending on what's being
bought.

**Wet Market / Fresh Goods** (`is_fresh: true`):
- Wallet holds the **maximum possible price** at order time (e.g. 1kg
  ordered = held at 1kg's price). At pickup, the merchant adjusts to the
  **actual weight** (e.g. 0.95kg) and the system auto-refunds the
  difference to the customer's wallet — a post-fulfillment price
  adjustment, not a fixed charge.
- Fresh goods are **Rapid-Express-only** and cannot bundle with
  Industrial/Wholesale items in the same delivery (spoilage risk).
- **Early Shift hours**: typically 4:00 AM–10:00 AM, auto-marked `Closed`
  by noon — a distinct operating-hours pattern from the general
  `store_hours` open/close logic described earlier.

**No-POS / Traditional Merchants** (Sari-sari stores, small stalls,
`inventory_tracking: false`):
- "Always Available" by default — product assumed in stock until the
  merchant manually flips it to `out_of_stock`; there's no real-time stock
  sync to base availability on.
- **5-Minute Acceptance Rule**: orders sit `merchant_pending`; no manual
  Accept within 5 minutes auto-cancels. (This is a *specific*, shorter
  window for No-POS merchants — don't assume it's the same "system-defined
  window" mentioned generically for order acceptance elsewhere in this
  document; confirm whether POS-integrated merchants get a different,
  longer window.)

**Fast-Running / Carenderia** (high-volume, low-prep-time):
- Every product carries a `preparation_time` (e.g. 5 min); a countdown
  starts on order-accept, and exceeding it **automatically dings the
  merchant's Reliability Rating** — prep speed is a tracked, scored metric,
  not just informational.
- **Batch Prep View**: identical items across multiple concurrent orders
  group into one batch (e.g. "10x Pork Sisig" instead of 10 separate
  tickets) — a real kitchen-facing UI concept worth preserving, not just a
  backend optimization.
- A prominent 1-tap "Sold Out" toggle on the merchant dashboard — fast
  stock-outs need a faster UI path than the standard product-edit flow.

**Wholesale / Retail / Industrial** (B2B, bulk):
- **Inquiry, not Order**: large/bulk items use `wholesale_inquiries`, not
  the cart — "Add to Cart" is replaced by "Send Inquiry," and **no wallet
  charge happens at inquiry time**.
- **Quotation Loop**: merchant reviews the inquiry, submits a custom
  quote (volume discount + delivery timeline) → customer reviews and
  accepts → **only then** do funds move to escrow. Escrow/wallet-hold
  happens after quote-acceptance, not at inquiry submission — a
  materially later point in the flow than every other purchase type in
  this document.
- **Automatic tiered pricing**: `wholesale_tiers` switches retail→
  wholesale pricing by quantity in cart (example: 1-9 units = ₱100 each,
  10+ = ₱85 each), applied automatically before checkout — the customer
  never manually selects a "wholesale" mode, the system detects it from
  quantity.

### Service Bookings (professional/appointment services — IT, Cleaning, Construction)

- **Two-step pricing**: `estimated_price` held in wallet at booking time;
  provider submits `final_price` after the job (covers materials/
  overtime). If final > estimated, **the customer must explicitly approve
  the extra charge before the booking can complete** — the provider can't
  just charge more unilaterally.
- **Scheduling gate**: no past-dated bookings; `POST /service_bookings`
  checks the provider's `operating_hours` + `availability_status` before
  accepting.
- **Cancellation penalty**: customer cancels within 2 hours of the
  appointment → a cancellation fee (example: ₱50) moves customer→provider
  as compensation for the held time slot.

### Accounting / Ledger — the real financial integrity rules

- **SSOT rule**: a wallet balance can never change without a
  corresponding `ledger` table row — no direct balance writes anywhere in
  the system, ever.
- **Idempotency**: every transaction requires a `transaction_code` (e.g.
  `PAY`, `TFR`, `DLV` prefixes); a repeated code is rejected outright —
  this is what makes retried/duplicate requests safe from double-charging.
- **Admin wallet isolation**: markup + commission revenue moves into a
  dedicated `admin_wallet`, kept separate from general "Operating Funds" —
  a real solvency/accounting separation, not just a labeling convention.
- Atomic distribution (`accounting/distribute_funds`) reconfirmed: full
  DB-transaction rollback if any single payout leg fails — no partial
  settlement is ever possible.

### REX Botifications (adds scope to the Silent Window rule from section 8)

- **Silent Window (10PM-8AM) applies platform-wide to non-critical
  notifications**, not just low-stock reminders as originally documented —
  the general rule is broader than first described. **Critical alerts
  (Order Accepted, Rider Arrived) explicitly bypass the silent window** —
  a two-tier notification-priority system, not a blanket quiet period.
- **Role-targeted content**: the same event can produce different
  messages per role — Riders get Earnings Alerts, Customers get Promo
  Alerts — content is role-aware, not one broadcast body sent to everyone.
- **Firebase push fires only after the internal `notifications` table
  write succeeds** — the DB record is the source of truth, the push
  notification is a side-effect of it, never the other way around (matches
  section 8's confirmed Firebase-is-delivery-only boundary).

### Reservations — 10-minute inventory lock (new, not previously documented)

- Adding a **"Fast-Running" item** to cart creates a `product_reservation`
  that deducts the reserved quantity from the *public* stock count
  immediately — prevents overselling during high-demand windows.
- Lock lasts **exactly 10 minutes**. `function:
  reservations/cleanup_expired` runs on a **1-minute schedule**,
  releasing stock and clearing the cart for any reservation past 10
  minutes with no completed checkout.
- This is specifically for fast-moving items (ties to the Carenderia/
  fast-running-product logic documented earlier) — confirm whether it
  applies to all products or only ones flagged fast-running before
  implementing it universally.

### Realtime — GPS heartbeat + live dispatch channel

- **30-second GPS heartbeat** required from every Online rider. **No
  heartbeat for 5 minutes → automatic Offline toggle + removal from the
  dispatch pool** — the backend actively demotes stale-presence riders,
  not just a passive last-seen timestamp.
- `map:updates` realtime channel broadcasts **Rider ID + current
  coordinates only — drop-off/customer location is never put on this
  channel**, even though it's visible to the rider directly through their
  own delivery detail once assigned. Public/broadcast visibility and
  assigned-rider visibility are two different privacy scopes.
- The instant a merchant clicks "Ready for Pickup," a realtime push (not a
  poll) reaches every eligible rider within 2km simultaneously — this is
  what makes the Accept button "appear instantly," per the founder's own
  description of the intended feel.

### Merchant Tiers — exact commission-by-rank numbers (extends the Engine Center / Performance Tiers concept with real values)

- Bronze → Silver → Gold → Platinum, driven by merchant XP (on-time
  fulfillment + 5-star reviews — same XP source described in the
  Gamification section, one shared XP pool, not a separate merchant-tier
  metric).
- **Commission drops by tier**: Bronze 10%, scaling down to Platinum 7% —
  concrete numbers to seed the Engine Center's per-merchant override
  logic with, replacing the vague "star merchants get a lower rate"
  phrasing from earlier.
- **Multi-store pillar limit is itself tiered**: only Gold and above can
  manage **3+ store pillars** at once — the base One-Pillar-per-category
  rule still applies per pillar, but how many *total* pillars a merchant
  can run simultaneously scales with their rank.

### Cart / Checkout split logic (the actual multi-store cart architecture)

- **"One Checkout, Many Orders"**: a single cart can hold items from up to
  5 different stores; clicking Checkout splits it into that many separate
  **Child Orders**, one per store — this is the real mechanic behind the
  "child-order" language used in the earlier voucher one-per-child-order
  rule; a "child order" = one store's slice of a multi-store cart, not a
  Child/Baon account's order.
- **Food Priority / no-bundling constraint**: Food items cannot share a
  delivery vehicle/trip with Industrial (heavy/dirty) items — generalizes
  the Wet-Market-specific "Rapid-Express-only, no bundling with Industrial/
  Wholesale" rule to Food broadly.
- **Branch Locking**: a Food order cannot mix items from two branches of
  the same chain (example given: Jollibee Branch A and Branch B) in one
  order — keeps fulfillment to a single physical pickup point per order.

### Pre-Loved & Variants/Add-ons

- `preloved_enabled: true` products are hard-locked to **stock quantity
  1** — inherently unique, never restocked.
- **No-Return Rule**: the instant a pre-loved item hits
  `delivered_completed`, funds release to the seller immediately and
  returns are disabled — sold as-is, no post-delivery dispute window
  (unlike the standard order flow's normal settlement timing).
- **Variants** (Size/Color): own SKU, own price, stock tracked
  per-variant. **Add-ons** (Extra Cheese, Gift Wrap): price modifiers
  only, no separate inventory count. (Matches this project's own existing
  `ProductDetail.variants`/`.addOns` distinction in
  `packages/api-client/src/repositories/types.ts` exactly — no correction
  needed here, just confirms the existing frontend model was already
  right.)

### Community Messaging (adds exact scope to the earlier chat-leakage mention)

- Customer↔Rider chat is only open while an order is in an **Active**
  state — specifically `picked_up` or `delivering`, not any "active"
  order status broadly.
- Conversation auto-deletes/archives **24 hours after order completion** —
  a real privacy-driven data-retention rule, not just UI hiding.
- `chat_leakage_filter` reconfirmed as the same real-time message-scanning
  block described in section 8's Scam/Spam rules.

### Ratings — double-blind, with real enforcement consequences

- **Double-blind, asymmetric pairing**: Customer rates the Store/Product;
  separately, the **Rider rates the Customer** — there's no
  Customer-rates-Rider or Store-rates-Customer pairing described here.
  Worth confirming directly whether Customer-rates-Rider exists at all
  (this project's own UI assumed it does, e.g. delivery completion
  screens) — this summary doesn't confirm that direction one way or
  the other.
- Store rating is a real **search-ranking input** (alongside distance and
  Promoted-subscription placement, both documented earlier under Service
  Radius) — three ranking factors total, not just distance.
- **Automatic enforcement**: a rider whose rating drops below **3.5
  stars** is auto-toggled Offline and flagged "Review Account" for Super
  Admin — a real automatic quality-gate action, not just a displayed
  number.
- **Possible discrepancy worth flagging, not silently resolving**: this
  batch says review-with-photo earns **10 XP**; the Gamification section
  earlier in this document says buyers earn **50 XP** per written review
  (no photo qualifier mentioned there). Confirm with Xano whether these
  are the same reward described inconsistently, or two genuinely
  different amounts (e.g. 50 XP base + 10 XP photo bonus, or photo
  reviews are a separate lower-value action) before implementing either
  number.

### System Health / Maintenance Mode (new, not previously documented)

- `server_monitor` tracks CPU/Memory/Latency per API call; **latency over
  2000ms** triggers a "High Latency Alert" to the developer group — a
  real operational alerting threshold worth replicating.
- **Maintenance Mode kill switch**: Admin toggles `system_status =
  MAINTENANCE` → every frontend app shows a "REX is Sleeping/Upgrading"
  screen, and write endpoints (example given: `rapex-orders/create`)
  return **503 Service Unavailable**. This is a genuinely useful
  platform-wide safe-deploy mechanism worth building early in the new
  stack, not treating as a nice-to-have.

### Agriculture/Agrivet & Hardware/Industrial (two more "dirty cargo" pillars, extending the Wet-Market/Food-priority pattern)

- **Agriculture**: seasonal Advanced Booking for harvests (rice, corn);
  the **Inquiry Flow applies here too** above a quantity threshold
  (example: >50 sacks) — a *third* trigger for the Inquiry-not-Order
  pattern documented earlier (Wholesale/Industrial being the first
  confirmed one). Agrivet chemical/pesticide items are Hazmat-flagged,
  restricted to ELF/Truck vehicles only, never bundled with food.
- **Hardware/Industrial**: `is_dirty: true` products flag. **Cross-order
  dispatch constraint**: the dispatch engine won't assign a rider who has
  an *active Food delivery already in progress* to a dirty-cargo order —
  this is a rider-level exclusion across concurrent orders, not just a
  same-cart bundling rule. Heavy hardware bypasses motorcycle entirely,
  routed only to vehicles with `capacity_weight > 500kg`.

### The Order Flow — full 14-state machine (authoritative, reconciles earlier conflicting state lists)

```
Draft → Order Placed → Merchant Pending → Merchant Accepted → Preparing →
Ready for Pickup → Searching Rider → Rider Assigned → Rider Confirmed →
On the Way to Merchant → Picked Up → Delivering → Delivered/Completed
                                                  ↘ Failed/Cancelled
```

**"Any transition outside this path is rejected by Xano"** — a strictly
enforced state machine, not a suggested flow. Per-state notes: Order
Placed activates the wallet hold; Preparing activates the Batch View for
kitchen staff; Ready for Pickup fires the realtime 2km ping; Rider
Confirmed specifically checks the GPS heartbeat confirms the rider is
actually moving toward the store (not just that they clicked Accept);
Picked Up requires the rider to enter a **Pickup Code** from the merchant
(a real handoff-verification step not mentioned anywhere earlier in this
document); Delivering activates live tracking + the 150m shield;
Delivered/Completed triggers POD upload + the atomic payout;
Failed/Cancelled returns funds to the customer where applicable.

**Reconciliation note — this supersedes two earlier, narrower state
lists in this same document**: an earlier Rider-API round described a
simplified 5-state set (`searching_rider → rider_assigned → picked_up →
out_for_delivery → delivered_completed`) — that was evidently a
rider-facing subset/simplification of this full 14-state machine, not a
different state model. And this document's sections 3-6 (written from
frontend-side inference before the Xano deep-dive) referenced a 13-state
`DeliveryOrderStatus` enum with different naming
(`going-to-merchant`/`arrived-merchant`/`arrived-customer` etc.) that
doesn't match this list either. **This 14-state list is the one to
actually implement** — treat both earlier mentions as superseded.

### God Mode — concrete scope (adds real API examples to the high-risk capability flagged earlier)

- **Force Status Change**: Admin can move an order directly from
  `searching_rider` to `completed` for manually-arranged offline
  deliveries — skips the entire rest of the state machine above.
- **Wallet God Mode**: `api: admin-master-data/wallet/adjust` — add or
  deduct funds on any wallet, gated to require a high-risk audit log
  entry. This is the real endpoint shape to design the Django equivalent
  around.
- **Account Force-Active**: Admin can bypass the RN 10-second welcome
  animation *or* the KYC flow entirely for designated "Emergency Fix"
  accounts.
- All three of these are exactly the "impersonate/override/adjust-wallet"
  capability flagged earlier as the platform's single highest-risk area —
  this batch doesn't reduce that risk assessment, it just gives concrete
  shapes to design the security review around.

### Store Hours "Graceful Close" + exact Local Rider priority number

- **Graceful Close**: if cart items belong to a store closing within 15
  minutes, a botification fires: "Store is closing soon! Checkout now to
  avoid cancellation." — a proactive nudge, not a silent cancellation.
- **Local Anchor, exact number**: a rider inside their own
  `municipality_id` gets **15% higher dispatch priority** than a visiting
  rider from elsewhere — quantifies the "Home Hub priority" concept from
  the earlier Local Rider Rules section, which only described it
  qualitatively before.

### Reward & Audit History (append-only, matches the pattern already seen in Jed's real Django code)

- `reward_history`: every points/cash event logs `source_type` (Purchase,
  Review, Referral) + `balance_after` — specifically built to resolve
  user disputes about missing points, so this needs to be queryable by
  user + time range, not just a write-only log.
- **Security Audit fields, confirmed exact schema**: `actor_user_id`,
  `ip_address`, `old_value` vs `new_value`, `risk_level` (High/Medium/Low)
  — logged on every God Mode action and every high-value P2P transfer.
  This exact field list is what the Django audit model should implement;
  it also matches `SystemSettingChangeLog`'s append-only pattern already
  found in Jed's actual `apps/system/models.py` (blocked update/delete at
  the model level) — reuse that same append-only enforcement pattern for
  this audit table too.

---

## 9. Child/Baon — approved rules (supersedes every earlier Child/Baon mention in this document)

**Source tier is different from section 8 above**: everything in section 8
came from asking a Xano AI to *describe what's currently implemented*.
What follows came from the founder's own written specification — an
approved-rules document handed to an implementation analyst, i.e. the
authoritative target design, not a description of existing code. Where
this conflicts with anything said about Child/Baon earlier in this
document (including this doc's own "Confirmed business rules" and
"Referrals/Community" sections' passing Child/Baon mentions), **this
section wins.**

### Identity model — the biggest correction to earlier assumptions

- A Child Account is a **full, independently authenticated user** — its
  own `UserID`, own login identifier (email), own password. It is
  **not** a profile record hanging off the parent's account.
- `AccountRole = CHILD` (vs. `STANDARD`/`RIDER`/`MERCHANT`/`ADMIN` for
  primary accounts), plus `ParentAccountID` linking child → the primary
  account that created it. The child logs into the **same** Customer App
  — there is no separate Child app, no separate Parent app, no separate
  Parent role, and no separate Parent authentication system.
- **"Parent" is a relationship, not a role.** The primary account's own
  `AccountRole` never changes when it gains a child — a STANDARD customer
  stays STANDARD after creating a child.
- Backend must expose an **authoritative role field** the frontend reads
  to decide UI — not just a `IsChildAccount` boolean the frontend could
  spoof or misread. A boolean may exist as a convenience, but
  `AccountRole = CHILD` is the real source of truth for gating.

### Child creation — one-shot, parent-driven, no second approval step

Flow: primary account → Profile → Child Accounts → Add Child. The
**primary** fills out the child's registration (full name, email,
password, birthday, gender, municipality, barangay, address, and a
Student Y/N branch — Yes needs student ID/verification, No needs a reason
+ intended use). The child also goes through the standard live
verification/photo process. The primary's confirmation **is** the
authorization — there is no separate child-side accept step and no second
parent-approval-after-creation step. On success: `ChildAccountStatus =
ACTIVE` immediately, nothing pending.

### RAPEX MINI — the child's UI, exactly three nav areas

`AccountRole = CHILD` renders a deliberately minimal UI, not a stripped
version of the full app:

1. **HOME** — browse/search permitted products, product detail, quantity,
   place order, view current Baon balance. Nothing else.
2. **ORDERS** — current order, status, history, purchase details.
3. **CHAT** — child ↔ **their linked primary account only**. No chat with
   riders, merchants, or any other user, and no general social messaging
   for the child role. This is explicitly MVP-scoped — don't build a
   general child-facing chat system.

Explicitly excluded from the child UI: Admin/Rider/Merchant functions,
Parent/Family management, wallet management, child management (of other
children), and "complex business features" generally.

### Parent-side management — no need to ever log in as the child

From the primary's own Profile → Child Accounts: Add Child, View Child,
Allocate Baon, Deactivate, Reactivate (where allowed), Delete/deactivate
per retention rules, View Child Purchase History — all performed as the
primary, never by switching into the child's session.

### Baon — one real wallet, allocations are not sub-wallets

**There is exactly one real wallet: the primary account's.** Children
never have an independent wallet. Track four distinct values, not a
separate wallet entity per child:
- Primary/Parent actual wallet balance
- Child allocated budget
- Child spent amount
- Child remaining budget (= allocated − spent)

**Allocation constraint**: a primary cannot allocate more than their
*currently unallocated* balance (`unallocated = walletBalance −
sum(all existing child allocations)`). Example given: ₱400 wallet with
₱300 already allocated leaves ₱100 unallocated — attempting to allocate
₱200 more must be rejected, not create phantom/negative funds.

### Purchase logic — the exact required sequence, no per-purchase approval

1. Identify the child account placing the order.
2. Resolve `ParentAccountID`.
3. Retrieve the child's remaining Baon budget.
4. Calculate the full order total.
5. Verify child's remaining budget ≥ order total.
6. **Separately** verify the primary's actual wallet ≥ order total (a
   child can have Baon "room" that the primary's real wallet can't
   actually cover — both checks are required, independently).
7. If both pass, atomically: deduct from the primary's real wallet,
   deduct from the child's remaining budget, increase the child's spent
   amount, and create one transaction record linked to Child + Parent +
   Order.

**No per-purchase parent approval is required** — creating the account
and allocating Baon already constitutes the parent's authorization. This
is a deliberate design choice, not a gap: build a notification ("John
placed an order for ₱200"), never an approval gate.

**Two independent failure conditions, both hard-block with zero
deduction** (don't conflate them into one generic "insufficient funds"
error):
- Child remaining budget < order total → block, don't deduct, surface
  something like *"Your RAPEX Baon is insufficient for this order."*
- Primary wallet < order total → block, don't deduct, a separate
  insufficient-wallet state (even if the child's own Baon "room" was
  sufficient).

### Security constraints — must be backend-enforced, not frontend-hidden

A child account must never be able to: modify its own `ParentAccountID`,
modify or increase its own Baon allocation, modify the parent's wallet,
access another child's account, access parent financial controls, or
reach any Admin/Rider/Merchant function. Every one of these needs a real
server-side check on the child's own auth token — frontend route-hiding
alone is explicitly called out as insufficient.

### Data-modeling guidance from the source document itself

Prefer normalized relationships over duplicating financial balances —
i.e. don't store a redundant copy of "child balance" in multiple tables
that could drift out of sync; derive `remaining = allocated − spent` from
transaction history where reasonable rather than caching a value nothing
else double-checks. The feature should integrate with the *existing*
Users/Orders/Wallet/Payment architecture already documented throughout
this file — not stand up a parallel, duplicate system.

### Open questions the source document itself flags as unresolved (don't guess these)

- Exact reactivation rules for a deactivated child (when is it allowed,
  by whom).
- Exact retention rule for deleting vs. deactivating a child account.
- Whether a `IsChildAccount` boolean is actually needed alongside
  `AccountRole = CHILD`, or if the role field alone is sufficient
  everywhere.
- Full index/unique-constraint list — flagged as needing a dedicated pass
  once the table design is finalized, not decided by this rules document.

---

## 10. Rider App Features & Process — from a dedicated founder-provided doc (updates + one unresolved conflict)

Source: `RAPEX_RIDER_APP_FEATURES_AND_PROCESS.docx`, provided directly by
the founder — a purpose-built Rider spec, more detailed than the earlier
Xano-AI summaries on delivery pricing specifically. Where numbers below
differ from section 8, this section is likely the newer/more authoritative
one **except where flagged as an unresolved conflict** — those need a
founder decision, not a silent pick.

### Delivery Fee Engine — precise formula, likely supersedes section 8's "₱50 + ₱10/km"

```
FinalFee = (VehicleBaseRate + AdditionalDistanceCharge) × PeakMultiplier
           × DeliveryTypeMultiplier × WeatherMultiplier
```
- **Vehicle base rate includes the first 2km** (example: Motorcycle =
  ₱49). This is a different number from section 8's generic "₱50 base
  fare" — treat **₱49 motorcycle / first-2km-included** as the real
  figure unless told otherwise.
- **Additional distance**: ₱8/km beyond the included 2km, **excess
  rounded up** to the next whole km (2.8km → 0.8km excess → rounds to 1km
  → +₱8). Also a different rate from section 8's "₱10/km."
- **Peak Multiplier**: Normal ×1.0, Peak ×1.3. Peak windows: **6-8AM and
  5-8PM** (hour ranges, not the "11AM-1PM lunch / 5PM-8PM dinner" example
  given in section 8 — that was explicitly hedged as an example there;
  treat these AM/PM ranges as the real ones).
- **Weather Surge**: Normal ×1.0, Rain ×1.2, Heavy Rain ×1.5 — **admin
  manual toggle**, not automatic weather-API detection. Confirms/refines
  section 8's "Rush Hour traffic adjustment" isn't the same mechanism as
  this — weather and traffic are two separate multiplier sources.
- **Delivery Type Multiplier**: Standard ×1.1, RAPEX Express ×1.2.
- **Worked example** (2.8km motorcycle, peak, Standard): ₱49 base + ₱8
  (1km excess) = ₱57 → ×1.3 peak = ₱74.10 → ×1.1 standard = ₱81.51. (Doc's
  own rounding shows ₱74/₱81 — use unrounded intermediate values, round
  only the final display figure.) A further ×1.2 RAPEX Express example
  shown separately: ₱89.

### ETA Engine — new, not documented anywhere earlier

```
ETA = (Distance × VehicleMultiplier) + Buffer
```
Bicycle: ×5 + 5min buffer. Motorcycle: ×3 + 5min buffer. Sedan: ×4 + 8min
buffer. Worked example: 2.8km motorcycle → 2.8×3=8.4 +5 = **13 min ETA**.

### Discovery radius vs. fee-basis distance — a real distinction to preserve

- **"Glide Radius"**: discovery only — used to find/list nearby riders,
  not for pricing.
- **Google Maps Route distance**: the actual delivery-fee basis and
  actual operational distance — a real road-route calculation, separate
  from whatever radius search found the candidate riders.
This refines section 8's "2km dispatch radius" — that radius is for
finding candidates (Glide Radius), while the fee itself is computed from
real route distance, not the discovery radius.

### ⚠️ Unresolved conflict — proximity/contact-unlock distance (do not implement any of these until confirmed)

Three different numbers now exist across sources for "when does the other
party's contact info unlock":
- **150m** — confirmed multiple times, independently, across several
  rounds of the Xano business-logic deep-dive (section 8), for both
  directions (rider-to-merchant and merchant-to-rider).
- **500m** — this doc's "Anti-Bypass Flow" section: "After Rider leaves
  500m from merchant: Customer contact info appears."
  Note this is leaving-merchant distance, not rider-to-customer distance.
- **50m** — this same doc's later "Contact Unlock Flow" section: "Once
  rider reaches: 50 meters away from merchant THEN user information
  unlocks."

**This document contradicts itself** (500m vs. 50m in two different
sections), on top of disagreeing with the independently-confirmed 150m
from the Xano side. Do not pick one — this needs the founder to confirm
the actual intended number directly before any implementation.

### Vehicle types — scoped to personal/local riders (3 types), narrower than section 8's 6

This doc: Bicycle, Motorcycle, Sedan/Hatchback only. Section 8's Hardware/
Agriculture rules referenced 6 classes including ELF/Van for heavy cargo —
likely because ELF/Van belong to a separate heavy-logistics vehicle pool,
not the personal Rider App's own registration options. Treat as
consistent scoping, not a conflict.

### Rider status — 4 states in one field (Offline/Online/Busy/Suspended)

This doc folds Suspended into the same status field as Offline/Online/
Busy. Section 8 modeled `availabilityStatus` (offline/online/busy) as
independent from account-level verification/suspension status. Worth
confirming whether Suspended is really the same field as availability, or
this doc is simplifying two fields into one list for readability.

### Rider earnings minimums — new

Suggested per-delivery minimums: Bicycle ₱30, Motorcycle ₱40, Sedan ₱60.

### Merchant Checkout vs. Global Checkout — a real dispatch-architecture question to reconcile with section 8's "child orders" model

This doc describes **two structurally different checkout/dispatch paths**:

- **Merchant Checkout** (single-store cart): single rider, direct
  merchant→customer delivery, fast/rapid by design. Matches section 8's
  basic order flow.
- **Global Checkout** (multi-store cart): a **materially different**
  model from section 8's "splits into independent Child Orders, each
  separately dispatched." Global Checkout instead offers three tiers:
  - **Economy**: batching allowed, a rider may collect from several
    merchants and drop at a **local Hub** first; same-day/24hr ETA,
    flexible timing, for non-urgent/multi-store orders.
  - **Standard**: ×1.1 multiplier, single rider possible with multi-stop
    pickup allowed.
  - **RAPEX Express (Global)**: ×1.2, priority dispatch, minimal
    batching.
  - Same-area multi-merchant: **one rider collects from all nearby
    merchants** in one trip. Different-area multi-merchant: zone-split,
    nearest rider per zone, routed through a hub/transfer point, final
    rider completes to customer.

**This needs reconciling, not silently merging**: section 8 describes
every multi-store cart splitting into fully independent per-store Child
Orders (implying independent dispatch per store). This doc describes a
single rider potentially handling multiple merchants' items in one
consolidated trip, with a Hub/relay system for cross-zone cases. Confirm
with whoever owns this decision whether "child orders" are still
independently dispatched-and-tracked but can be *fulfilled* by one rider
in one trip (compatible), or whether Global Checkout genuinely replaces
the child-order model for multi-store carts (a bigger architectural
change). Don't assume either answer.

### Anti-bypass / information-hiding (complements, doesn't conflict with, the chat_leakage_filter in section 8)

Before pickup, rider sees merchant info + delivery pin only — **no
customer phone, photo, name, or chat access at all**, not just chat-text
filtering. Customer cancellation is disabled the moment the rider picks up
the item (protects rider effort + merchant inventory prep). This is a
second, complementary anti-bypass layer (withhold the data entirely) on
top of section 8's chat_leakage_filter (scan messages once chat *is*
open) — both apply, they're not alternatives.

### Pilot areas (confirmed, matches this project's own earlier Cavite pilot-area context)

Imus, General Trias, Kawit.

---

### Map Fencing / Phased Geofencing (new — the actual expansion rollout mechanism)

- `geofences` table stores zone polygons per phase (example: "Phase 1:
  Municipality A"). Every order passes `check_geofence` (reinforces
  section 8's geofence mention, now with the real table it reads from).
- **"Coming Soon" UX**: a user whose coordinates fall in a defined-but-
  inactive Phase 2 zone sees "We haven't reached you yet, but we're
  coming soon! 🚀" with checkout disabled — a real, specific product
  string worth reusing verbatim, not paraphrasing.
- **100km cross-phase exception**: local delivery stays within 10km (per
  section 8's service radius), but **Marketplace-category items can ship
  between Phase 1 and Phase 2 zones via Hub-to-Hub logistics** up to
  ~100km — a real, deliberate exception to the "local only" default,
  specific to the Marketplace vertical.

### Store Launch Readiness (adds detail to the earlier "100% Rule")

Checklist to reach 100%: KYC (identity verified), Financials (bank/payout
details set), Operations (hours + GPS pinned), Inventory (**at least 3
approved products with photos** — a real minimum-catalog-size gate not
mentioned before). **Two-step gate, not one**: even at 100% checklist
completion, the store stays inactive until Super Admin manually toggles
`verified` — automatic checklist completion is necessary but not
sufficient.

### Reviews — exact double-blind mechanic + a data point on the earlier XP discrepancy

- **Real mutual-blind mechanic** (more precise than "double-blind" alone):
  a Customer's review of a Rider is **hidden from that Rider specifically
  until the Rider also submits their own rating of that Customer** — a
  reveal-on-mutual-submission gate, not just two independent one-way
  ratings existing in parallel.
- **10 XP per review** stated here again — this is the second independent
  mention of 10 XP (the other being the double-blind Ratings subsection
  earlier in section 8), against a single earlier mention of 50 XP in the
  Gamification subsection. This shifts the weight of evidence toward 10
  XP, but per this document's own discipline, still confirm directly
  rather than resolve by majority count.
- **QR referral mechanic, real detail**: `qr_codes` table, one
  `referral_id` per user, QR payload is a **signed token** — scanning it
  auto-binds the new user as a "Referred Child" in the `referrals` table.
  Adds the signed-token detail to the earlier `referral_id`/`qr_payload`
  mention.

### PayMongo — the pending-order + timeout mechanics

- On PayMongo checkout initiation, order status moves to
  `merchant_pending` while the **wallet stays at 0** — the order record
  advances to a pending state, but no money moves and the merchant isn't
  told to start preparing yet.
- **The webhook remains the actual trust boundary**: only
  `payment.paid` moves funds into the wallet and alerts the merchant —
  consistent with, and now more precise than, the earlier-confirmed
  "never trust a redirect, wait for webhook" rule.
- **30-minute session timeout**: an incomplete PayMongo session
  auto-expires the order and releases the merchant's reserved inventory —
  a concrete, previously-undocumented timer.

### Soft Delete + Ban discipline

- **Soft delete only**: deleting a store or user never removes the DB
  record — toggles `active: false` + sets `deleted_at`, keeping financial/
  audit history intact. Applies platform-wide, not just to one entity
  type.
- **Automated ban triggers, exact thresholds**: `account_status:
  suspended` fires automatically for Rider Rating < 3.5 (reinforces
  section 8), **Merchant Cancellation Rate > 20%** (new, concrete
  threshold), or Leakage-Filter-detected spam (reinforces section 8).
- **Permanent contact blacklist**: once an email or mobile number is tied
  to a banned account, **that specific email/mobile is permanently
  blocked from any future signup** — not just that account being banned,
  the contact info itself becomes unusable platform-wide going forward.

### Delivery Returns (new — not covered anywhere earlier in this document)

- **Fresh Goods**: `returnable: false` — a failed delivery is never
  refunded; rider is instructed to Dispose/Keep per Admin policy (matches
  the earlier-documented Wet Market no-return-on-spoilage framing, now
  extended to failed-delivery specifically, not just post-purchase
  disputes).
- **Standard Goods**: 24-hour return window starting at
  `delivered_completed`.
- **⚠️ Nuance worth reconciling, not silently merging**: a **24-hour
  merchant payout hold** applies specifically to Standard Goods, "to
  ensure funds are available for a potential refund." This sits alongside
  section 8's confirmed rule that the atomic Split Engine fires
  *immediately* at `delivered_completed`. Most likely reading: the split
  still fires immediately, but the merchant's *share* lands in a held/
  non-withdrawable state for 24h on Standard Goods specifically (same
  held-balance mechanism used for the customer-side escrow elsewhere in
  this document) — but confirm this directly rather than assume; it's
  also possible the payout itself is deferred rather than instant-but-held.
- **Rider-to-Store return flow**: if the customer is unreachable, the
  rider clicks "Return to Store" — **the rider's own delivery fee is only
  released once the Merchant confirms receiving the returned package** —
  a real payment-gating condition tied to merchant confirmation, not just
  the rider's own claim of having returned it.

---

## 11. Infrastructure, Supply Chain, Data History & Governance — the remaining rules (the source document's own words: "this now represents 100% of the logic")

### Platform Infrastructure

- **Error Logging**: every 500 error auto-caught into an `error_logs`
  table with `request_id` + `stack_trace` — this is the actual mechanism
  behind the earlier-documented "Emergency Fix" God-Mode logic, not a
  separate system.
- **Bug Tracker**: a dedicated `bug_tracker` table — UI bugs from any app
  logged with `device_id`, `app_version`, `severity`; only Admins can mark
  `resolved`.
- **Server Monitor auto-throttle**: if Database, OpenAI, or Maps shows
  `DOWN`/`DEGRADED` in `server_monitor`, high-resource endpoints (example
  given: Bulk Upload) are **automatically throttled** — a real
  self-protective circuit-breaker, not just an alert.
- **IP ban expiry is mandatory**: `blocked_ips` entries always carry an
  `expires_at` — **no permanent IP bans**, since ISPs recycle public IPs
  and a permanent ban would eventually punish an innocent future user of
  that address. Don't implement an "infinite ban" option even as an admin
  convenience.

### Deep Inventory & Price Control

- **Inventory history**: any manual stock adjustment (Admin or Merchant)
  must log `old_stock`, `new_stock`, and a `reason` enum (Sale, Damage,
  Restock, Return) to `inventory_history` — every adjustment is
  reason-coded, not a bare number change.
- **Price history**: every price change on a product/variant logs to
  `price_history` with `changed_by_user_id` — explicitly framed as
  protection against merchant price-gouging during peak-demand windows,
  tying directly to the Peak Multiplier system in section 10.
- **⚠️ Bulk CSV upload — corrects an assumption made earlier in this
  document's Batch 7 spec**: this confirms **transactional all-or-nothing**
  validation — one invalid `category_id` anywhere in a 100-row CSV
  **rejects the entire upload**, not a partial import. This conflicts with
  the `ProductImportResult { imported: [...], failedCount }` shape assumed
  in the earlier Merchant Xano-spec batch (which implied partial success
  was acceptable) — **use all-or-nothing semantics**, not partial-import,
  when this gets built for real.

### Hub-to-Hub Logistics Manifests (new — the real mechanism behind the earlier-mentioned Hub system)

- Long-distance (municipality-to-municipality) orders group into a
  `logistics_manifest`.
- **Only a `COLLECTOR` role** (a role not mentioned anywhere else in this
  document — confirm whether this is a Rider sub-type, an Admin-assigned
  duty, or a genuinely separate account role before implementing) can
  Close and Depart a manifest.
- **Sequential integrity enforced server-side**: a manifest can't be
  marked arrived at the destination hub until `departed_at` is actually
  set — can't skip the departure step.
- Hubs have their **own operating hours**, independent of store hours.
  **"3 PM Cutoff"**: a hard-coded consolidation deadline for next-day
  municipality transfers — orders after 3PM roll to the next day's
  manifest.

### Session & Device Governance

- **Multi-device**: a user can be logged in on multiple devices
  simultaneously; each device tracked separately in `user_devices` with
  its own `push_token` — push notifications target specific devices, not
  a single per-user token.
- **Admin session lockout, exact mechanic**: `admin_sessions` tracks
  `timeout_events`; **3 inactivity-triggered auto-logouts within one
  hour locks the session entirely**, requiring a fresh password login (not
  just re-authenticating a token) — a real escalation beyond a single
  timeout. This is the precise mechanic behind the earlier-documented
  "Randomized Inactivity Checks / counts Inactivity Events" description —
  now with the actual threshold (3 events / 1 hour) and consequence (hard
  session lock, not just re-timeout).
- **Forced app updates**: backend checks an `app_version` request header;
  on a critical security patch, Xano returns **HTTP 426 Upgrade
  Required** to force the client to update before continuing — a real,
  specific status code to implement, not just "show an update prompt."

### Messaging & Support (new — a typed system, not one generic chat)

- **Three distinct thread types**: `ORDER_CHAT` (Buyer↔Rider, matches the
  earlier-documented Active-Order-only chat rule), `MERCHANT_SUPPORT`
  (Buyer↔Merchant), `SYSTEM_TICKET` (User↔Admin) — these are separate
  conversation types, not one unified inbox with different participants.
- **Role-targeted Help Center**: `help_center` articles are tagged by
  `target_audience`; REX's own help-search tool only returns Rider
  articles to a user who actually holds the RIDER role — content
  filtering happens server-side based on real role, not client-side
  category selection.
- **Read receipts**: `is_read` boolean + `read_at` timestamp on every
  message — the standard double-checkmark UI pattern, backed by real
  per-message state.

### Regional Master Data (PSGC) — see also the ID-format correction above

All location master data (`location_regions`, provinces, etc.) follows
the real **Philippine Standard Geographic Code (PSGC)** standard, not an
internal-only numbering scheme — worth using an actual PSGC reference
dataset when building the Django `addresses` app's location tables,
rather than inventing region/province/municipality/barangay IDs from
scratch. This is also what unblocks the Locations gap flagged as
highest-priority earlier in this document (section 8's Admin Locations
subsection, and the Django `addresses` app noted as already having a real
migration in the Production Readiness Audit).

---

## Source documents this summary distills (still in this repo if deeper detail is needed)

- `docs/business/AdminEndpoints.md` + `AdminEndpoints-Batch2.md` through
  `Batch7.md` — full field-level request/response shapes for ~90 Admin/
  Super Admin/Merchant endpoints (paths are Xano-specific and moot now, but
  the field shapes are a real reference for Django serializer design).
- `docs/business/CustomerRiderEndpoints.md` + `-Batch2.md` — same for
  Customer and Rider.
- `docs/business/Delivery.md` — full 150m Security Rule mechanics and
  Delivery Fee Engine settlement flow.
- `docs/api/README.md` — the original frozen Xano contract (paths/headers),
  useful mainly as a historical record of what was actually agreed vs.
  guessed.
