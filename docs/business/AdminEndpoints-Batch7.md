# Merchant Portal — Xano Endpoints Needed (Batch 7: everything still on MockMerchantRepository)

## Status
`XanoMerchantRepository` (`packages/api-client/src/repositories/merchant/
XanoMerchantRepository.ts`) only has real Xano wiring for `createStore`,
`createProduct`, and `completeOnboarding`. Every other method listed below
delegates to `MockMerchantRepository` because no confirmed contract exists
yet. `getMyStores`/`getStoreProducts` are also still Mock even though
`createStore`/`createProduct` are real — flagged in section 1.

Field names below are copied directly from `MerchantRepository`'s interface
and `types.ts` (both already fully designed on the frontend) — Xano's
response should use these exact camelCase keys, same convention as the
Admin batches, so the adapter layer stays a straight passthrough.

All endpoints require `Authorization: Bearer <token>` and should only
return/mutate data belonging to the authenticated Merchant's own account —
every one of these needs a server-side ownership check, not just an
auth-required check (a merchant must never be able to read or edit another
merchant's store by guessing an ID).

---

## 1. Stores (close the gap left by createStore/createProduct)

### GET /admin-master-data/stores (mine)
Returns only the calling merchant's own stores. Response: array of
`MerchantStore`:
```json
{ "id": "...", "merchantAccountId": "...", "name": "...", "category": "...", "status": "online" | "offline", "approvalStatus": "pending" | "approved" | "rejected", "address": "...", "coverageRadiusKm": 2, "rating": 0, "productCount": 0, "description": "...", "phone": "...", "businessHours": "...", "logoLabel": "...", "coverImageLabel": "...", "latitude": 0, "longitude": 0 }
```

### GET /admin-master-data/stores/{store_id}
Same shape, single record, or `null`/404 if not found or not owned by the caller.

### PATCH /admin-master-data/stores/{store_id}
body: any subset of `{ name, category, address, coverageRadiusKm, description, phone, businessHours, logoLabel, coverImageLabel, latitude, longitude }`
response: updated `MerchantStore`

### POST /admin-master-data/stores/{store_id}/toggle-status
No body — flips online/offline. response: updated `MerchantStore`

### GET /admin-master-data/store-slots
Response: array of
```json
{ "index": 0, "label": "Main Store", "status": "unlocked" | "available" | "locked", "unlockLevel": 1, "store": { ...MerchantStore or null... } }
```
This is the gamified "unlock more store slots by leveling up" screen — needs
`MerchantAccount.level`/`xp` (below) to already be tracked.

---

## 2. Merchant Account (profile + gamification)

### GET /admin-master-data/merchant/me
Response:
```json
{ "id": "...", "ownerName": "...", "email": "...", "verificationStatus": "pending" | "verified" | "rejected", "onboardingStatus": "draft" | "submitted" | "under_review" | "approved" | "rejected", "level": 1, "xp": 0, "xpForNextLevel": 500 }
```

---

## 3. Registration Draft (onboarding wizard, steps 1-7, before `completeOnboarding` fires)

### GET /admin-master-data/merchant/registration-draft
### PATCH /admin-master-data/merchant/registration-draft
body: any subset of the ~25 fields in `MerchantRegistrationDraft` (KYC,
business category/nature, store details, business documents, store
appearance — see `packages/api-client/src/repositories/types.ts` line ~172
for the exhaustive field list, all already named).
response: full updated draft.

### POST /admin-master-data/merchant/registration-draft/products
body: `{ name, price, productCategory }` — response: updated draft (with the new item appended to `draftProducts`)

### DELETE /admin-master-data/merchant/registration-draft/products/{draft_product_id}
response: updated draft

### POST /admin-master-data/merchant/registration-draft/submit
No body — moves `onboardingStatus` to `submitted`. response: updated draft.

Note: this looks like it may overlap with the already-real, single-atomic
`POST /rapex-auth/merchant/complete-onboarding` (see
`XanoMerchantRepository.completeOnboarding`'s doc comment) — worth
confirming with whoever owns Xano whether this step-by-step draft flow is
still the intended path, or whether `complete-onboarding` has superseded it
and this section should be dropped instead of built.

---

## 4. Products (beyond createProduct)

### GET /admin-master-data/stores/{store_id}/products
Response: array of `MerchantProduct` (= `ProductSummary` + `stock`,
`isActive`, `variantCount`) — `ProductSummary` fields (`id`, `storeId`,
`name`, `price`, `imageLabel`, `productCategory`) are already confirmed via
the Customer app's marketplace endpoints, so this should return the exact
same shape.

### PATCH /admin-master-data/products/{product_id}
body: any subset of `{ name, price, stock, isActive }`
response: updated `MerchantProduct`

### POST /admin-master-data/stores/{store_id}/products/bulk-import
body: `{ rows: [{ name, price, productCategory, stock }] }`
response: `{ imported: [...MerchantProduct], failedCount: 0 }`

### GET /admin-master-data/products/{product_id}/variants
### POST /admin-master-data/products/{product_id}/variants
body: `{ name, priceDelta, stock, sku }` — response: created `ProductVariant`
### PATCH /admin-master-data/variants/{variant_id}
body: any subset of the fields above — response: updated `ProductVariant`
### DELETE /admin-master-data/variants/{variant_id}
response: `{ success: true }`

---

## 5. Store Expansion Requests

### GET /admin-master-data/stores/{store_id}/expansion-requests
Response: array of
```json
{ "id": "...", "storeId": "...", "type": "new-branch" | "coverage-increase", "proposedAddress": "...", "requestedCoverageRadiusKm": 2, "note": "...", "status": "pending" | "approved" | "rejected", "submittedAt": "..." }
```

### POST /admin-master-data/stores/{store_id}/expansion-requests
body: `{ type, proposedAddress?, requestedCoverageRadiusKm?, note }`
response: created record (status starts `"pending"` — an Admin-side approve/
reject action for these should be added to a future Admin batch once this
exists).

---

## 6. Nearby Riders, Insights, Timeline (store dashboard widgets)

### GET /admin-master-data/stores/{store_id}/nearby-riders
Response: array of
```json
{ "id": "...", "name": "...", "vehicleType": "...", "distanceKm": 1.2, "rating": 4.8, "availability": "available" | "busy" | "offline" }
```

### GET /admin-master-data/stores/{store_id}/insights
Response:
```json
{ "totalRevenue": 0, "totalOrders": 0, "avgOrderValue": 0, "completionRate": 0, "last7DaysRevenue": [{ "date": "...", "revenue": 0 }], "topProducts": [{ "productId": "...", "name": "...", "unitsSold": 0, "revenue": 0 }] }
```

### GET /admin-master-data/stores/{store_id}/timeline
Response: array of
```json
{ "id": "...", "storeId": "...", "type": "order" | "store" | "product" | "system", "message": "...", "occurredAt": "..." }
```

---

## 7. Orders (merchant-facing accept/reject)

### GET /admin-master-data/merchant/orders (mine, across all my stores)
Response: array of `MerchantOrder` (= `OrderSummary` + `customerName`):
```json
{ "id": "...", "storeName": "...", "customerName": "...", "status": "pending" | "accepted" | "preparing" | "ready" | "delivering" | "completed" | "cancelled", "total": 0, "placedAt": "...", "itemCount": 0 }
```

### POST /admin-master-data/orders/{order_id}/accept
### POST /admin-master-data/orders/{order_id}/reject
Both: no body — response: updated `MerchantOrder`. Should fail if the order
doesn't belong to one of the caller's own stores, or isn't in a state that
can still be accepted/rejected.

### GET /admin-master-data/stores/{store_id}/order-financials
Response: array of `MerchantOrderFinancials`:
```json
{ "orderId": "...", "distanceKm": 0, "deliveryFee": 0, "customerPayment": 0, "merchantReceives": 0 }
```
This is the merchant's own view of the same Delivery Fee Engine settlement
Batch 1's `GET /admin-master-data/order-financials` gives Admin — same
underlying data, scoped to one store, so it should read from the same
source table Admin's version does.

---

## 8. Vouchers

### GET /admin-master-data/stores/{store_id}/vouchers
Response: array of `MerchantVoucher`:
```json
{ "id": "...", "storeId": "...", "code": "...", "discountType": "percent" | "fixed" | "free_delivery", "discountValue": 0, "minOrderAmount": 0, "usageLimit": null, "usedCount": 0, "expiresAt": null, "active": true, "createdAt": "..." }
```

### POST /admin-master-data/stores/{store_id}/vouchers
body: `{ code, discountType, discountValue, minOrderAmount, usageLimit?, expiresAt? }`
response: created `MerchantVoucher`

### POST /admin-master-data/vouchers/{voucher_id}/deactivate
No body — response: updated `MerchantVoucher` (`active: false`)

---

## Batches complete
This closes the "Next batches" list started in `AdminEndpoints.md` — Batches
1-6 cover Admin/Super Admin, this one covers the rest of Merchant. Total: 7
spec documents, ~90 endpoints across Admin, Super Admin, and Merchant.
