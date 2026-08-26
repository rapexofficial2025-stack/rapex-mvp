# RAPEX Order Engine — Open Architecture Decisions & Locked-Feature Ledger

**Status: LIVING DOCUMENT — actively being resolved question-by-question by the founder.**

## Scope and purpose

This file preserves two things the founder relayed immediately after the
`OrderEngineSpec.md` build specification, plus a live, ongoing round of
follow-up decisions the founder is locking in real time as this document is
being written. It is **not** a rules statement (see `Claude-Summary.md`) and
**not** the phased build guide (see `OrderEngineSpec.md`) — it is the
decisions ledger that sits between them:

1. **What is already locked** — the exact feature list the founder confirms
   was locked into the Order Engine prompt, plus the Master Feature
   Checklist showing what's conceptually done (✅) vs. still needing a full
   engine specification (⬜).
2. **What is explicitly, deliberately open** — a large, numbered catalog of
   business-architecture questions the founder has **not yet answered** and
   has explicitly instructed must **not be invented or guessed**. Founder's
   own words: *"Those should become explicit rules when we get to those
   pieces."*
3. **What has since been resolved live** — as the founder works through
   these open questions (in this conversation and/or in parallel with
   another AI), each locked answer is appended to this file under **Part
   C — Live Resolutions**, cross-referenced back to the open-question
   number(s) it answers. This section will keep growing across future
   sessions; append, don't rewrite.

Per the founder's standing instruction (repeated across this entire
project): unresolved items in Part B are catalogued faithfully and must
**never** be answered, guessed, or defaulted by any AI tool — including this
one — until the founder locks a rule for them explicitly. When a rule is
locked, it belongs in Part C, and Part B's checklist should be marked
resolved with a pointer to Part C, not silently deleted (so the history of
what was open and when it got resolved is never lost).

---

## PART A — Locked Features & Master Feature Checklist

*(Founder's own message, preserved verbatim.)*

### Locked into the Order Engine prompt

- Store discovery by category
- Nearby stores
- Search stores by municipality/city even when outside the current location
- Product search across stores
- Store page with cover/logo/open hours/location/distance/rating
- Store product categories
- Brand filtering
- Minimal marketplace-style product detail
- Save List grouped by Store
- Checkbox-based partial checkout
- One-store checkout context
- Single-screen checkout
- Voucher
- Merchant acceptance
- Vehicle-specific rider matching
- Auto-Pick rider priority
- Manual rider accept/decline/ignore
- Rider going to merchant while customer privacy is protected
- Merchant preparation state
- Rider delivery state
- 100–150m privacy/geofence trigger
- Customer/rider contact unlock only at the appropriate stage
- Live rider location after the trigger
- Admin full order monitoring
- Order state machine
- Store/user/rider/merchant data isolation

### ⚠️ OPEN RULES — NOT INVENTED

Founder's own framing: *"There are a few things your explanation hasn't
completely defined yet, so I deliberately left them open rather than making
up rules."*

- What happens if no rider accepts after a certain period?
- Exact rider assignment radius and expansion behavior.
- Exact meaning of the 100m vs 150m threshold — whether it is 100m, 150m, or
  a configurable geofence. **(This is the same proximity conflict already
  flagged in `Claude-Summary.md` §10 — now a 5th independent data point:
  "100–150m" from this round, vs. 150m / 500m / 50m / "~100–150m TBD" from
  earlier rounds. Still not resolved to one number.)**
- Exact proof-of-delivery requirement.
- Exact merchant acceptance timeout in this version of the Order Engine.
- Exact behavior when a merchant rejects after payment.
- Exact voucher stacking/exclusion rules.
- Exact behavior for multiple-store saved items.
- Exact wholesale inquiry backend flow.

> *"Those should become explicit rules when we get to those pieces."*

### ✅ RAPEX MASTER FEATURE CHECKLIST

**Authentication / First Impression**
- ✅ Splash
- ✅ Welcome
- ✅ Age Gate
- ✅ Login
- ✅ Registration
- ✅ Address hierarchy
- ✅ KYC
- ✅ Community/Culture
- ⬜ Cultural thank-you screen
- ⬜ Final DOB wizard refinement

**Merchant**
- ✅ Merchant account/store separation
- ✅ Multi-store concept
- ✅ Store dashboard
- ✅ Products
- ✅ Variants
- ✅ Inventory
- ✅ CSV upload
- ✅ Store category engine
- ⬜ Final Merchant API/business-rule specification

**Rider**
- ✅ Rider capability concept
- ✅ Vehicle registration
- ✅ Auto-Pick concept
- ✅ Online/Offline concept
- ⬜ Full Rider Engine specification

**Service Provider**
- ✅ Freelancer concept
- ✅ Service Provider Company concept
- ✅ Service category engine
- ✅ Admin category add/edit/activate
- ⬜ Full Provider transaction engine

**Marketplace**
- ✅ Product marketplace concept
- ✅ Pre-Loved concept
- ✅ Auction concept
- ⬜ Full Pre-Loved Engine specification
- ⬜ Full Auction Engine specification

**Partnership**
- ✅ Partner/referral concept
- ✅ **36-month merchant commission rule**
- ⬜ Full Partnership Engine specification

> ⚠️ **FLAGGED CONFLICT (not resolved):** This checklist states a
> "36-month merchant commission rule." `Claude-Summary.md` §8 (Partnership
> Program, from the earlier Xano deep-dive) documents a **"Lifetime Rule"**
> — commission continues for the life of the partnership, with no stated
> expiry. These two cannot both be the confirmed rule as written. Per
> standing project discipline this is flagged, not silently resolved in
> either direction — needs an explicit founder decision on whether
> Partnership commission is lifetime, capped at 36 months, or some other
> combination (e.g. lifetime for one tier, 36-month for another).

**ORDER ENGINE**
- ✅ Store discovery
- ✅ Category discovery
- ✅ Location filtering
- ✅ Municipality/city search
- ✅ Cross-store product search
- ✅ Store page
- ✅ Store product categories
- ✅ Brand filtering
- ✅ Product detail
- ✅ Save List
- ✅ Store-grouped Save List
- ✅ Checkbox partial checkout
- ✅ Delivery location
- ✅ Delivery type
- ✅ Order breakdown
- ✅ Voucher
- ✅ Payment
- ✅ Merchant order receipt
- ✅ Merchant acceptance
- ✅ Preparing state
- ✅ Rider matching
- ✅ Vehicle filtering
- ✅ Auto-Pick
- ✅ Manual rider acceptance
- ✅ Rider confirmation
- ✅ Privacy protection before delivery threshold
- ✅ Merchant preparation completion
- ✅ Rider delivery start
- ✅ 100–150m proximity concept
- ✅ Contact unlock concept
- ✅ Customer live rider location
- ✅ Rider/customer chat after authorized threshold
- ✅ Delivery completion
- ✅ Admin monitoring
- ⬜ No-rider timeout rule
- ⬜ Rider assignment expansion rule
- ⬜ Exact geofence threshold
- ⬜ Proof-of-delivery rule
- ⬜ Payment-failure/refund rules
- ⬜ Merchant rejection/refund rules
- ⬜ Voucher edge-case rules
- ⬜ Wholesale inquiry flow

---

## PART B — The 58-Question Open Architecture Catalog

*(Founder's own message, preserved verbatim — explicitly a decisions-needed
catalog, NOT to be answered by inference. Any item resolved live is marked
below with a pointer into Part C; unmarked items remain fully open.)*

### 1. Multiple merchants in one cart

Suppose the user selects: JLEX Hardware (Paint ₱500), Rainbow Hardware
(Plywood ₱800), ABC Sari-Sari (Snacks ₱200).

- **Question 1** — Does RAPEX allow the customer to press CHECKOUT ALL and
  create one customer checkout containing all three merchants? Or does
  RAPEX automatically split it into a MASTER CHECKOUT containing ORDER
  #001 (JLEX), ORDER #002 (Rainbow), ORDER #003 (ABC Sari-Sari) while the
  customer sees it as one checkout? *→ See Part C, Q2 (Delivery Mode) for a
  related but not identical resolution — the store-grouping/order-splitting
  question itself remains open.*
- **Question 2** — If multiple merchants are allowed in one checkout: does
  each merchant receive only its own order?
- **Question 3** — Does each merchant get a separate rider? Or can one
  rider collect from JLEX → Rainbow → ABC and deliver everything together?
  *→ Partially addressed by Part C, Q2 (rider can accept individual store
  legs or combined legs, with distance protection) — but only for the
  "Deliver Later" flexible-logistics mode, not confirmed for immediate
  multi-merchant delivery generally.*
- **Question 4** — If one merchant rejects: does the whole checkout fail,
  or only that merchant's order?

### 2. Multi-merchant delivery fee

Example: JLEX = 2 km, Rainbow = 3 km, ABC = 4 km. How is delivery
calculated — (A) one combined route, (B) separate delivery fee per
merchant, or (C) one base fee + additional pickup fees?

- **Question 5** — Who pays the additional distance created by multiple
  merchants? Customer? Merchant? RAPEX? Split? *→ Partially addressed by
  Part C, Q2 for Deliver-Later mode: the customer sees a per-store fee
  breakdown (e.g. Store 1 → ₱50, Store 2 → ₱130, Store 3 → ₱80) calculated
  in advance. Whether this generalizes to Deliver-Now / immediate
  multi-merchant delivery is still open.*

### 3. Multi-merchant rider routing

- **Question 6** — Is multi-merchant delivery an MVP feature or a future
  feature? This matters enormously for Xano and the rider engine.

### 4. Food orders

Example: Jollibee-style merchant, customer orders Burger + Fries + Drink.

- **Question 7** — Does the merchant receive a NEW ORDER with a
  preparation countdown (Order received → Accepted → Preparing → Ready →
  Rider pickup)? *→ RESOLVED. See Part C, Q7.*
- **Question 8** — Can the merchant set preparation time (e.g. 10/20/30
  min)?
- **Question 9** — What happens if food is already prepared but no rider
  has arrived — does the merchant wait, mark ready, contact RAPEX, or
  receive another rider automatically?

### 5. Food modifiers

Example: Burger — Size (Regular/Large), Add-ons (Cheese +₱30, Bacon +₱50),
Remove (Onion, Pickles).

- **Question 10** — Do RAPEX products support options/modifiers, and are
  modifiers variants, add-ons, or both?

  > Note: this "Question 10" (food modifiers) is from the original 58-item
  > catalog and is a **different question** from "Q10" in Part C (Express
  > Cart Mixing) — the founder's live-resolution round uses its own,
  > separate Q-numbering. Do not conflate the two numbering schemes.

### 6. Food scheduling

- **Question 11** — Do you want scheduled food orders ("SCHEDULE FOR 7:00
  PM")? If yes, who controls the preparation time — merchant or system?

### 7. Instant Delivery

- **Question 12** — What exactly does Instant Delivery mean in RAPEX? Is it
  "customer requests a rider immediately and the system prioritizes the
  nearest available rider," or "merchant prepares the order first, then
  rider is immediately dispatched"? *→ Partially addressed by Part C, Q2:
  "Deliver Now" is defined as the mode that prioritizes fast merchant
  preparation, nearby rider, fast pickup, fast delivery — and is described
  as effectively required for food. Whether "Deliver Now" and "Instant
  Delivery" are the same concept or two different concepts is still open.*

### 8. Delivery type / vehicle eligibility

Potential vehicle choices: Bicycle, Motorcycle, Car, Van, Truck.

- **Question 13** — Who determines which vehicles are eligible — merchant,
  customer, or RAPEX system? Example: should a customer be able to select
  Bicycle for a 50kg hardware order, or should RAPEX automatically reject
  incompatible vehicles?

### 9. Wholesale order

- **Question 14** — What happens after a customer presses "Inquire
  Wholesale"? Is it a structured flow (Customer → Wholesale Inquiry →
  Merchant → Merchant sends quotation → Customer accepts → Order created),
  or simply "Chat with merchant"?

### 10. Wholesale quantity

Example: Paint ₱500 each, customer wants 100 units, merchant may offer ₱450
each.

- **Question 15** — Can merchant create a custom wholesale price?
- **Question 16** — Can merchant set a Minimum Wholesale Quantity (e.g.
  wholesale starts at 50 pieces)?

### 11. Wholesale payment

- **Question 17** — When customer accepts wholesale quotation, does
  payment happen immediately, or follow a Quotation → Acceptance → Deposit
  → Preparation → Delivery → Balance flow?

### 12. Auction — bidder eligibility

Example: Merchant lists iPhone 17, starting bid ₱10,000.

- **Question 18** — Who can bid? Any verified User? Merchant? Freelancer?
  Rider? All authenticated users?

### 13. Auction payment

Example: Auction ends, winner bids ₱18,500.

- **Question 19** — Does the winner automatically become obligated to pay?
  How long do they have (30 min / 2 hrs / 24 hrs)?
- **Question 20** — What happens if winner doesn't pay? Does the
  second-highest bidder win, does the auction restart, does the seller
  relist, or does the winner get a penalty?

### 14. Auction deposit

- **Question 21** — Do bidders need a wallet balance/deposit before
  bidding? (Example: for a ₱100,000 auction, must the bidder have ₱100,000
  available, or can anyone bid and pay later?) Called out as "a huge
  financial-risk rule."

### 15. Auction bid increment

Example: starting bid ₱10,000, minimum increment ₱500, next valid bid
₱10,500.

- **Question 22** — Is the increment fixed, percentage-based,
  seller-defined, or RAPEX-defined?

### 16. Auction auto-close

- **Question 23** — At exact end time, does the auction automatically
  close (YES/NO)?
- **Question 24** — If someone bids at 10:59:59 and the auction ends at
  11:00:00, does the auction extend (e.g. 5-minute anti-sniping extension),
  or no extension?

### 17. Auction seller cancel

- **Question 25** — Can seller cancel a LIVE auction? If yes, under what
  circumstances?

### 18. Auction admin override

- **Question 26** — Can Admin extend auction, close auction, cancel
  auction, remove listing, invalidate bids, assign winner, and/or suspend
  bidder? Which of these specifically?

### 19. Pre-Loved

Example: user sells a used guitar, ₱8,000.

- **Question 27** — Is Pre-Loved BUY NOW ONLY, or BUY NOW + OFFER?
- **Question 28** — Can buyer negotiate price (e.g. seller ₱8,000 → buyer
  offers ₱7,000 → seller counters ₱7,500)?

### 20. Pre-Loved delivery

- **Question 29** — Who delivers Pre-Loved items — seller, RAPEX Rider,
  meet-up, or all of the above?

### 21. Pre-Loved safety

- **Question 30** — Does Admin review every Pre-Loved listing, or is it
  automatic publishing + report system?

### 22. Booking — definition

- **Question 31** — What exactly is a RAPEX Booking? Example given:
  Customer "Book Plumber" → Choose date → Choose time → Provider accepts →
  Booking confirmed. Could also mean service booking, food reservation,
  appointment, freelancer, service provider, or merchant reservation — the
  founder has not yet confirmed which.

### 23. Service Provider booking — acceptance

Example: Architect ₱1,500 consultation, customer chooses August 25, 2:00 PM.

- **Question 32** — Does provider Accept/Reject the booking, or is
  availability automatically confirmed?

### 24. Booking payment

- **Question 33** — Does customer pay before booking, after provider
  accepts, as a deposit, or in full?

### 25. Booking cancellation

- **Question 34** — Who can cancel — Customer, Provider, Admin — and what
  happens to payment?

### 26. Booking no-show

- **Question 35** — Customer doesn't show up. What happens — provider gets
  paid, refund, penalty, or Admin decides? Explicitly called out: *"This
  one WILL happen."*

### 27. Service completion

- **Question 36** — How does RAPEX know a service is completed? Provider
  marks COMPLETE, customer CONFIRMs, both, or automatic after time?

### 28. Commission — money flow

Worked example given by the founder's source: Product ₱1,000, RAPEX
commission 15%, Delivery ₱50, Voucher ₱100. Customer pays ₱950 + delivery.

- **Question 37** — Who receives what — Merchant receives ?, RAPEX receives
  ?, Rider receives ?, Partner receives ?

### 29. Commission timing

- **Question 38** — When is commission recognized — order created, payment
  received, merchant accepts, rider picks up, delivery completed, or
  customer confirms? Source's own recommendation (not a locked rule):
  *"Financial settlement should generally happen only after successful
  completion, but YOU decide the RAPEX rule."*

### 30. Merchant payout

- **Question 39** — When does merchant receive their money — immediately
  after delivery, end of day, next day, weekly, or manual withdrawal?

### 31. Rider payment

- **Question 40** — When does rider earnings become available — after
  pickup, delivery, customer confirmation, or admin confirmation?

### 32. Refund

- **Question 41** — If order is cancelled after payment, who gets
  refunded — customer, merchant, rider, RAPEX? And who absorbs
  payment/processing fees?

### 33. Partial refund

- **Question 42** — Customer orders 5 items, merchant only has 4. Can
  merchant partially fulfill, or must the entire order be rejected?

### 34. Product price change at checkout

- **Question 43** — Customer sees ₱500; at checkout, merchant changed price
  to ₱550. Which price wins — old displayed price, current backend price,
  or must customer confirm again?

### 35. Out-of-stock after checkout

- **Question 44** — Customer pays, merchant discovers product unavailable.
  What happens — refund item, replace item, cancel entire order, or
  customer chooses?

### 36. Customer cancellation

- **Question 45** — When can customer cancel — before merchant accepts,
  after merchant accepts, while preparing, after rider assigned, after
  pickup, after delivery started? The source explicitly asks me to confirm
  whether the earlier rule ("once the product is on the way, cancellation
  isn't allowed") remains the universal rule — **still unconfirmed, not to
  be assumed either way.**

### 37. Rider cancellation

- **Question 46** — Rider accepts then cancels. What happens — automatic
  reassignment, penalty, wallet consequence, or no penalty?

### 38. Merchant timeout

- **Question 47** — Merchant doesn't accept. How long (2/3/5 min)? What
  happens afterward?

### 39. Rider timeout

- **Question 48** — No rider accepts. What happens — expand radius, change
  vehicle, notify merchant, notify customer, or cancel?

### 40. Customer communication channels

Before the privacy trigger, Customer↔Rider chat is blocked; after trigger,
chat opens.

- **Question 49** — Can Customer↔Merchant chat at ANY point? Can
  Rider↔Merchant chat? The three communication channels (Customer↔Rider,
  Customer↔Merchant, Rider↔Merchant) need to be defined separately.

### 41. Delivery proof

- **Question 50** — When rider arrives, what confirms delivery — PIN, QR,
  Photo, Signature, Customer button, Rider button, or a combination? Called
  out as critical because it determines when the financial transaction
  becomes COMPLETED.

### 42. COD

- **Question 51** — If COD: who collects cash (rider)? What happens if
  customer doesn't have enough cash? What happens to the order? Who
  absorbs the failed-delivery cost?

### 43. Wallet payment timing

- **Question 52** — If Wallet: should money be reserved/held when order is
  placed, or deducted immediately? And if order fails — automatic refund?

### 44. Multiple delivery types in one order

- **Question 53** — Can one order contain Normal delivery + Instant
  delivery? Source's own hedge: *"Probably no, but we need the rule."*

### 45. Food + normal product

- **Question 54** — Can Burger (restaurant) + Notebook (sari-sari) exist in
  the same checkout, or must food and ordinary products always be separate
  orders? Affects preparation, rider routing, and delivery timing. *→
  RESOLVED. See Part C, Q7 and Q9/Q10 — food/fresh and non-food are
  separate order domains and cannot mix into one order, though they can
  coexist in one Express Cart UI and get split into separate order IDs at
  checkout.*

### 46. Auction + normal product

- **Question 55** — Can auction purchases ever enter the normal cart, or
  must they always be a completely separate transaction?

### 47. Service + product

- **Question 56** — Can RAPEX combine a Service Booking + a Product Order
  into one checkout, or must they always be separate?

### 48. Order grouping architecture

- **Question 57 — "THE BIG ONE"** — Do you want a Master Transaction /
  Checkout ID that groups related orders (Product Order, Food Order,
  Service Booking, Auction Purchase, Pre-Loved Order) under ONE PAYMENT
  EXPERIENCE while still maintaining SEPARATE Merchant Orders? Source's own
  assessment: *"This is probably the cleanest architecture if you
  eventually want multi-merchant checkout."* **This is the single most
  architecturally consequential open question in the entire catalog — it
  determines the top-level shape of the Xano/Django order schema.** *→
  Partially informed by Part C, Q10: the founder has confirmed that a mixed
  Express Cart already produces separate order IDs per domain (Food order
  ID vs. Non-food order ID) even when checkout is initiated from one cart
  screen — which is evidence in favor of a Master Transaction ID grouping
  model, but the founder has not yet explicitly locked Question 57 itself.*

### 49. The final stress test

- **Question 58** — Imagine one customer in a single session buying: ₱500
  food + ₱2,000 hardware + ₱1,000 sari-sari + ₱5,000 Pre-Loved guitar +
  wins a ₱10,000 auction + books a ₱1,500 plumber + uses a ₱500 voucher +
  pays partly with wallet + chooses motorcycle delivery + has three
  different delivery addresses. Do you want RAPEX to treat that as ONE
  giant checkout, or as separate transaction types grouped under one
  customer activity/history? Source's own note: *"That answer will
  determine a huge portion of the final Xano architecture."*

### ✅ CURRENT ORDER ENGINE CHECKLIST

**Discovery** — ✅ Store category discovery · ✅ Nearby stores · ✅
Municipality/city search · ✅ Product search · ✅ Brand filtering · ✅ Store
page · ✅ Product categories · ✅ Product details

**Shopping** — ✅ Save List · ✅ Store-grouped saved products · ✅ Checkbox
selection · ✅ Single-store checkout · ⬜ Multi-store checkout · ⬜ Master
Checkout / Transaction ID

**Checkout** — ✅ Delivery location · ✅ Delivery type · ✅ Order breakdown ·
✅ Voucher · ✅ Payment · ⬜ COD failure rules · ⬜ Wallet reservation/refund ·
⬜ Price-change rule · ⬜ Out-of-stock rule · ⬜ Partial fulfillment · ⬜
Refund rules

**Merchant** — ✅ Receive order · ✅ Accept · ✅ Reject · ✅ Preparing · ✅
Ready · ⬜ Merchant timeout · ⬜ Merchant cancellation edge cases · ⬜ Partial
fulfillment

**Rider** — ✅ Vehicle filtering · ✅ Auto-Pick · ✅ Manual acceptance · ✅
Rider confirmation · ✅ Rider → Merchant · ✅ Pickup · ✅ Delivery · ⬜
No-rider escalation · ⬜ Rider cancellation · ⬜ Rider timeout · ⬜ Route
optimization

**Privacy** — ✅ Customer privacy before delivery threshold · ✅ Rider
privacy before delivery threshold · ✅ 100–150m proximity concept · ✅
Contact unlock · ✅ Rider/customer chat unlock · ✅ Live location unlock

**Completion** — ✅ Delivery completion concept · ⬜ Proof of Delivery · ⬜
Customer confirmation · ⬜ COD completion rule · ⬜ Financial settlement
trigger

**Food** — ⬜ Food order flow *(→ Part C Q7)* · ⬜ Preparation timer · ⬜ Food
modifiers/add-ons · ⬜ Scheduled food · ⬜ Food + normal product combination
*(→ Part C Q7/Q9/Q10)*

**Instant Delivery** — ⬜ Exact Instant Delivery definition · ⬜ Priority
dispatch rules · ⬜ Instant delivery fee

**Wholesale** — ⬜ Wholesale inquiry flow · ⬜ Wholesale quotation · ⬜
Minimum quantity · ⬜ Custom wholesale pricing · ⬜ Wholesale payment · ⬜
Wholesale delivery

**Booking** — ⬜ Service booking · ⬜ Availability · ⬜ Provider acceptance ·
⬜ Booking payment · ⬜ Cancellation · ⬜ No-show · ⬜ Completion confirmation

**Auction** — ⬜ Bidder eligibility · ⬜ Bid deposit · ⬜ Bid increment exact
rule · ⬜ Auction payment deadline · ⬜ Failed winner payment · ⬜
Anti-sniping · ⬜ Seller cancellation · ⬜ Admin override · ⬜ Auction
settlement

**Pre-Loved** — ⬜ Buy Now · ⬜ Offers/negotiation · ⬜ Delivery/meetup · ⬜
Listing moderation · ⬜ Completion

**Finance** — ⬜ Markup/commission calculation · ⬜ Commission recognition ·
⬜ Merchant settlement · ⬜ Rider earnings settlement · ⬜ Partner commission
· ⬜ Refund allocation · ⬜ Processing fee allocation

**Communication** — ⬜ Customer ↔ Merchant · ⬜ Rider ↔ Merchant · ✅
Customer ↔ Rider privacy unlock concept

**Multi-Transaction** — ⬜ Multi-merchant checkout · ⬜ Multi-rider delivery
· ⬜ Multi-address order · ⬜ Food + product *(→ Part C Q7/Q9/Q10)* · ⬜
Service + product · ⬜ Auction + normal purchase · ⬜ Master transaction
grouping *(→ Question 57, informed by Part C Q10 but not yet locked)*

---

## PART C — Live Resolutions

Each entry below is a rule the founder has explicitly locked, in the
founder's own words (lightly reformatted for markdown, content unchanged),
during a live follow-up round after the 58-question catalog was relayed.
The founder's own Q-numbering for this round (Q2, Q7, Q9, Q10, Q12, …) is
**independent of** the "Question 1–58" numbering in Part B — cross-links
above point from the relevant Part B item(s) into this section, not the
reverse. This section is expected to keep growing; append new locked
answers here as they arrive, in the order they're locked, and update the
cross-links in Part B / the checklist above when a new one lands.

### 🔒 Q2 RULE — Delivery Mode

Every multi-store checkout gets a **Delivery Mode** selection:

**1. DELIVER NOW**
Used when the customer needs the order immediately. For food, this is
effectively the required mode because prepared food cannot sit around
indefinitely. The system prioritizes: fast merchant preparation, nearby
rider, fast pickup, fast delivery. A single rider should not be forced to
collect stores that are too far apart if doing so would materially delay
the orders.

**2. DELIVER LATER**
For eligible non-food products, the customer can choose Deliver Later — the
order becomes a logistics window rather than an immediate delivery
(described by the founder as "Lazada logistics / Lalamove-style flexible
delivery"). The delivery fee is calculated in advance based on the route,
rather than changing simply because the customer waits.

Example:
```
STORE 1 → ₱50
STORE 2 → ₱130
STORE 3 → ₱80
TOTAL = ₱260
```
The customer sees this breakdown.

**Rider acceptance is granular.** A rider can accept Store 1 alone (₱50),
Store 2 alone (₱130), Store 1+2 (₱180), or Store 1+2+3 (₱260). Once a store
is accepted by one rider, it disappears from the available pool for other
riders; remaining stores continue looking for riders independently. The
customer does not select individual riders — the customer selects the
delivery strategy, while the rider chooses which available delivery
legs/orders to accept.

**Distance protection.** If two stores are too far apart for one efficient
route, RAPEX must block the combined-pickup option and instead require
separate riders per store. The customer cannot force an inefficient
single-rider route.

**Food rule.** Food = Deliver Now, because preparation and freshness
matter. Food does not inherit the (up to) 24-hour flexible delivery
behavior of hardware/non-food goods.

> ⚠️ **Still open, explicitly flagged by the founder in this same message:**
> whether the "24-hour" Deliver Later window starts when the customer
> places the order, or whether the customer actually chooses a delivery
> deadline within that window. Founder's own words: *"I don't yet know
> whether the 24-hour window starts when the customer places the order or
> whether the customer actually chooses a delivery deadline. So let's lock
> that next."* — **not yet resolved as of this writing.**

### 🔒 Q7 RULE — Food/Fresh vs Non-Food

RAPEX has separate ordering domains.

**🍔 Food order.** When the customer enters the Food category: Food uses
its own Grab/Foodpanda-style shopping experience. Customer can add
multiple food items to a food cart. Checkout creates a Food Order. Food
cannot be mixed with ordinary non-food products.

**🥬 Fresh products.** Fresh products can be combined with Food:
`FOOD + FRESH PRODUCTS = ONE FOOD/FRESH ORDER`. Example: Burger + fresh
vegetables + fresh meat + fresh fruit can potentially belong to the same
food/fresh ordering context, subject to merchant/order rules still to be
defined.

**📦 Non-food.** Everything else (Hardware, Sari-sari, Pharmacy,
Electronics, Clothing, Pre-Loved, etc.) remains in the general marketplace
order system and follows the non-food Order Engine.

**🚫 No mixing.** `Food + Hardware` is never one order. It is always
`FOOD ORDER + NON-FOOD ORDER` as two separate orders. Rationale given: this
keeps preparation time, delivery urgency, rider matching, and order states
from becoming "a giant tangled mess."

> ⚠️ **Still open, flagged by the founder in this same message:** fresh
> products can be tricky because some fresh goods are sold by wet markets,
> meat shops, cold storage, grocery stores, etc. — which of these count as
> "Fresh" for Food/Fresh-order eligibility is **not yet defined.**

### 🔒 Q9 RULE — Express Cart

RAPEX uses **one unified Express Cart UI** for purchasing, with two entry
points:

```
FOOD / FRESH
     ↓
Express Cart

NON-FOOD
     ↓
Save List
     ↓
Select Product
     ↓
Add to Express Cart
```

The cart interface itself is the same in both cases. The difference is in
how items get there: Food/Fresh items go directly into the Express Cart;
Non-Food items first go into the Save List, and only move to the Express
Cart when the customer decides to purchase. **Save List is not the cart —
Express Cart is the actual purchase staging area.**

Example:
```
SAVE LIST                    EXPRESS CART
──────────────               ──────────────
JLEX Hardware        →add→   Boysen Paint
☑ Boysen Paint                Plywood
☑ Plywood

FOOD                          EXPRESS CART
Burger                  →     Burger
Fries                          Fries
Fresh Chicken                  Fresh Chicken
```

Same cart UI, same checkout entry point in both cases, but the system
tracks the listing/order domain behind each item — this matters for the
backend because RAPEX should not have two separate shopping-cart systems.

### 🔒 Q10 RULE — Express Cart Mixing

The Express Cart **can** contain both Food/Fresh and Non-Food items at the
same time (e.g. 🍔 Burger + 🥬 Fresh Chicken + 🎨 Boysen Paint + 🔨 Plywood
together), even though they entered via different paths (Food/Fresh
directly, Paint/Plywood via Save List).

The founder's resolution (in their own words, lightly cleaned up from a
voice-dictated message): **because food is already added to cart, it
already has an order ID before checkout** — the order ID for the food
portion is already being processed even while still sitting in the cart —
so if the customer cancels that order ID, only the food portion cancels.
Non-food items added from the Save List into the Express Cart work
differently. Net effect: **when the customer opens a mixed Express Cart, it
shows a separate Food order ID and a separate Non-Food order ID within the
same cart view** — the cart itself can be mixed, but it is not a single
order underneath; it is (at minimum) two order IDs surfaced together in one
cart screen.

> This is closest to "Option A" of the three options originally posed
> (allow mixing in the Express Cart, but automatically separate into
> appropriate Food/Fresh and Non-Food order groups at/before checkout) —
> with the added, more specific detail that the Food-domain order ID exists
> **even before the customer finishes checking out**, not only after. This
> is evidence toward — but is not itself a full answer to — Part B's
> Question 57 (Master Transaction/Checkout ID), since it shows RAPEX already
> intends multiple order IDs under one cart/checkout experience for at
> least the Food-vs-Non-Food split.

### 🔒 Q12 RULE — Food Cart Expiration

Food/Fresh items have a limited cart lifetime because availability can
change quickly:

```
FOOD/FRESH ADDED TO EXPRESS CART
          ↓
       TIMER STARTS
          ↓
       3 HOURS  →  ⚠️ USER NOTIFIED
          ↓
       5 HOURS  →  FOOD CART ITEM EXPIRES
```

**At 3 hours** — notify the customer: *"Your food order has been in the
cart for 3 hours. Availability may change. Please check your cart."* The
customer can still act on it before expiration.

**At 5 hours** — the Food/Fresh cart items are automatically
removed/expired. The customer must return to the merchant and check the
products again before purchasing. Rationale: prevents the system from
assuming "because it was available 5 hours ago, it's still available now."

**Applies only to Food/Fresh Express Cart items — does NOT apply to the
Non-Food Save List**, which remains saved indefinitely with no expiration:

```
🍔 FOOD/FRESH               🔨 NON-FOOD
Express Cart                 Save List
→ 3h warning                 → remains saved
→ 5h expiration               → no 5h expiration
```

The expiration must **not** silently create a cancellation/refund — at
expiration the item is still only in cart state under this rule (i.e. no
payment/order has been placed against it yet, so there is nothing to
refund; it simply drops out of the cart).

### 🔒 Q19 RULE — Customer Delivery-Fee Reduction (Deliver-Later depletion)

Context: this extends the Deliver Later / 24-hour flexible-delivery model
from Q2. When a Deliver-Later delivery runs past its window, the delivery
fee **the customer owes** decreases over time — ₱5 every 20 minutes — and
that ₱5 reduction is explicitly **not** RAPEX revenue.

Example:
```
Original delivery fee: ₱100

After 24h:
24:20 → ₱95 customer delivery fee
24:40 → ₱90
25:00 → ₱85
...
```

So the longer the delivery is delayed past the window, the less the
customer ultimately pays for delivery. RAPEX does **not** collect the ₱5
reductions — they simply reduce what the customer owes.

**At ₱0** (delivery fee fully depleted): the order is marked **FAILED TO
DELIVER**, and a separate rider-liability rule activates, because the rider
accepted the delivery but failed to complete it within the fee-covered
window.

Two distinct financial concepts, kept separate:
- **Customer side** — delivery fee decreases → customer benefits, pays
  less the longer it takes.
- **Rider side** — failed delivery after fee depletion → rider becomes
  liable under the (still-to-be-detailed) failed-delivery rule.

> ⚠️ The exact **rider-liability rule** referenced here (what the rider
> owes/loses on a FAILED TO DELIVER after fee depletion) has not itself
> been spelled out yet — only that it "activates." Treat the liability
> mechanics as still open until locked explicitly.

*(Relates to Part B Question 41 — Refund: this is a fee-depletion rule,
distinct from a refund, since the customer isn't being refunded so much as
progressively charged less as time passes.)*

### 🔒 Q25 RULE — Cancellation Lockout at Delivery-In-Progress

Once an order reaches the delivery-in-progress stage, the customer
cancellation control becomes **CANCEL ORDER — UNAVAILABLE**:

- Button becomes greyed out
- Cancellation icon/text is crossed out
- Button is disabled
- Customer cannot initiate cancellation from the app

This applies once the rider has actually started the delivery/dispatch
stage. Current cancellation-lockout point in the flow:

```
ORDER PLACED
   ↓
Merchant Processing
   ↓
Rider Searching
   ↓
Rider Accepted
   ↓
Rider Going to Merchant
   ↓
PICKED UP
   ↓
🚚 DELIVERY IN PROGRESS
   ↓
❌ CANCEL BUTTON DISABLED
```

RAPEX does not rely solely on a penalty to discourage cancellation at this
stage — the option is removed from the UI entirely once cancelling could
seriously disrupt the delivery. If something genuinely goes wrong after
this point, it becomes a support/admin exception flow rather than a normal
customer-initiated cancellation.

> This **confirms** the direction of Part B Question 45 (Customer
> Cancellation) and the earlier-documented "no cancellation once en route"
> rule — cancellation is disabled from Delivery-In-Progress onward. It does
> not yet confirm the exact cutoff for every earlier stage (e.g. whether
> "Picked Up" but not yet "Delivery In Progress" still allows cancellation)
> — that finer-grained boundary is still implicit, not explicitly locked.

### ⬜ Question 26 — Merchant Cancellation (OPEN, EXPLICITLY PAUSED)

Posed immediately after Q25, but **explicitly paused by the founder before
being answered** — preserved here as still fully open, not to be guessed:

> Suppose the merchant accepted the order, but later says "Sorry, we don't
> have the product." Who should bear the consequence?
> - **A.** Customer gets full refund, no customer penalty.
> - **B.** Merchant receives a cancellation penalty.
> - **C.** Both: customer gets full refund + merchant receives an
>   operational penalty.
> - **D.** No penalty; merchant simply cancels.
> - **E.** Different rule depending on why the merchant cancelled.

Founder's own words pausing this: *"okay before This we move to Freelance
Booking and Registration"* — and, confirming the pause: *"Yep. Pause the
Order Engine here. We'll come back to Question 26 later. Now we switch
completely to Freelance / Service Provider Registration + Booking and do
the same thing: one question at a time. I won't generate the master prompt
yet."*

**This is a direct duplicate/overlap of Part B's Question 4** ("If one
merchant rejects: does the whole checkout fail, or only that merchant's
order?") and **Part B's Question 47** (Merchant timeout) — all three remain
open together as one unresolved merchant-side cancellation/rejection
cluster.

> **Topic-shift marker:** as of this point in the live round, the founder
> paused the Order Engine open-questions round (90% done by the founder's
> own estimate, with "remaining ARE LIST of CATEGORIES 10% RULES and Logic
> TO BE FOLLOWED during Operation" still to come) to begin a **separate**
> one-question-at-a-time round on **Freelance / Service Provider
> Registration + Booking**. Expect the next locked rules relayed to belong
> to that new topic, not to this Order Engine catalog — they should be
> captured in a dedicated Freelance/Service-Provider registration-and-
> booking file when they arrive, not folded into this one, to keep the two
> subject areas from blurring together.

---

*(End of current content. This file will be appended to as further Q&A
rounds are locked. Do not delete resolved items from Part B's numbering —
mark them resolved and point into Part C, so the record of what was
originally open and when it got resolved is preserved.)*
