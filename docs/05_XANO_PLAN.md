# 05 — Xano Plan

Xano is the backend for RAPEX: authentication, database, REST API, and all business logic (orders, wallet, products, auctions, users, merchants, reports).

This doc will track:
- Database schema / tables
- API endpoint groups
- Auth setup (roles: customer, rider, merchant, admin)
- Environment setup (dev / staging / production workspaces)

## Status
Not yet started. Xano workspace has not been created/documented here yet. The **Rider domain** below is drafted ahead of the workspace exactly so it can be built directly from this plan; field names here are still subject to change once entered into Xano and must be reconciled before any `Xano*Repository` implementation is written (see `packages/api-client/README.md` — "stop and report instead of guessing").

## Rider Domain

Business rules this plan implements: [docs/business/Rider.md](business/Rider.md).

### Tables

**riders**
| Field | Type | Notes |
|---|---|---|
| id | uuid pk | |
| user_id | fk -> users | 1:1, shared auth identity |
| full_name, email, phone, address, barangay, municipality, province | text | |
| birthday | date | age is derived, not stored |
| profile_photo, driver_license_doc, valid_id_doc, selfie_with_id_doc | file/attachment | |
| vehicle_type | enum(motorcycle, bicycle, car, van) | |
| plate_number | text | |
| verification_status | enum(pending, verified, rejected, suspended) | indexed |
| availability_status | enum(offline, online, busy) | indexed |
| location_permission_enabled | bool | |
| rating_sum, rating_count | int | avg computed, not stored |
| created_at, updated_at | timestamp | |

**rider_locations** (latest-only, upserted per rider; separate `rider_location_history` only for the duration of an active delivery)
id, rider_id fk, latitude, longitude, heading_degrees, speed_kph, accuracy_meters, updated_at (indexed on rider_id)

**delivery_type_rules** (admin-configurable, seeded per vehicle_type)
id, vehicle_type, max_weight_kg, max_distance_km, estimated_speed_kph, base_fare, per_km_rate, base_included_km, available (bool)

**delivery_offers**
id, order_id fk, rider_id fk (nullable until sent), status enum(pending, accepted, rejected, expired), distance_to_merchant_km, expires_at, responded_at, created_at (indexed on order_id, rider_id, status)

**orders** (shared with Customer/Merchant domains — rider-relevant columns only)
..., rider_id fk (nullable), delivery_status enum(waiting, assigned, accepted, going-to-merchant, arrived-merchant, picked-up, on-the-way, arrived-customer, delivered, completed, cancelled, failed-delivery, returned), delivery_radius_km, is_heavy_item, is_peak_hour

**delivery_timeline_events**
id, order_id fk, status, note (nullable), actor enum(rider, merchant, admin, system), occurred_at (indexed on order_id)

**delivery_proofs**
id, order_id fk unique, package_photo, customer_photo (nullable), signature_image, latitude, longitude, captured_at

**commission_calculations** (one immutable row per completed order)
id, order_id fk unique, base_fare, distance_fare, extra_distance_fare, peak_hour_bonus, heavy_item_bonus, merchant_subsidy, voucher_subsidy, promo_discount, platform_commission, rider_incentive, customer_tip, delivery_fee, net_rider_income, computed_at

**rider_wallets**
id, rider_id fk unique, operational_balance, income_balance, minimum_operational_balance (denormalized from config for fast reads)

**rider_wallet_transactions**
id, rider_id fk, wallet_type enum(operational, income), type enum(top-up, deduction, delivery-income, adjustment, penalty, remittance), label, amount, direction enum(credit, debit), order_id fk (nullable, for delivery-income rows), occurred_at (indexed on rider_id, occurred_at)

**weekly_incentive_progress**
id, rider_id fk, week_start (date), completed_deliveries, target_deliveries, reward_amount, achieved (bool), paid_out (bool) — unique on (rider_id, week_start)

**referrals**
id, referrer_rider_id fk, invited_rider_id fk (nullable until signup), status enum(invited, approved), points_awarded, occurred_at

**rider_notifications**
id, rider_id fk, type enum(new-order, wallet-updated, remittance-due, bonus-earned, verification-approved, announcement), title, body, read (bool), created_at (indexed on rider_id, read)

### Indexes
`riders(verification_status, availability_status)` composite — the assignment engine's hot-path filter. `delivery_offers(order_id, status)`, `delivery_timeline_events(order_id)`, `rider_wallet_transactions(rider_id, occurred_at)`, `weekly_incentive_progress(rider_id, week_start)` unique.

### API endpoint groups (rider-app consumer, matches `packages/api-client/src/repositories/rider|delivery|wallet`)
- `POST /rider/auth/register`, `/login`, `/request-otp`, `/verify-otp`, `/logout`, `GET /rider/auth/me`
- `GET/PATCH /rider/profile`, `POST /rider/profile/documents`, `PATCH /rider/profile/availability`, `PATCH /rider/profile/location-permission`, `GET /rider/profile/eligibility`, `GET /rider/profile/performance`
- `GET /rider/delivery/offer` (current pending offer or null), `POST /rider/delivery/offer/:id/accept`, `POST /rider/delivery/offer/:id/reject`
- `GET /rider/delivery/active`, `POST /rider/delivery/:orderId/status`, `POST /rider/delivery/:orderId/proof`, `GET /rider/delivery/history`
- `GET /rider/wallet`, `POST /rider/wallet/top-up`, `POST /rider/wallet/remittance`
- `GET /rider/earnings`, `GET /rider/incentive`, `GET /rider/referral`
- `GET /rider/notifications`, `POST /rider/notifications/:id/read`
- `POST /rider/location/ping`

### Client-side status
`packages/api-client` has typed `RiderRepository`, `DeliveryRepository`, `RiderWalletRepository`, `RiderEconomyRepository` interfaces with full `Mock*` implementations (stateful — real accept/reject/status-transition/wallet-credit logic, not static fixtures) wired into every consuming app via `createMockRepositories()`. Swapping in `Xano*Repository` implementations once this contract is confirmed in the real workspace is the only change needed — no screen or hook changes required, per the existing repository-pattern convention.
