# RAPEX Order and Platform Reference

Status: **Reference only — no implementation authorization**

This file records the non-auth requirements supplied on 20 August 2026. It is a future planning source for RAPEX order, delivery, finance, advertising, and platform screens. It must not be treated as permission to create Xano tables/endpoints, financial calculations, or production UI without a later, scoped implementation request.

## Authoritative source material

- `RAPEX_Core_Data_Dictionary_Master_v1.docx` — retained alongside this file.
- User-supplied master requirements covering the Order Engine, Formula/Revenue Engine, Marketing Ads Engine, and complete order process flow.

## Architecture guardrails

- Xano is the authoritative source for order state, eligibility, finance calculations, settlements, validation, permissions, and audits.
- Frontend apps only display server-authoritative totals and states; they must not hardcode commission, markup, platform fees, delivery fees, rider earnings, coupon rules, or settlement logic.
- Inspect existing Xano tables/APIs first. Extend compatible structures; never duplicate or delete existing tables, columns, APIs, working logic, contracts, or historical data.
- Xano native `id` is the internal identifier. `rapid_code` is the RAPEX-facing identifier. Do not introduce conflicting ID fields.
- Preserve historical order/product/financial snapshots and use active/status fields instead of destructive deletion.
- All commercial configuration changes require Super Admin access and immutable audit history.

## Customer order domains

### Food and Fresh

`Discover → Store → Product → Variant/Add-ons → Express Cart → Food Order ID → Checkout → Merchant → Preparing → Rider → Delivery → Settlement`

- Immediate delivery only; not Standard Delivery.
- Food/Fresh cart warning at roughly 3 hours and automatic removal at 5 hours.
- Normally one Food Order ID per merchant. Merchant merging is only permitted under the approved proximity rule (currently a target of about 500 m).

### Non-Food

`Discover → Product Detail → Save List/Add to Express Cart → Checkout → Rapid Express or Standard Delivery → Merchant → Rider/Logistics → Delivery → Settlement`

- Rapid Express = Deliver Now, urgent/immediate dispatch.
- Standard Delivery = Deliver Later, target under 24 hours, supports permitted route-based multi-store consolidation.
- Save List is organized by store; only selected items move to checkout.

### Master and child orders

- A single customer checkout can create one Master Order with a distinct child order for each merchant.
- Every child order has independent product subtotal, merchant status, rider assignment, delivery fee, commission/markup, settlement, audit history, and lifecycle.
- The customer sees one checkout experience but never loses the separate operational order identities.

## Delivery, rider, privacy, and exceptions

- Rider eligibility considers vehicle, availability, location, Auto-Pick, route and distance feasibility.
- Rapid Express normally searches/dispatches the nearest eligible rider per store; Standard Delivery can group stores only when routing rules allow it (current target: about 1 km grouping).
- Merchant accepts → prepares → marks ready → rider search/assignment → pickup → delivery.
- During preparation, customer and rider private contact details remain protected. Approved chat/contact and live-location capability activate only at a configurable delivery trigger (target currently 100–150 m).
- If no rider is available, offer configured wait/change/cancel paths, optional search expansion and incentives; any 12-hour escalation must be configurable and must not lock a rider device.
- Standard Delivery after 24 hours reduces the customer delivery fee by PHP 5 every 20 minutes. Store original fee, current fee, customer reduction, RAPEX impact, and any rider liability separately.
- A customer-side delay reduction is never RAPEX revenue. Failed delivery liability and wallet deductions require server-side configurable policy.
- Customer cancellation is state-dependent; once out for delivery, cancellation is disabled. Responsibility determines whether any penalty applies.
- Change Store creates a new order lifecycle; it must not silently mutate the cancelled historical order.

## Required order statuses

`Draft/Cart → Order Placed → Merchant Pending → Merchant Accepted → Preparing → Ready for Pickup → Searching Rider → Rider Assigned → Rider Confirmed → On the Way to Merchant → Picked Up → Out for Delivery → Delivered/Completed`

Alternative terminal states: `Cancelled`, `Failed Delivery`, and `Expired` where applicable.

## Commercial Formula and Revenue Engine

The Super Admin Formula Engine configures active, priority-based, date-bounded rules. It must preserve the existing Engine Tab and its Test Output; future work may only extend the configuration/input layer unless separately approved.

Supported commercial domains:

- Commission only, markup only, and commission + markup.
- Platform fees with an explicit calculation basis.
- Coupons, discounts, free delivery, and price bands.
- Food-specific and non-food delivery fee engines.
- Rider earnings and incentives.
- Store commission tiers, product/wholesale rules, cancellation rules, late-delivery adjustments, rewards, referrals, points, XP, levels, and future subscription/VIP foundations.

Every rule needs, as relevant: name, type, description, scope, calculation basis, base-price range, commission/markup/fee/fixed-fee values, priority, active state, start/end dates, and validation against overlapping/invalid active rules.

Financial records must transparently preserve:

- base price, markup amount, customer price, discount/coupon;
- original and current delivery fee;
- commission, platform fee, rider earning/incentive;
- merchant settlement, RAPEX revenue, customer total, and adjustments.

Important separation:

- **Markup** changes the customer selling price.
- **Commission** allocates transaction revenue.
- **Platform fees** are separate configured fees.
- **Rider earnings** are separate delivery settlement.
- **Customer delay reductions** are not RAPEX income.

Rule precedence target: exact product → store → category → tier → global, with priority to prevent double charging. Historical completed orders keep their original rule/calculation snapshot even after later rule changes.

## Ads and Visual Asset Bank

- A centralized asset bank stores media references/metadata rather than scattering marketing assets through apps.
- Supported assets: posters, headers, banners, icons, images, GIF, MP4/video, and approved promotional media.
- Campaigns have assets, audience (customer/rider/merchant), placements, start/expiry dates, active state, priority, click action, and optional randomization.
- Eligible active campaigns can appear on approved app surfaces such as Welcome, Cart/Express Cart, and Checkout.
- Opening an ad must retain navigation state: closing returns to the exact prior screen.
- Expired campaigns automatically become ineligible for serving.

## Data dictionary findings

The retained Data Dictionary lists the proposed core entities and fields for users, addresses, referrals, merchant/store/product/catalog, riders/vehicles, orders/items/delivery/logistics, wallet/payment/payout, coupons/rewards/levels, carts, POS, chat, community, service booking, partnership, auction, marketing assets/ads, schedules, price history, wholesale, feature flags, audit/security/error/system logs, and industrial wholesale inquiry/quotation.

It is explicitly a **data-model readiness checklist**, not permission to blindly create all listed tables. Existing Xano structures must be inspected and reused or extended first.

## Future screen-flow baseline

When front-end work is later requested, screen flow should be designed around:

1. Discovery/search → store/product detail.
2. Save List or Express Cart according to domain.
3. Checkout with address, delivery choice, eligible voucher and payment.
4. Master Order plus independently tracked merchant child orders.
5. Merchant acceptance/preparation, then rider search/assignment.
6. Privacy-gated tracking/contact, pickup, delivery, completion, and settlement display.

## Decisions still intentionally open

- Exact formula mathematics for all settlement and tax/VAT cases.
- Coupon subsidy responsibility.
- Merchant cancellation settlement.
- Industrial wholesale and auction settlement details.
- Exact rider cancellation/failed-delivery liability percentages.
- Exact privacy trigger mechanics and delivery-routing optimization.
- Final food-merchant merge implementation and standard-delivery grouping algorithm.
- Infrastructure monitoring stack.

## Implementation responsibility split

- **React Native / client UI:** integrations and presentation; preserve existing navigation and working behavior.
- **Web/Admin UI:** state presentation and configuration controls; do not invent financial/order business logic.
- **Xano/backend:** canonical state machine, calculations, permissions, validation, audit history, and API contracts.

