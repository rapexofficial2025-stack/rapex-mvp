# Delivery

## Status
**Received, not independently verified.** Everything below came from a 2026-08-04
ChatGPT business-rules planning session (exported and handed to Claude on
2026-08-10) — the source doc describes it as "hardened/final" and the 150m
section as "ready to hand to a developer/Claude Code as-is." It has **not**
been confirmed against a live Xano instance from this environment (no network
access to Xano here) — treat it as the authoritative target contract to build
against, not as something already proven working end-to-end.

## Order status (forward-only, no skipping)
`Pending → Merchant Accepted → Preparing → Ready for Pickup → Rider Accepted
→ Picked Up → Delivering → Completed` (or `Cancelled` at an allowed point —
see Cancellation below). No state may be skipped or reversed.

## Escrow flow
Customer checks out → Wallet Reserved → Merchant prepares → Rider delivers →
Completed → Escrow Released → Merchant Paid → Rider Paid → Platform Ledger
Updated. Ties to `docs/business/Wallet.md`'s ledger/transaction model.

## Delivery Fee Engine
`Delivery Fee = Base Fare + Distance Fee` (+ future Surge). Calculated
entirely by Xano — the frontend only ever displays the number Xano returns,
never computes it locally (matches `@rapex/utils`'s `DeliveryFeeQuote` type
already used in `packages/api-client/src/repositories/types.ts`).

## The "150m Security Rule" (rider ↔ customer contact visibility)
Customer contact details are hidden from the rider until the rider is
physically within 150 meters of the merchant. This is enforced **server-side**
(Xano omits the customer fields from the API response entirely when locked —
not just a frontend hide) so it can't be bypassed by reading raw network
traffic.

**8-phase rider delivery lifecycle:**
1. **Order Accepted** — rider sees Merchant name/logo/address/GPS/contact, order number, product list, special instructions. Customer name/phone/address/exact GPS/chat are NOT visible yet.
2. **Going to Merchant** (`rider_accepted`) — navigation to merchant; customer info/pin/chat/call all locked.
3. **Arrived at Merchant** — distance ≤150m auto-unlocks customer Name/Phone/Address/GPS/Notes + Call/Chat buttons.
4. **Merchant Preparing** — customer sees "Merchant is preparing your order"; rider sees "Waiting for Merchant" + timer.
5. **Ready for Pickup** — merchant presses a button → rider is notified "Your order is ready."
6. **Picked Up** (`picked_up`) — customer app now shows Rider photo/name/vehicle/plate (optional)/live location/ETA.
7. **Delivering** (`delivering`) — customer sees live Orange rider pin; Merchant pin disappears; Customer pin stays Green.
8. **Delivered** (`completed`) — rider presses Complete Delivery → automatic Escrow Released → Merchant Paid → Rider Paid → Platform Commission → Rating screen opens.

**Contact visibility table:** Merchant address/contact = visible always.
Customer name/address/phone/chat/live pin = hidden before 150m, visible after.

**Full mechanics ("The Shield"):**
- **Locked (distance > 150m):** rider sees full store info; customer shows as `"RAPEX Customer"`, phone/address show `"Hidden (Reach pickup to unlock)"`. Customer's map shows only "Rider Heading to Store" text, no live pin (protects rider privacy en route).
- **Unlocked (distance ≤ 150m):** Xano flips `is_pickup_unlocked` to `true`; rider sees full Name/Phone/Address; customer's map shows the live Orange pin.
- **Status override:** once order status becomes `picked_up`, the shield is **permanently disabled** for that order — rider keeps full visibility for the rest of transit.
- **GPS heartbeat requirement:** riders must send a location update at least every 30 seconds; if the last heartbeat is older than 2 minutes, the shield **defaults to LOCKED** (fail-closed, not fail-open).

**Reported API endpoint (unverified live):** `GET /super_app/orders_delivery_details` — computes a real-time distance between rider and store on every call.

Example response, locked (dist 500m):
```json
{
  "pickup_unlocked": false,
  "dist_to_pickup": 0.5,
  "customer": "HIDDEN (Reach pickup to unlock)",
  "merchant": { "name": "Burger Shop", "address": "Kawit, Cavite" }
}
```

Example response, unlocked (dist 100m):
```json
{
  "pickup_unlocked": true,
  "dist_to_pickup": 0.1,
  "customer": {
    "full_name": "Irvin Jay",
    "mobile": "+639123456789",
    "address": "1618 Advincula Ave, Kawit"
  }
}
```

**Implementation rule:** when rider-side order/tracking screens get built,
gate all customer-detail rendering purely on the `pickup_unlocked` boolean
from this endpoint's response — never compute distance/visibility
client-side, since the whole point of server-side filtering is that it can't
be spoofed from the app.

## Cancellation window
Customer may cancel only before Merchant Accepts. Merchant may reject before
Preparing. Rider may cancel before Pickup. After Pickup, cancellation is
disabled entirely.

## Delivery evidence on completion
Delivery photo (optional in Alpha, mandatory later if enabled), customer
signature (future), customer PIN (future), GPS confirmation, completion
timestamp.

## Map pin colors
Merchant = Purple, Customer = Green, Rider = Orange. Location polling every
5-10 seconds. **Already matches what's implemented** —
`packages/constants/src/mapMarkers.ts`'s `MAP_MARKER_COLORS` uses this exact
scheme (customer `#22C55E` green, merchant `#8B5CF6` purple, rider `#F97316`
orange), added independently earlier this session before this source doc was
reviewed — good consistency signal, no change needed.

## Notification triggers
Merchant Accepted → notify Customer. Merchant Ready → notify Rider. Rider
Accepted → notify Customer. Picked Up → notify Customer. Delivered → notify
Customer.

## Merchant / Rider permissions
**Merchant may:** create store, upload/edit product, receive/prepare orders,
view earnings. **Cannot:** change customer price, modify commission, modify
delivery fee, approve own products, override wallet.

**Rider may:** accept booking, navigate, pickup, deliver, complete order.
**Cannot:** see customer contact before unlock, edit order, change price,
modify wallet.
