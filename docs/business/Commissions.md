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

---

## Formula Engine (2026-08-18 update — received, review only)

**Received, not independently verified.** Pasted by the founder as a more
detailed planning spec than the Price Engine section above — this
supersedes/refines it with exact mechanics. Review only, no
implementation started from this section yet. Same source style as the
rest of this doc (ChatGPT/ideation session output).

### Critical rule
Do **not** hardcode commission, markup, platform fees, rider earnings,
delivery fees, or coupon rules inside frontend screens. Super Admin
controls the commercial Formula Engine; Xano is the authoritative source
for saved rules and calculations.

### Formula Engine must support
1. Commission Only
2. Markup Only
3. Commission + Markup / Revenue
4. Platform Fees
5. Coupon / Discount
6. Free Delivery
7. Food Delivery Fee
8. Rider Delivery Earnings
9. Rider Incentives
10. Store Commission Tiers
11. Product Price Bands
12. Active/Inactive rules
13. Start/Expiry dates
14. Manual Super Admin override with audit history

### Formula rule fields
`Base Price From`, `Base Price To`, `Commission %`, `Markup %`, `Fee %`,
`Fixed Fee`, `Calculation Basis`, `Priority`, `Active`, `Start Date`,
`End Date`.

### CRITICAL: don't mix Markup and Commission
These are separate fields/calculations — conflating them makes the
accounting untraceable:
- **Markup** — changes the customer selling price.
- **Commission** — determines how the resulting transaction revenue is
  allocated.
- **Platform Fee** — separate fee per the configured fee rule.
- **Rider Earning** — separate delivery settlement.

> "Otherwise one day we'll look at a ₱1,000 order and nobody knows why
> RAPEX got ₱173.42." — founder

### Calculation types

**A. Commission Only**: Base Price → Commission % → Commission Amount.
Example: Product ₱100, Commission 10% → RAPEX Commission ₱10, Merchant
Settlement ₱90.

**B. Markup Only**: Base Price → Markup % → Customer Selling Price.
Example: Merchant Price ₱100, Markup 15% → Customer Price ₱115. Markup is
not the same thing as merchant commission.

**C. Commission + Markup / Revenue** (the fuller RAPEX model):
```
Merchant Base Price → Markup → Customer Selling Price → Commission → RAPEX Revenue
```
The engine auto-calculates: Base Price, Markup Amount, Customer Price,
Commission Amount, Merchant Net, RAPEX Revenue, Platform Fee, other
applicable fees. Admin never manually types the final formula — the
engine generates it from the configured %s.

### Formula rule table (price bands)
Super Admin can create multiple price bands per calculation type, e.g.:

| Base From | Base To | Calculation | Rate |
|---|---|---|---|
| ₱1 | ₱100 | Commission | 20% |
| ₱101 | ₱1,000 | Commission | 15% |
| ₱1,001+ | — | Commission | 10% |

(Same shape works for Markup, or Commission + Markup combined.) The
engine selects the correct active rule automatically. The system must
prevent overlapping active price ranges unless the engine explicitly
supports priority-based overrides.

### Platform Fee Engine
Fields: `Fee Name`, `Fee Type`, `Fee Value`, `Calculation Basis`,
`Active`, `Start Date`, `End Date`. Examples: Payment Processing,
Platform Fee, Service Fee, Transaction Fee. **Every fee must have a
defined calculation basis** — e.g. % of Product Subtotal / Delivery Fee /
Order Total / Commission — otherwise accounting gets messy fast. Never
mix Platform Fee with Merchant Commission.

### Delivery Fee Engine (general + Food-specific)
General delivery fields: `Delivery Type`, `Vehicle Type`, `Distance
From`, `Distance To`, `Base Fee`, `Additional Fee`, `Additional
Distance`, `Active`. Delivery types: Rapid Express, Standard Delivery,
Food Delivery, Fresh Delivery, Logistics/Truck. Vehicles: Bicycle,
Motorcycle, Car, Van, Truck.

Food gets its **own** configurable rule set (don't force it to reuse
Non-Food Standard Delivery rules) — same field shape, e.g. Base Distance
2km / Base Fee ₱40 / Additional ₱10 per km, but must be Super-Admin
configurable, not hardcoded.

### Rider Commission / Earning Engine
Fields: `Delivery Type`, `Vehicle Type`, `Distance`, `Base Rider
Earning`, `Percentage`, `Fixed Amount`, `Bonus`, `Incentive`, `Active`.
Output: Customer Delivery Fee, Rider Earning, RAPEX Delivery Revenue,
Incentive, Final Rider Settlement. Example: Delivery Fee ₱100, Rider
Earning 90% → Rider ₱90, RAPEX ₱10. Special rules (e.g. a stalled-order
reward) stack as Base Rider Earning + Stalled Order Reward + Eligible
Points. Rider earnings are always separate from Merchant Commission.

### Rider Incentive Engine
Fields: `Incentive Name`, `Trigger`, `Minimum Requirement`, `Reward
Type`, `Reward Value`, `Active`, `Start/End Date`. Triggers: Completed
Deliveries, Stalled Order, Special Delivery, Emergency Delivery, High
Demand. Reward types: Cash, Wallet, Points, XP, Voucher.

### Store Commission Tiers
Only **Super Admin** can configure/select these — Normal Admin can
monitor but not change the commercial engine.

- **Tier 1** — small stores (food carts, sari-sari, small stores):
  baseline **5%**.
- **Tier 2** — approx. ₱5,000–₱10,000 daily revenue: **10–15%**
  (selectable: 10/11/12/13/14/15%).
- **Tier 3** — higher-performing stores: **15–25%** (selectable across
  that range).

Fields: `Tier Name`, `Revenue From`, `Revenue To`, `Commission %`,
`Category Scope`, `Active`, `Priority`, `Start/End Date`. Longer-term:
`Store → Average Daily Revenue → Tier Evaluation → Tier 1/2/3 →
Commission Rule`, with Super Admin able to choose Automatic or Manual
Override (audited either way) rather than Tier being a permanent manual
label only.

### Coupon Engine
Fields: `Coupon Name`, `Coupon Type`, `Value`, `Percentage/Fixed`,
`Minimum Purchase`, `Maximum Discount`, `Applicable Store/Category/
Product`, `User Eligibility`, `Usage Limit`, `Per User Limit`,
`Start/Expiry Date`, `Active`.

### Free Delivery
`Free Delivery = TRUE` or `Delivery Discount = 100%`. The **original**
delivery fee must remain in the record for reporting even though the
customer-facing fee becomes ₱0 — never erase the original calculated
fee.

### Cancellation Engine
Fields: `Cancellation Stage`, `Responsible Party` (Customer/Merchant/
Rider/System), `Penalty Type`, `Penalty %`, `Fixed Penalty`, `Maximum
Penalty`, `Refund Rule`, `Active`. Never auto-charge a customer who isn't
responsible.

### Late Delivery Engine
The approved Standard Delivery rule: after 24 hours, every 20 minutes the
customer's delivery fee drops ₱5. This reduction is **not** RAPEX
revenue. The engine must separately track: Original Delivery Fee,
Current Delivery Fee, Customer Reduction, RAPEX Revenue Impact, Rider
Liability if applicable. See `Orders.md` §15–16 for the full rule.

### Reward / Point Engine
Fields: `Reward Name`, `Trigger`, `Points`, `XP`, `Coupon`, `Wallet
Reward`, `Level Requirement`, `Daily/Monthly Limit`, `Active`. Triggers:
Referral, Purchase, Daily Tasks, Store Follow, Product Like, other
approved engagement tasks, Level Up, Special Campaign.

### Referral Engine
Every user has a `rapid_code`, Referral ID, Referral QR (see
`docs/database/data-dictionary.md`). Fields: Referrer, Referred User,
Referral Source, QR Referral, Reward, Coupon Count, Points, XP, Status,
Date, Reward Issued. **Referral history must never be overwritten.**

### Level / Gamification Engine
Fields: `Level Number`, `Level Name`, `XP Required`, `Reward`, `Reward
Type`, `Reward Value`, `Active`. Example: Level 1 reward = Free Delivery
on first order. Do not hardcode levels — see `docs/business/Levels.md`.

### Subscription / VIP Engine (foundation only)
Fields: `Plan Name`, `Monthly/Annual`, `Price`, `VIP/Wholesale/Partner/
Freelance Enabled`, `Reward Benefits`, `Active`. Do not activate
unfinished VIP/Wholesale/Partnership logic without approval.

### Wholesale Engine (product-level)
Fields: `Product`, `Minimum/Maximum Quantity`, `Discount %`, `Discount
Type`, `Active`, `Start/End`. Example: 100 units → 10%, 200 units → 15%.
Calculated per single product — don't combine different products to
reach the MOQ unless a future rule explicitly allows it.

### Formula priority (when multiple rules could apply)
1. Exact Product Rule
2. Store Rule
3. Category Rule
4. Tier Rule
5. Global Rule

Use `Priority` when needed; the engine must prevent accidental double
charging.

### Rule management, versioning, safety
- Admin can Add/Edit/Activate/Deactivate/View/Test rules — never
  permanently delete historical financial rules (`Active = FALSE`
  instead); historical rules stay available for audit.
- **Rule versioning**: changing a rule never overwrites historical
  calculations — completed orders keep the rule/calculation active at
  the time of the transaction; new orders use the new active rule.
- **Validation must prevent**: duplicate active rules, overlapping price
  bands, negative percentages, invalid ranges, end date before start
  date, invalid fee basis, duplicate rule names where uniqueness is
  required, commission/markup above configured maximum, negative
  delivery fees, negative settlement values.

### Super Admin security
Only **Super Admin** can create/edit/activate/deactivate commercial
rules: commission, markup, platform fees, delivery fee formulas, rider
earning formulas, store tiers, cancellation penalties, reward formulas,
subscription commercial settings. Normal Admin may View/Monitor/Test/
Report but cannot modify protected commercial configuration unless
explicitly authorized later.

### Audit log
Every Engine modification records: Actor, Rule ID, Action, Old Value,
New Value, Date/Time, Reason if required (e.g. "Commission changed: 10%
→ 12%"). Audit history must never be deleted.

### Existing Engine Tab — preservation rule (important for whoever builds this)
The Admin portal's Engine Tab (`EngineCenterPage`) already exists and
works — see `apps/admin-portal/src/features/engine-center/`. Any future
work here is an **enhancement, not a redesign**:
- Do NOT rebuild the tab, remove the current Test Output section (must
  stay visible *below* the input/config section), remove working
  components/calculations/API connections, or create duplicate APIs.
  Only the input/configuration side should be extended.
- Reuse components before creating new ones: `EngineSectionCard`,
  `EngineInputCard`, `SelectField`, `NumberInput`, `PercentageInput`,
  `CurrencyInput`, `RangeInput`, `Toggle`, `DateTimePicker`,
  `FormulaPreview`, `RuleStatusBadge`, `Add/Edit/Remove/TestFormula/
  SaveRule/Cancel` buttons — extend this list only where genuinely
  missing, don't invent a new visual language.
- Every rule's basic fields: `Rule Name`, `Rule Type`, `Description`,
  `Active`, `Priority`, `Start/End Date`, `Scope`, `Calculation Basis`.
- Implementation order when this is actually built: inspect existing
  Engine Tab → inspect existing Xano Engine APIs/tables → map existing
  fields to new inputs → add only missing inputs → connect to existing
  APIs where possible → extend APIs only where required → preserve Test
  Output → test every calculation type → verify historical rule
  integrity → report exactly what changed.

### Xano rule (same as everywhere else in this project)
Inspect existing tables/APIs first. If one already performs the same/
similar function, **update/extend** it — never duplicate an API, never
delete an existing API, never create an ID field conflicting with Xano's
native `id`. Use Xano's native `id` internally and `rapid_code` for
RAPEX-facing identifiers (see `docs/database/data-dictionary.md`).

### After-implementation report (for whenever this gets built)
Existing structures reused; structures updated; new structures genuinely
required; formula rules created; APIs reused/updated; any unresolved
conflicts.
