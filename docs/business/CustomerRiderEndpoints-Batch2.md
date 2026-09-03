# Customer & Rider — Xano Endpoints Needed (Batch 2: Rider Profile, Wallet, Earnings, Dispatch/Delivery)

## Status
Unlike Batch 1's Marketplace/Cart/Checkout, **none of this has any Xano
contract at all yet** -- no frozen path, no schema conversation, nothing.
Every method below is Mock-only: no `XanoRiderRepository`,
`XanoRiderEconomyRepository`, or `XanoRiderWalletRepository` exists in the
codebase, and `XanoDeliveryRepository` (dispatch/offers/proof-of-delivery)
doesn't exist either.

**One real exception**: `GET /super_app/orders_delivery_details` (the "150m
Security Rule" endpoint) was reported via a business-rules export as
existing, but never independently confirmed live from this environment.
See `docs/business/Delivery.md`'s "150m Security Rule" section for its full
mechanics -- don't re-ask Xano for this one, just confirm it's live.

**Also blocking everything below**: `docs/api/README.md` flags that Rider
App has no confirmed `X-RAPEX-App` header value (the frozen contract only
defines `buyer`/`merchant`/`admin`) and isn't in the Base URLs table. This
needs answering before ANY of Rider's real wiring can start, regardless of
which endpoint gets built first:
1. What `X-RAPEX-App` value should riders send?
2. Which Xano API group does rider auth/data actually live in?

All endpoints below require `Authorization: Bearer <token>` and (once
answered) the correct `X-RAPEX-App` header.

---

## 1. Rider Profile

### GET /rider/profile (path is a guess -- confirm the real group name)
Response (`RiderProfile`):
```json
{
  "id": "...", "fullName": "...", "profilePhotoLabel": "...", "birthday": "...", "age": 0,
  "phone": "...", "email": "...", "address": "...", "barangay": "...", "municipality": "...", "province": "...",
  "vehicleType": "motorcycle" | "bicycle" | "car" | "van", "plateNumber": "...",
  "verificationStatus": "pending" | "verified" | "rejected" | "suspended",
  "availabilityStatus": "offline" | "online" | "busy",
  "locationPermissionEnabled": true,
  "documents": [{ "type": "driver-license" | "valid-id" | "selfie-with-id" | "profile-photo", "imageLabel": "...", "uploadedAt": "..." }],
  "rating": 0, "walletEligible": true, "createdAt": "..."
}
```

### PATCH /rider/profile
body: any subset of `{ fullName, phone, email, address, barangay, municipality, province, vehicleType, plateNumber }`
response: updated `RiderProfile`

### POST /rider/profile/documents
body: `{ type, imageLabel }` (or however Xano wants the uploaded asset reference — see the KYC upload pattern already confirmed elsewhere: `/super_app/assets/upload`)
response: updated `RiderProfile`

### POST /rider/availability
body: `{ status: "offline" | "online" | "busy" }` — response: updated `RiderProfile`

### POST /rider/location-permission
body: `{ enabled: boolean }` — response: updated `RiderProfile`

### GET /rider/assignment-eligibility
Response: `{ eligible: boolean, reasons: string[] }` — server-side check combining verified status, location on, wallet active, not suspended, online. **This must be a real server decision, not a frontend rule combining the fields above** — the reasons list needs to come from Xano so it stays authoritative if the eligibility rules change later.

### GET /rider/performance
Response:
```json
{ "acceptanceRatePercent": 0, "cancellationRatePercent": 0, "completionRatePercent": 0, "averageRating": 0, "averageDeliveryTimeMinutes": 0, "lifetimeEarnings": 0, "lifetimeDeliveries": 0 }
```

---

## 2. Rider Economy (earnings dashboard + weekly incentives + referrals + notifications)

### GET /rider/earnings-summary
Response: `{ "todayEarnings": 0, "weeklyEarnings": 0, "monthlyEarnings": 0, "lifetimeEarnings": 0, "deliveryCount": 0, "averageEarningsPerDelivery": 0, "totalDistanceKm": 0, "averageDeliveryTimeMinutes": 0 }`

### GET /rider/incentive-progress
Response: `{ "weekStart": "...", "weekEnd": "...", "completedDeliveries": 0, "targetDeliveries": 0, "rewardAmount": 0, "achieved": false, "paidOut": false }` — the "weekly delivery target bonus" engine. Needs Xano to confirm the actual target/reward formula — this is a real payout, not cosmetic.

### GET /rider/referral-summary
Response: `{ "referralCode": "...", "qrCodeDataUrl": "...", "invitedCount": 0, "approvedCount": 0, "pointsThisMonth": 0, "maxPointsPerMonth": 0, "history": [{ "riderName": "...", "status": "invited" | "approved", "pointsAwarded": 0, "occurredAt": "..." }] }`

### GET /rider/notifications
### POST /rider/notifications/{notification_id}/read
Response items: `{ "id": "...", "type": "new-order" | "wallet-updated" | "remittance-due" | "bonus-earned" | "verification-approved" | "announcement", "title": "...", "body": "...", "read": false, "createdAt": "..." }`

---

## 3. Rider Wallet

Two-bucket wallet: **Operational** (rider tops this up themselves, used for
app-side costs) and **Income** (delivery earnings accumulate here, rider
withdraws/remits out). This matches the enum already confirmed live in the
`user`-table's `wallet` schema earlier this project (`wallet_type: STANDARD
| RIDER | MERCHANT | ESCROW`) — confirm whether Rider's operational/income
split is two rows keyed by that same `wallet_type`, or a different table
entirely.

### GET /rider/wallet-summary
Response:
```json
{
  "operationalBalance": 0, "incomeBalance": 0, "minimumOperationalBalance": 0,
  "transactions": [{ "id": "...", "walletType": "operational" | "income", "type": "top-up" | "deduction" | "delivery-income" | "adjustment" | "penalty" | "remittance", "label": "...", "amount": 0, "direction": "credit" | "debit", "occurredAt": "..." }]
}
```

### POST /rider/wallet/top-up-operational
body: `{ amount: number }` — needs a real payment method attached (PayMongo QR Ph, already integrated elsewhere in this project) — response: updated `RiderWalletSummary`

### POST /rider/wallet/request-remittance
body: `{ amount: number }` — cashing out the income balance — response: updated `RiderWalletSummary`. Confirm the actual payout rail (bank transfer? GCash? manual admin approval?) since this is real money leaving the platform.

---

## 4. Delivery / Dispatch

This is the highest-stakes gap in the whole Rider surface — it's the actual
order-assignment and money-settlement engine.

### GET /rider/current-offer (long-poll or subscribe — confirm which)
Response: `DeliveryAssignmentOffer | null` — see `packages/api-client/src/repositories/types.ts` line ~562 for the full shape (merchant/customer coordinates, pickup/delivery distance, product total, delivery fee, estimated rider earnings, `expiresAt`, `secondsToRespond`). The 20-second accept/reject countdown is real product behavior, not cosmetic — confirm Xano can push/return this fast enough for a live countdown to make sense.

### POST /rider/offers/{offer_id}/accept
Response: `ActiveDelivery` (line ~589)

### POST /rider/offers/{offer_id}/reject
No body. Rejecting (or letting the 20s countdown expire) hands the offer to the next-nearest rider — confirm this reassignment logic lives entirely server-side.

### GET /rider/active-delivery
Response: `ActiveDelivery | null`

### POST /rider/deliveries/{order_id}/advance-status
body: `{ status: DeliveryOrderStatus, note?: string }` (see the 13-state `DeliveryOrderStatus` enum, line ~541 — waiting through returned)

### POST /rider/deliveries/{order_id}/proof
body: `DeliveryProof` (line ~611) — **this single call is supposed to settle the whole order**: mark delivered, deduct customer wallet, credit merchant + rider, record platform revenue, advance to completed. This needs to be one atomic Xano transaction, not multiple calls the frontend orchestrates — confirm that's how it'll be built.

### GET /rider/delivery-history
Response: array of `ActiveDelivery`

### POST /rider/route-estimate
body: `{ origin: {lat,lng}, destination: {lat,lng} }` — proxies Google Maps Directions API server-side (never call Directions directly from the client — keeps the API key server-only). Response: `RouteEstimate`.

### POST /rider/delivery-fee-quote
body: `{ distanceKm: number }` — response: `DeliveryFeeQuote`. Same Delivery Fee Engine Admin's Order Financials batch already references — should read from the same formula/tier source, not a separate implementation.

### GET /rider/deliveries/{order_id}/financials
Response: `OrderFinancials | null` — rider's own settlement view of one completed delivery.

---

## Priority note
Section 4 (Delivery/Dispatch) and Section 3 (Wallet) are the actual
money-moving core of the Rider app — everything else (profile, earnings
display, referrals, notifications) is read-heavy and lower-risk. If Xano's
queue needs sequencing, the `X-RAPEX-App` header question at the top of
this document blocks literally everything below it and should be answered
first regardless of feature priority.
