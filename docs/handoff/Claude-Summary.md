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

**One real gap**: this project also had a **Services/Provider** role
(freelance/services listings, separate from Merchant) that has no
equivalent anywhere in Jed's five-role model. Surfaced in: a standalone
`provider-portal` app, and the Rider app's "Category" tab (Auction /
Partnership / Services & Freelance / Rewards as rider-facing opportunity
types). This needs a product decision — fold into Merchant, add as a sixth
role, or drop from MVP scope — before any code targets it.

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
