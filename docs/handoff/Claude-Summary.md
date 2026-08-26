# RAPEX — Claude Handoff Summary

Written at the point of pivot from this repo (rapex-mvp, Xano-based) to the
new path (`D:\JED\RAPEX_MVP`, Django + Next.js + Expo). This captures the
project rules, business logic, and domain knowledge accumulated here so
none of it needs to be rediscovered or reverse-engineered from code in the
new stack. It complements, not replaces, `docs/handoff/WebCodex-Summary.md`
and `docs/handoff/RNCodex-Summary.md` (screen-by-screen UI inventories) —
this one is rules and logic.

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

### ID format convention (per role)

Confirmed format: `USR-<RegionCode>-<MunicipalityCode>-<SerialNumber>` (e.g.
`USR-72726-000001` / the Partnership section's shorthand example
`USR-72726-001`) — a branded, human-readable display ID separate from the
internal DB primary key, used for display/receipts/support/referral-link
identification only, never for joins. Only the `USR-` (User/Customer)
prefix is confirmed with this exact structure — other roles likely follow
the same `<PREFIX>-<Region>-<Municipality>-<Serial>` shape (mock data
elsewhere used `MID-00142` for merchants, `RIDER-1` for riders) but treat
those as unconfirmed until Xano verifies the real prefix per role.

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
