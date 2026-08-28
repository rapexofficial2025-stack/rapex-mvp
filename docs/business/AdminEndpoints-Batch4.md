# Admin Portal — Xano Endpoints Needed (Batch 4: Order Management, Delivery Monitoring, Rider Management)

## Status
None of these exist in Xano yet. All three screens are empty shells
(`AdminDataModulePage.tsx`) with no repository behind them — read-only
monitoring views over state that Rider-app and Customer-app repositories
already model (`RiderProfile`, `DeliveryOrderStatus`, `ActiveDelivery` etc.
in `packages/api-client/src/repositories/types.ts`). Field names below
reuse those exact types where the same concept applies, so Admin's view and
Rider's own view of the same order stay consistent.

All endpoints require `Authorization: Bearer <token>`, Admin/Super Admin
only. Support `search`, `page`, `perPage` on list endpoints unless noted.

---

## 1. Order Management

### GET /admin-master-data/orders
Query params (optional): `status` (one of `OrderStatus` --
pending|accepted|preparing|ready|delivering|completed|cancelled -- plus the
UI's extra tabs: confirmed, ready for pickup, assigned, in transit, failed,
refunded -- confirm the full set with whoever owns the order state machine)

Response: array of
```json
{
  "id": "ORD-...",
  "customerName": "...",
  "merchantName": "...",
  "riderName": "...",
  "paymentMethod": "cod" | "qr_ph" | "wallet",
  "amount": 0,
  "status": "pending",
  "placedAt": "..."
}
```

### GET /admin-master-data/orders/{order_id}
Full detail: order lines, `DeliveryTimelineEntry[]`-style status history,
customer/merchant/rider contact info. Exact shape TBD once Xano's orders
table is confirmed -- this is read-only monitoring, not a new order engine,
so it should just expose what already exists on the order + delivery
records.

This overlaps with Batch 1's `GET /admin-master-data/order-financials`
(settlement breakdown) -- that endpoint can stay separate (it's specifically
for the Delivery Fee Engine's revenue view) or this one can absorb it if
that's simpler on the Xano side. Flag which way you want to go.

---

## 2. Delivery Monitoring

### GET /admin-master-data/deliveries
Query params (optional): `status` (`DeliveryOrderStatus` --
waiting|assigned|accepted|going-to-merchant|arrived-merchant|picked-up|
on-the-way|arrived-customer|delivered|completed|cancelled|failed-delivery|
returned -- the UI groups these into "Waiting for rider / Assigned / In
transit / Completed / Failed" tabs, so a `statusGroup` field computed
server-side would save the frontend from re-deriving that mapping)

Response: array of
```json
{
  "orderId": "ORD-...",
  "deliveryType": "food" | "package" | "grocery",
  "vehicleType": "motorcycle" | "car" | "bicycle",
  "distanceKm": 2.5,
  "fare": 50,
  "etaMinutes": 12,
  "riderName": "...",
  "status": "on-the-way"
}
```

---

## 3. Rider Management

### GET /admin-master-data/riders
Query params (optional): `status` (All | Pending verification | Active |
Online | Offline | On delivery | Suspended | Rejected)

Response: array of, reusing `RiderProfile`'s field names directly:
```json
{
  "id": "RDR-...",
  "fullName": "...",
  "phone": "...",
  "vehicleType": "motorcycle",
  "verificationStatus": "verified",
  "availabilityStatus": "online",
  "currentOrderId": "ORD-..." ,
  "deliveriesCount": 0,
  "status": "Active"
}
```
`status` here is the admin-facing account status (Active/Suspended/
Rejected/Pending verification), separate from `availabilityStatus`
(online/offline/busy) and `verificationStatus` (KYC) -- all three are
independent per the existing `RiderProfile` type's own doc comment.

### GET /admin-master-data/riders/{rider_id}
Full profile: same shape as `RiderProfile` (documents, rating, wallet
eligibility, address) plus deliveries/earnings history.

### POST /admin-master-data/riders/{rider_id}/suspend
body: `{ reason: string }` -- response: `{ success: true }` (audited action)

### POST /admin-master-data/riders/{rider_id}/reinstate
response: `{ success: true }` (audited action)

### GET /admin-master-data/riders/active-deliveries
Response: array of `ActiveDelivery`-shaped records (see
`packages/api-client/src/repositories/types.ts` line ~589) for every rider
currently on a delivery -- this is the admin-wide view of what each
individual rider's own app already shows for themselves.

---

## Next batches (not written yet)
- Error Center, Operational Settings
- Super Admin (Admin Accounts, Users & Roles, Stores & Merchants, Products &
  Listings, Audit & Recovery, Receipt Design, Secure Exports)
- Merchant portal's remaining ~25 mock methods
