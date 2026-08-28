# RAPEX Order Engine — Master Business Flow + Frontend Implementation Specification

Founder-provided build specification for the full order lifecycle,
Discovery → Delivery → Completion → Admin Monitoring. Preserved close to
verbatim (not summarized) because it's structured as a literal, phased
implementation guide — compressing it would defeat its purpose. Cross-
reference `docs/handoff/Claude-Summary.md` for the underlying business
rules (proximity thresholds, order state machine, wallet/settlement
logic, etc.) this spec builds on top of.

**Core discipline, stated repeatedly throughout the source**: reuse
existing RAPEX auth/merchant/rider/store/product/wallet/delivery/Xano
architecture wherever it already exists. **Never duplicate a backend
system. If a required API contract doesn't exist, report it as a missing
contract — do not invent a parallel implementation.** This is the same
"don't guess an unconfirmed contract" rule this whole handoff has held to
throughout.

## Purpose

Connect: User → Store Discovery → Product Discovery → Store → Product →
Save List → Checkout → Merchant → Rider Assignment → Delivery → Customer
→ Completion → Admin Monitoring.

---

## 1. Product / Store Discovery
Browse by: store category, municipality/city, store, product, brand,
product category, or search. Example categories: Sari-Sari Store,
Hardware, Pharmacy, Pet Shop, Wet Market, Korean Mart, Frozen Food.
Selecting "Hardware" shows relevant hardware stores near the user (e.g.
JLEX Hardware, Rainbow Star Hardware, KLF Hardware).

## 2. Location-Aware Store Discovery
Default to the user's current location where permission is granted, using
the existing RAPEX distance logic. The user can also explicitly browse
another municipality (e.g. "Hardware in Kawit") via a location filter —
**do not require the user to physically be in that municipality** to
browse its stores.

## 3. Product Search Across Stores
Searching a product (e.g. "Plywood") can return matches grouped by store,
narrowable by store category, municipality, store, product category, or
brand.

## 4. Store Opening
Store header on open: cover photo, logo, name, Open/Closed status,
opening hours, location, distance, ETA where available, rating.

## 5. Store Page
Category tabs sourced from the store's own registered
products/categories (not a global taxonomy) — e.g. All / Paint / Nails /
Wood / Plywood / Tools / Hardware / Electrical.

## 6. Brand Filter
Filter products by brand within a category (e.g. Paint → Boysen / Davies
/ Rain or Shine). Never show inactive products.

## 7. Product List
Card: image, name, brand, variant info, price/starting price,
availability, rating. Action: View Product.

## 8. Product Detail
Clean minimal marketplace UI, RAPEX-branded. Shows images, name, brand,
description, price, variants, availability, store, store location, store
rating. Actions: **Save**, **Buy Now**, **Inquire Wholesale**.

## 9-11. Save List (a genuinely new feature — replaces/supplements a live cart with a persistent, store-grouped wishlist)
"Save List" is the user's saved shopping list, not a live cart. Tapping
Save adds a product to it, still associated with its originating store.
The Save List home groups by store (e.g. "JLEX Hardware — 1 saved
product"). Opening a store's saved group shows a **checkbox list** — the
user selects only what they want to buy right now; unselected items stay
in the Save List, **never auto-removed**.

## 12. Store-Based Checkout — a hard single-store constraint per checkout
Checkout must maintain store context: **selected products must belong to
the same store.** Never silently combine products from different
stores/merchants into one merchant order — if the user has selections
across multiple stores, handle each as its own separate checkout/order
context (consistent with, and sharper than, the "splits into independent
Child Orders per store" model already documented in the main rules doc).

## 13-19. Checkout Screen
Single streamlined screen, in this order: Delivery Location → Delivery
Type → Order Breakdown → Voucher → Payment → Total → Place Order.
- **Delivery Location**: saved address or another registered location,
  via the existing RAPEX address system.
- **Delivery Type**: only show types the existing delivery system
  actually supports — never invent a delivery type in the UI.
- **Order Breakdown**: store, products, variants, quantity, item price,
  subtotal, delivery fee, discount, voucher, total.
- **Voucher**: only apply eligible, non-expired vouchers via existing
  voucher rules; update total immediately on apply.
- **Payment**: only show methods the existing payment architecture
  supports — never invent a new gateway.
- **Place Order**: validate delivery location, delivery type, products,
  availability, price, voucher, and payment *before* submission, then
  create the order via the existing order backend contract.

## 20-22. Order Creation → Merchant Acceptance
Order carries user, store, merchant, products, variants, quantities,
prices, delivery location/type, payment, voucher, total, and status.
Merchant sees a New Order screen (order number, customer, items,
quantity, total, delivery type, time created) with Accept/Reject actions,
using the existing merchant acceptance rules. On accept, status moves to
Preparing; customer sees "Your order is being prepared."

## 23-27. Rider Discovery, Vehicle Filter, Auto-Pick, Manual Acceptance, Confirmation
Rider matching factors: merchant location, rider availability/online
status, auto-pick status, delivery-type/vehicle requirement. **Vehicle
filter is a hard constraint** — a Bicycle-only order only considers
eligible bicycle riders, never overridden by the matching engine.
Auto-Pick: an online rider with auto-pick enabled, the right vehicle,
available status, and in-area gets directed the order automatically,
nearest-eligible-first. Without an applicable auto-pick rider, the order
becomes visible to eligible riders in their Order tab (Accept/Decline/
Ignore) — **ineligible vehicle types must never see the order at all**,
not just be blocked from accepting it. On rider confirmation, customer
sees "Your order is being prepared" (same copy as merchant-acceptance —
the customer doesn't get a separate "rider found" message at this stage
per this spec).

## 28-29. Privacy State — Preparation
**During preparation, before the privacy threshold**: rider must not see
any customer private details (account, contact, personal info); customer
must not see rider private details (contact, account, location) either.
Customer UI shows an operational state like "Preparing your order," not a
literal live map. Rider sees only the merchant/store info needed for
pickup — no unnecessary customer data.

## 30-31. Merchant Preparation Complete → Rider Delivery Start
Merchant taps "Order Ready/Complete" (use the exact backend status term
if one is already established) → order moves to rider delivery stage,
customer sees "Your order is ready and is now being delivered." Rider
taps "Start Delivery" → status becomes In Transit, customer sees "Your
order is now on the way."

## 32-35. Delivery Privacy Rule + Proximity Trigger (adds a 4th data point to the unresolved proximity conflict already flagged in the main rules doc)
**Starting delivery does not by itself unlock customer privacy** — the
rider still can't see customer contact/account details or message the
customer until the proximity threshold specifically fires. This spec
states the threshold as **"approximately 100–150 meters... according to
the actual GPS/geofence implementation... the exact threshold must be
implemented according to the final authorized backend rule."** This
source explicitly declines to assert a final number — it's the *fourth*
distinct value now associated with this rule across all sources in this
document (150m confirmed independently multiple times, 500m and 50m from
the dedicated Rider App doc, and now "100-150m, TBD" from this one). This
reinforces rather than resolves the earlier flag — **still needs a direct
founder decision before implementation**, not a majority-vote guess.

At the threshold: rider may see authorized customer contact info and chat
with the customer; customer may see the rider's live location and
authorized rider info.

## 36-38. Delivery Completion → Customer Completion → Admin Monitoring
Rider taps "Complete Delivery" (use existing POD/verification mechanism
if one exists) → order becomes Delivered/Completed per the authoritative
backend status. Customer sees delivery confirmation, order summary,
receipt, and a rating/review prompt (use the existing review system).
Admin can see the full order lifecycle: ID, customer, merchant, store,
products, amount, payment, delivery type, rider, status, timestamps,
location state, assignment state, completion state, and a full timeline
(Created → Accepted → Preparing → Rider Assigned → Ready → Picked Up →
In Transit → Delivered → Completed).

## 39. Order State Machine (frontend must reflect the authoritative backend states, not invent its own)
```
CREATED → MERCHANT RECEIVES → ACCEPTED → PREPARING → RIDER ASSIGNED →
READY → RIDER PICKUP → IN TRANSIT → DELIVERED → COMPLETED
```
Alternative: `CREATED → REJECTED`. Other cancellation/failure states must
use existing RAPEX contracts — **do not invent additional states without
authorization.** (Cross-reference: the main rules doc's confirmed 14-state
machine is the authoritative one where the two differ in granularity —
this spec's version reads as a simplified conceptual flow, not a
contradiction.)

## 40-43. Per-Role UI States + Order History
Customer sees: Order Received → Preparing → Finding a Rider → Rider
Assigned → Ready for Pickup → On the Way → Arriving → Delivered →
Completed — **without live rider location before the privacy threshold**,
even if the state label implies motion. Rider sees: New Order → Accepted
→ Going to Store → At Store → Ready for Pickup → Start Delivery → On the
Way → Arriving → Delivered → Completed, with customer info progressively
revealed only per the privacy rule. Merchant sees a narrower set (New
Order → Accepted → Preparing → Ready → Rider Assigned → Picked Up →
Completed) and must never receive unnecessary rider/customer private
data. Order history is role-scoped: Customer "My Orders," Merchant "Store
Orders," Rider "My Deliveries," Admin "All Orders" — each sees only
authorized records.

## 44-48. Data Integrity Rules
- **Multi-store rule**: an order belongs to exactly one store; never mix
  store context within one order.
- **Saved product rule**: saved items persist until removed or the
  product becomes unavailable — checking out selected items never
  auto-clears the rest of the Save List.
- **Availability validation**: check product availability before
  checkout *and again* at order creation. On unavailability, show the
  affected item — never silently substitute a different product or
  change quantity.
- **Price validation**: backend is always authoritative for final price;
  frontend may display current price, but checkout/order-creation must
  use backend-computed pricing — never trust a client-side total for
  settlement.
- **Order security**: users see only their own orders; merchants see
  only their authorized stores' orders; riders see only assigned/eligible
  deliveries; Admin follows Admin authorization. Never expose private
  data just because an ID is known (guards against IDOR).

## 49-50. Real-time Updates + Notifications
Use existing realtime infrastructure where available for order status,
rider assignment, delivery state, live location, and merchant prep state
— avoid aggressive polling if a realtime mechanism already exists.
Notification sets are per-role (Customer: received/accepted/preparing/
rider-assigned/ready/out-for-delivery/arriving/delivered; Merchant:
new-order/rider-assigned/pickup/completion; Rider:
new-delivery/assignment/pickup/delivery/completion) — use existing
notification infrastructure, don't build a parallel one.

## 51-55. UX Structure
Single-screen checkout (no unnecessary multi-page flow). Bottom nav:
Home / Search / Save List / Orders / Profile. Save List is store-grouped
with a checkbox-select-then-"Checkout Selected" pattern. Search supports
free-text ("What are you looking for?") plus category/location/store/
brand filters, and product search results group by store so the
marketplace is useful even before entering a specific store's page.

## 56-57. Buy Now vs. Save vs. Wholesale Inquiry
"Buy Now" skips the Save List entirely and proceeds straight to checkout
for that one product. "Save" adds to the Save List. **"Inquire
Wholesale" must use an existing inquiry/messaging contract if one
exists — if it doesn't, report the missing contract rather than
inventing the wholesale backend.** (Ties directly to the Wholesale/
Inquiry→Quotation→Accept flow already documented in the main rules doc —
this is the frontend entry point into that same flow, not a separate
system.)

## 58. Delivery Location Privacy
Customer address is sensitive — expose it to the rider only per the
delivery-state/privacy rule (see §32-35); before authorization, show only
the minimum needed for navigation.

## 59. Admin Order Detail Layout
Top: Order ID, current status, store, customer, rider. Body: products,
payment, delivery, timeline. Right/Operations: assignment, current state,
relevant operational actions. **Never expose secrets or credentials** in
this view.

## 60. Failure / Exception States — explicit "don't invent" discipline
Must handle: merchant rejects, product unavailable, rider declines, no
rider available, rider cancels (per permitted rules), payment failure,
invalid address, store unavailable, order timeout, delivery failure,
network interruption. **For each one without a confirmed business rule:
do not invent one — report it as an "OPEN BUSINESS RULE"** and identify
the trigger, expected status, who acts, and the result for each of
Customer/Merchant/Rider/Admin. This mirrors the project-wide "never guess
an unconfirmed contract" discipline exactly.

## 61. Reusable Frontend Components (reference inventory for implementation)
`StoreDiscoveryCard`, `StoreHeader`, `StoreCategoryTabs`, `ProductCard`,
`ProductDetail`, `BrandFilter`, `LocationFilter`, `SaveList`,
`SavedStoreGroup`, `SavedProductRow`, `CheckoutSummary`,
`DeliveryLocationSelector`, `DeliveryTypeSelector`, `VoucherSelector`,
`PaymentSelector`, `OrderCard`, `OrderTimeline`, `OrderStatusBadge`,
`RiderAssignmentCard`, `DeliveryStatusCard`, `LiveDeliveryMap`,
`PrivacyStateIndicator`, `MerchantOrderCard`, `RiderDeliveryCard`,
`AdminOrderMonitor`.

## 62. Build Discipline — required phased build order
**Do not build the entire Order Engine in one uncontrolled pass.** Build
in this order, typechecking and verifying after each phase:

1. Store discovery
2. Product discovery
3. Store page
4. Product detail
5. Save List
6. Checkout
7. Merchant order flow
8. Rider assignment
9. Privacy state
10. Delivery
11. Admin monitoring
12. Realtime updates
13. Failure states
14. Final integration

## 63. Backend Rule
Reuse existing Xano/Django APIs, tables, repositories, and business logic
for Users, Stores, Merchants, Products, Variants, Orders, Riders,
Wallets, Delivery records, and Addresses. **If an endpoint exists, use
it. If it's missing, report the missing contract — never silently build
a duplicate architecture.**

## 64. Final Order Engine Principle

```
DISCOVER → CHOOSE STORE → CHOOSE PRODUCT → SAVE / BUY → CHECKOUT →
MERCHANT ACCEPTS → RIDER MATCHING → RIDER CONFIRMS → MERCHANT PREPARES →
RIDER PICKS UP → DELIVERY PRIVACY THRESHOLD → LIVE DELIVERY →
DELIVERED → COMPLETED
```

Every participant sees only the information appropriate to their current
role and order state. **Start implementation only after inspecting the
existing RAPEX repository and Xano/Django contracts** — this spec is a
sequencing and discipline guide, not a license to build ahead of what's
actually confirmed.
