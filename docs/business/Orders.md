# Orders

Business rules for Orders — Food/Fresh and Non-Food ordering, Save List,
Express Cart, multi-merchant Master Orders, rider assignment, privacy
rules, cancellation, delay handling, and settlement.

## Status
**Received, not independently verified.** Pasted by the founder
2026-08-18 as a planning/spec document (source: a ChatGPT/ideation
session, not yet confirmed against live Xano). This is the reference
spec for building the real Order Engine — review only for now, no
implementation has started from this doc yet.

---

## 1. Core ordering principle
RAPEX has two primary ordering paths: **Food/Fresh** and **Non-Food**.
Food/Fresh uses a Grab/Foodpanda-style immediate ordering experience.
Non-Food supports both Rapid Express (Deliver Now) and Standard Delivery
(Deliver Later).

## 2. Customer discovery — common flow
Customer browses by product category, searches stores/products, filters
by municipality/city (e.g. Kawit, Imus, Dasmariñas). Store view shows
cover photo, name, hours, location, distance, ETA, rating, categories,
products. Inside a store, products filter by category/brand. Product
Detail is a minimal marketplace-style screen: info, variants, Save List,
Buy Now/Add to Cart, Inquire Wholesale where applicable.

## 3. Non-Food — Save List
Non-Food products can be saved for later, organized by store. Customer
opens a store's saved products, selects individual items via checkboxes
— only selected items move into checkout, unselected stay saved. Saved
Non-Food products move into the common Express Cart for purchase.

## 4. Food/Fresh — Express Cart
Food/Fresh uses the Express Cart directly (does not use Save List as a
holding area) — immediate ordering, familiar Grab/Foodpanda pattern.
Food/Fresh cart items are **time-sensitive**:
- ~3 hours: notify the customer food remains in the cart.
- 5 hours: auto-remove expired Food/Fresh cart items so the customer can
  re-check availability with the merchant.

Food/Fresh normally creates a **separate Order ID per merchant**. Food
merchants may auto-merge into one order only when the approved proximity
rule is satisfied (discussion target: 500 meters). Otherwise, separate
merchant Food Order IDs.

## 5. Express Cart — shared UI, separate identities
Food/Fresh and Non-Food may appear in the same Express Cart interface but
retain separate order identities and lifecycle rules. The cart can show
Food Order ID and Non-Food Order ID separately. Cancelling a Food Order ID
only cancels that Food order under Food cancellation rules — Food and
Non-Food are never merged into one child order just because they're in
the same cart UI.

## 6. Checkout — Non-Food
Select products → delivery location → delivery type (Rapid Express /
Standard Delivery) → review breakdown → apply voucher/coupon → see
delivery fee(s) → select payment method → place order.

## 7. Rapid Express — Deliver Now
Urgent/immediate mode. Multiple stores generally each get the nearest
eligible rider (3 stores → up to 3 delivery assignments/rider searches).
Vehicle filtering applies (bicycle-only, motorcycle-only, or any/random
competing). Auto-Pick nearest rider gets priority after merchant
confirmation; if unavailable, eligible riders can Accept/Decline/Ignore.
Rider selection respects route/distance feasibility — a customer can't
force one rider onto stores too far apart for the consolidation rule.
Delivery fee calculated per delivery/route by the delivery engine.

## 8. Standard Delivery — Deliver Later
Non-urgent logistics mode, target window **< 24 hours**. Fee calculated
from route, fixed for the assignment per the active fee engine. A rider
may accept one store, multiple stores, or all stores when route/distance
allows — discussed grouping rule: stores within ~1km may be grouped for
one rider; outside that range needs another rider. Example: Store 1=₱50,
Store 2=₱130, Store 3=₱80 — a rider may take all three if the route
permits, or only eligible ones, with the rest offered to another rider.
Not a food-delivery substitute — Food/Fresh stays immediate.

## 9. Multi-merchant Master Order
One checkout may span multiple merchants, but each merchant gets an
**independent child order**:
```
Master Order (customer-level grouping)
├── Child Order 1 → Merchant/Store 1
├── Child Order 2 → Merchant/Store 2
└── Child Order 3 → Merchant/Store 3
```
Each child order keeps its own products, merchant status, rider
assignment, delivery fee, commission, settlement, lifecycle. Customer
sees one combined checkout total; system maintains separate operational
orders. Example: 3 stores × ₱100 delivery = ₱300 total delivery fee — if
one store has free delivery via voucher, only that fee zeroes out, the
others remain.

## 10. Merchant order receiving
Order created → sent to merchant → merchant accepts → prepares → confirms
ready for pickup. Status flows back to customer/rider through the order
lifecycle. A merchant must never see another merchant's orders.

## 11. Rider assignment
Eligibility: vehicle type, availability, location, Auto-Pick status,
route feasibility. After merchant confirmation, system searches nearest
eligible rider; Auto-Pick riders get priority where applicable. If no
Auto-Pick rider accepts, eligible riders can manually accept/decline. A
rider can accept multiple Standard Delivery assignments only when
route/grouping rules permit. Rapid Express generally prioritizes separate
nearest-rider dispatch per store.

## 12. Customer/rider privacy during preparation
While merchant is preparing: rider does NOT get the customer's full
contact number; while rider travels to the merchant, customer does NOT
get the rider's private number. Customer sees permitted profile info
only. During preparation, customer sees a static/limited state, not
unrestricted live rider/customer info.

## 13. Rider dispatch and privacy trigger
After merchant marks ready and rider begins delivery, order enters the
delivery phase — customer private details stay protected until the
approved trigger point. Discussed trigger: **~100–150 meters** from the
merchant/customer, at which point rider gets contact/chat capability and
customer gets the rider's live location. **Trigger distance must be
configurable, not hardcoded.**

## 14. Delivery completion
Rider arrives → completes delivery confirmation → status becomes
Delivered/Complete → customer sees completion, Admin sees completed
status → settlement/commission/rider earning calculations run via the
active Formula Engine (see `Commissions.md`).

## 15. Standard Delivery delay rule
Customer-protection mechanism: if the product stays with the rider beyond
**24 hours**, the customer's remaining delivery fee decreases **₱5 every
20 minutes**. This ₱5 reduction is **never RAPEX revenue** — it's for
customer protection/goodwill on excessive delay. The rider can see the
remaining delivery-fee/late-delivery state for transparency. If the fee
reaches ₱0 and the order is still undelivered, it becomes a failed
delivery/cancellation per the final settlement rule.

## 16. Rider liability for failed delivery
A customer should never pay for a product a rider accepted but never
delivered. Failed-delivery caused by rider non-delivery after acceptance
triggers rider liability per the approved penalty/settlement policy —
**separate** from the customer's late-delivery fee reduction (which never
becomes RAPEX income). Exact liability % and wallet deduction mechanics
remain configurable via the settlement/Formula Engine.

## 17. Customer cancellation
Allowed while the current order state permits it; once in
delivery/on-the-way state, cancellation becomes disabled. Cancellation
before the protected delivery stage, when the rider isn't at fault, may
carry a cancellation penalty (RAPEX Wallet or approved instant payment) —
recorded separately from merchant commission/rider earnings. If
merchant/rider is responsible for the failure, no customer-fault penalty
applies.

## 18. No rider available
Customer is informed; for urgent orders, offered to keep waiting or
change/cancel. System may expand rider search radius when the rule
allows. A special rider incentive may encourage acceptance of stalled
orders — recorded as a reward/points/incentive, never confused with
normal delivery commission. The discussed "Admin force-assigns after
~12 hours" is an operational escalation rule — must stay configurable,
must never lock the rider's phone or block unrelated app use.

## 19. Change Store
Choosing another store for an unavailable/stalled product cancels the
current order per the approved cancellation state. Customer searches
another store and places a new order — the replacement does **not**
inherit Deliver Later; discussed rule: replacement becomes Deliver
Now/Rapid Express. New store starts a new order lifecycle; it never
silently mutates the historical cancelled order.

## 20. Food vs. Non-Food separation
Food/Fresh: strictly time-sensitive, immediate delivery only. Non-Food:
broad marketplace/logistics engine, Rapid Express or Standard Delivery.
Food must never be forced into the Standard 24-hour logistics process.

## 21. Vouchers / Free Delivery
Evaluated at checkout. A Free Delivery voucher can zero an eligible
delivery fee. For multi-merchant checkout, the voucher must specify scope
(one store / selected stores / eligible order scope). The **original**
delivery fee stays in the transaction record for audit/settlement even
when the customer pays ₱0.

## 22. Commission / Markup / Revenue engine
See `Commissions.md` for the full Formula Engine spec. Commercial
calculations must be driven by the Super-Admin-controlled Formula Engine
— never hardcoded into frontend screens.

## 23. Settlement after delivery
Records: product subtotal, markup amount, customer discount/coupon,
delivery fee + any delivery discount, merchant commission, merchant net
settlement, rider delivery earning, rider incentive/reward, RAPEX
platform fee, other configured adjustments, final customer amount, final
settlement status.

## 24. Order status model
`Draft/Cart → Order Placed → Merchant Pending → Merchant Accepted →
Preparing → Ready for Pickup → Searching Rider → Rider Assigned → Rider
Confirmed → On the Way to Merchant → Picked Up → Out for Delivery →
Delivered/Completed`, with `Cancelled`, `Failed Delivery`, `Expired` as
terminal/exception states.

## 24a. Alpha launch scope lock (2026-08-20, via GPT reconciliation)

Decided in response to Xano's "MVP Feature Complete" report, to keep
Sept 1 realistic instead of treating every reported/planned feature as a
launch requirement.

**Rider COD remittance — conditional, resolve before launch if in
scope.** `RiderRemittanceRecord` (see `Wallet.md`) means the data model
already anticipates cash handling, but Xano's report does **not**
confirm the full remittance workflow is production-ready. Decision:
- If Alpha supports COD: **must** have the complete cycle working and
  tested — `Customer pays Rider → Rider receives cash → Rider
  remittance record → Rider submits cash → Admin verifies → Wallet/
  account reconciliation → Remittance complete`. Do not launch COD with
  only the order engine and no verified cash reconciliation.
- **Recommended default**: Alpha launches wallet/e-wallet-only (no
  COD), deferring the remittance workflow to Beta — lower operational
  risk. Treat COD as off unless the full cycle above is explicitly
  confirmed built and tested.

**Background-worker-dependent rules — conditional on the Xano plan
upgrade.** Xano reports the Food cart expiration (§4, 3h/5h) and
Standard Delivery late-fee reduction (§15, 24h/₱5-per-20min) logic is
implemented but requires a paid background-task tier to actually run.
Decision: if these rules are part of the Alpha promise, approve the
upgrade. If not approved by launch, **explicitly disable/defer them in
the UI** — never ship an interface that promises automated behavior the
backend can't yet execute.

**What Xano's report does and doesn't retire from the production
readiness audit**: it moves Order/Formula/Wallet/Auth/KYC/Identity/
Order-state-machine/Audit-logs backend work from "missing" to "backend
reportedly complete, integration/verification still required" — it does
**not** retire frontend↔Xano integration, live Maps, payment E2E, full
E2E testing, production deployment, or load/stress testing as launch
blockers. See `docs/deployment/production-readiness-audit.md`.

**Operating principle for the remaining runway**: connect → test → fix
→ deploy, not build another engine/feature/tab. The backend is
reportedly ready; the next milestone is proving the existing RAPEX apps
can actually use it end-to-end, not expanding scope further.

## 25. Order data integrity
Every child merchant order has its own Order ID; Master Order groups
child orders for one checkout. Historical product name/variant/price
snapshots are preserved (never mutated by later product edits). Order
status changes and delivery assignment changes are auditable. Commission/
fee calculations must be reproducible from stored transaction inputs. No
frontend-only financial calculation is authoritative — **server-side
(Xano) logic is the source of truth.**

## 26. Core Xano implementation rule
Before implementing any part of the Order System: inspect existing Xano
tables/endpoints/business logic first. If an existing API/table already
performs the same or similar function, **update/extend** it — do not
create a duplicate API, do not delete existing APIs, do not create
duplicate ID fields conflicting with Xano's native ID. Use Xano's native
`id` internally and RAPEX `rapid_code` for RAPEX-facing identifiers (see
`docs/database/data-dictionary.md` for the full ID-format rule).

## 27. Claude / Codex / Xano responsibility split
- **Claude**: React Native integration and polish; preserve working
  order/auth/navigation logic; consume approved backend contracts.
- **Codex**: Web/Admin/Merchant UI and state presentation; does not
  invent financial/order business logic that belongs to Xano.
- **Xano**: authoritative order state machine, delivery eligibility,
  calculations, commissions, settlement, permissions, validation, audit
  history, API contracts.

All clients must display server-authoritative order status and totals —
never compute financials client-side.

## 28. Final flow — one-page summary
```
CUSTOMER → DISCOVER PRODUCT → STORE → PRODUCT DETAIL → CART/SAVE LIST →
CHECKOUT → DELIVERY TYPE → ADDRESS → VOUCHER → PAYMENT → MASTER ORDER →
CHILD MERCHANT ORDER → MERCHANT ACCEPT → PREPARE → READY → RIDER SEARCH →
RIDER ASSIGNMENT → PICKUP → DELIVERY → CUSTOMER/RIDER PRIVACY TRIGGERS →
DELIVERED → SETTLEMENT → COMMISSION/MARKUP/FEES → RIDER EARNING →
COMPLETE.
```

## 29. Still configurable / not finalized
- Exact final 100–150m privacy trigger implementation.
- Exact rider cancellation penalty percentage.
- Exact customer cancellation penalty schedule.
- Exact tax/VAT treatment.
- Exact coupon subsidy responsibility.
- Exact 12-hour forced rider escalation mechanics.
- Exact rider incentive values for stalled orders.
- Exact final Formula Engine mathematics for every edge case.
- Exact food merchant 500m merge implementation if technical constraints
  require a different routing mechanism.
- Exact Standard Delivery multi-store optimization algorithm.

## Implementation master prompt (for when this is actually built)
Use this doc as the source of truth for the approved RAPEX Order System.
Implement the complete Food/Fresh and Non-Food ordering lifecycle
(discovery, Save List, Express Cart, Food Order IDs, Rapid Express,
Standard Delivery, Master Order + child orders, merchant states, rider
search/Auto-Pick/manual accept, vehicle eligibility, pickup/delivery,
privacy rules, live location trigger, cancellation, Change Store,
no-rider escalation, late-fee reduction, rider liability, vouchers/Free
Delivery, commission/markup/platform fees/rider earnings/incentives,
final settlement, full audit history) per the sections above. Do not
hardcode commercial rules — use the Formula Engine (`Commissions.md`).
Follow the Xano non-duplication rule (§26) strictly. After implementing,
report: existing structures reused, existing structures updated, new
structures genuinely required, APIs reused/extended, new APIs genuinely
required, formula rules added/updated, order status transitions
implemented, remaining unresolved decisions.
