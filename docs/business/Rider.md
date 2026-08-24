# Rider

Business rules for Rider. This is the source of truth for Xano database/API design for the rider domain — see [../05_XANO_PLAN.md](../05_XANO_PLAN.md#rider-domain) for the corresponding table/endpoint plan and the `packages/api-client` `Rider*`/`Delivery*` repository interfaces for the provisional client-facing shapes already built against it (`packages/api-client/src/repositories/types.ts`, `.../rider/`, `.../delivery/`, `.../wallet/RiderWalletRepository.ts`).

## Status
Drafted. Frozen once reconciled against the real Xano workspace field-for-field, per the project's "don't guess Xano field names" rule (see `packages/api-client/README.md`).

## 1. Authentication
- Rider accounts are a distinct role (`rider`) from customer/merchant/admin, sharing the login-module OTP flow (email + phone, both required before an account can request verification).
- Password reset re-uses the OTP flow against the registered email.
- A rider's `AuthUser` never grants marketplace/merchant scopes — role is enforced server-side, not just client-side routing.

### 1a. Registration flow (2026-08-20 update — received, not independently verified)
From the same GPT-authored auth-flow reconciliation as `Authentication.md`. 6-step registration:
1. **Create Rider Account** — First Name, Last Name, Email, Mobile Number, Password, Confirm Password.
2. **Verify** — Email OTP, Mobile OTP.
3. **Basic Rider Information** — Birthday, Gender, Profile Photo, Residential Address.
4. **Rider Information** — Vehicle Type, Vehicle Brand/Model, Plate Number (if applicable), Driver License (if applicable), Vehicle Photo.
5. **Identity Verification** — ID Type, ID Number, ID Front, ID Back, Selfie with ID.
6. **Submit.**

Status chain:
```
REGISTERED → EMAIL_VERIFIED → MOBILE_VERIFIED → IDENTITY_SUBMITTED →
RIDER_REVIEW → APPROVED → ACTIVE
```
Only `APPROVED` + `ACTIVE` riders can receive delivery assignments —
consistent with the existing eligibility rule in §3 below.

## 2. Rider Profile
Fields: profile photo, full name, birthday, age (derived, not stored, from birthday), phone, email, address, barangay, municipality, province, vehicle type, plate number, driver's license, valid ID, selfie holding ID.

Status enum is **two independent dimensions**, not one:
- `verificationStatus`: `pending -> verified | rejected`, and `verified -> suspended` (admin-only, reversible back to `verified`).
- `availabilityStatus`: `offline <-> online <-> busy`, rider-controlled except `busy` (system-set while a delivery is active) and force-offline on suspension.

## 3. Rider Verification Engine
A rider is eligible to receive delivery assignments only when **all** of:
1. `verificationStatus = verified`
2. Device location permission is enabled
3. Operational wallet balance >= platform minimum (wallet "active")
4. `verificationStatus != suspended` (redundant with #1 but checked explicitly since suspension can happen after initial verification)
5. `availabilityStatus = online`

This is a pure function of current rider state — re-evaluated on every assignment search pass, not cached.

## 4. Delivery Assignment Engine
1. Merchant confirms order -> order enters `waiting`.
2. Candidate search: riders within the delivery radius of the merchant, filtered by the Verification Engine eligibility check (#3) plus `availabilityStatus = online` and not already on an active delivery.
3. Sort candidates by distance to merchant, ascending.
4. Send the offer to the nearest candidate only (not broadcast) with a 20-second response window.
5. Accept -> order moves to `assigned` then `accepted`, offer is removed from all other riders.
6. Reject or 20s timeout -> offer advances to the next-nearest candidate. Exhausting the candidate list surfaces the order to admin as unassignable.

## 5. Delivery Workflow Engine
Status sequence (forward-only, one exception path):

```
waiting -> assigned -> accepted -> going-to-merchant -> arrived-merchant -> picked-up
  -> on-the-way -> arrived-customer -> delivered -> completed
```

Exception paths: any active status can move to `cancelled`; `picked-up` / `on-the-way` / `arrived-customer` can move to `failed-delivery` instead of continuing; `failed-delivery` can resolve to `returned`.

Every status transition writes a timeline entry (status, timestamp, optional note, actor) and fires the Notification Engine for customer, merchant, admin, and the rider's own dashboard. No status may be skipped — the API rejects a transition that isn't in the allowed-next-status set for the order's current status.

## 6. Delivery Type Engine
Per vehicle type (motorcycle, bicycle, car, van): max weight, max distance, estimated speed, base fare, per-km rate, availability toggle. Orders are matched to a vehicle type by weight/distance capacity before candidate search runs (§4) — a bicycle-only rider is never offered an order that exceeds bicycle capacity.

## 7. Commission Engine
```
deliveryFee = baseFare + distanceFare + extraDistanceFare + peakHourBonus + heavyItemBonus
              + merchantSubsidy + voucherSubsidy - promoDiscount
platformCommission = deliveryFee * commissionRate   (commissionRate is admin-configurable per vehicle type/zone)
netRiderIncome = deliveryFee - platformCommission + customerTip + riderIncentive
```
Subsidies, discounts, tips, and incentives are computed on the order/promo/tip data at commission-calculation time, not guessed by the rider client — the client only displays the breakdown the API returns. Every calculation is persisted immutably (one `commission_calculations` row per completed order) for audit/reporting.

## 8. RAPEX Wallet Engine (Rider)
Two ledgers per rider: **Operational** (funds available to accept deliveries; auto-debited a small hold per delivery, top-up by the rider) and **Income** (accumulated net earnings; auto-credited on delivery completion, withdrawable via remittance request).
- A rider cannot accept an offer while `operationalBalance < minimumOperationalBalance` (admin-configurable floor).
- Delivery completion is the only trigger that credits Income and debits Operational automatically — all other movements (top-up, remittance, penalty, adjustment) are explicit rider or admin actions, each recorded as a typed transaction.

## 9. Rider Earnings Engine
Dashboard aggregates (today / week / month / lifetime) are rollups over completed-delivery commission records — never a separately maintained running total, to avoid drift. Average earnings, total distance, and average delivery time are derived from the same completed-delivery set.

## 10. Weekly Incentive Engine
- Window: Monday 00:00:00 to Sunday 23:59:59, rider's local timezone.
- Target: 60 **completed** deliveries in the window (cancelled and failed deliveries excluded from the count).
- Reward: flat ₱500, paid once per rider per week the target is met, credited to the Income wallet the moment the 60th qualifying delivery completes (not batched at week-end).
- Counter resets to zero at the start of each window; historical weeks remain queryable for reporting.

## 11. Referral Engine
- Every verified rider gets a unique referral code + QR.
- +2 points per referred rider who reaches `verified` status (not just signup) — prevents gaming via unverifiable invites.
- Monthly cap: 100 points per rider, resets on the 1st.
- Full audit trail: who was invited, current status, points awarded, timestamp.

## 12. Real-Time Location Engine
Riders push `{latitude, longitude, headingDegrees, speedKph, accuracyMeters}` on an interval while `availabilityStatus != offline`. Latest ping per rider is what customer/merchant/admin views read — history is retained only for the duration of an active delivery (for delivery-time analytics), not indefinitely, for storage and privacy reasons.

## 13. Notification Engine
Centralized dispatch (not per-feature ad hoc sends) for: new order, wallet updated, remittance due, bonus earned, verification approved, announcement. Every notification is persisted (read/unread) in addition to any push delivery, so the in-app notification list is authoritative even if push fails.

## 14. Delivery Proof Engine
Required before a delivery can move `arrived-customer -> delivered`: package photo, digital signature, GPS coordinates, timestamp. Customer photo is optional. Proof is immutable once submitted and stored against the order permanently (dispute evidence).

## 15. Performance Engine
Computed, not stored as mutable fields, from the rider's historical offer/delivery/rating records:
- Acceptance rate = offers accepted / offers received
- Cancellation rate = deliveries cancelled / deliveries started
- Completion rate = deliveries completed / deliveries started
- Average rating = sum(ratings) / count(ratings)
- Average delivery time = sum(completed delivery durations) / count(completed deliveries)

These are the same formulas implemented client-side (for optimistic display) in `packages/utils/src/riderEngine.ts` — the API response is always authoritative; the client formula exists for instant UI feedback only.
