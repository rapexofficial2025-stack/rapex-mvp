# Customer & Rider — Xano Endpoints Needed (Batch 1: Marketplace, Cart, Orders, Child Accounts)

## Status
Different situation than the Admin/Merchant batches. `docs/api/README.md` already
**froze** the paths below back on 2026-08-something -- Marketplace, Cart, Pricing,
and Checkout are section 2-5 of that document. What's still missing is the
**field-level request/response schema** for each, and the actual `XanoMarketplaceRepository`
class was never written (no file exists at all -- `MarketplaceRepository` only
has a Mock implementation). `XanoOrdersRepository` exists but only
`placeOrder()` is real; `getCheckoutSummary`, `getMyOrders`, `getOrderById`
still delegate to Mock.

So for section 1-3 below: **don't ask Xano to design new endpoints** --
ask for the exact response body of the endpoints already agreed at these paths.

Child Accounts (section 4) is genuinely new -- no path was ever frozen for it.

All endpoints require `Authorization: Bearer <token>`, `X-RAPEX-App: buyer`.

---

## 1. Marketplace (already-frozen paths, schema needed)

### GET /rapex-market/products
Query params: unclear if this takes `storeId`/`category`/`search` -- confirm.
Powers `getProductsByStore()` and `searchProducts()`. Expected response array of:
```json
{ "id": "...", "storeId": "...", "name": "...", "price": 0, "imageLabel": "...", "productCategory": "..." }
```
(matches `ProductSummary` exactly -- `packages/api-client/src/repositories/types.ts` line ~52)

### GET /rapex-market/products/{id}
Powers `getProductById()`. Expected response (`ProductDetail` = `ProductSummary` +):
```json
{ "description": "...", "storeName": "...", "stock": 0, "variants": [{ "id": "...", "name": "...", "priceDelta": 0 }], "addOns": [{ "id": "...", "name": "...", "priceDelta": 0 }] }
```
`variants` = at most one selected (e.g. "Solo"/"Family Pack"); `addOns` = any number selected (e.g. "Extra Egg"). Confirm Xano actually distinguishes these two concepts or if it's one flat options list.

### GET /admin-master-data/stores
Powers `getFeaturedStores()`, `getStores(categoryId?)`, `getStoreById()`, `getStoreDetail()`. Expected (`StoreSummary`):
```json
{ "id": "...", "name": "...", "category": "...", "rating": 0, "isOpen": true, "distanceKm": 0, "distanceLabel": "...", "deliveryTimeMinMinutes": 0, "deliveryTimeLabel": "..." }
```
`StoreDetail` (for `getStoreDetail`) adds: `coverImageLabel, logoLabel, isVerified, followerCount, reviewCount, description, businessHours, deliveryFee, minimumOrder, reviews: [{id, authorName, rating, comment, date}]`.

Distance/time fields imply this endpoint needs the customer's current lat/lng as input -- confirm whether that's a query param or read from the user's saved address.

### GET /super_app/categories
Powers `getCategories()`. Expected (`Category`):
```json
{ "id": "...", "name": "...", "iconLabel": "..." }
```

---

## 2. Cart (already-frozen paths, schema needed)

### POST /DRXnsxb-/add_item
### GET /DRXnsxb-/get_cart
### PATCH /DRXnsxb-/update_qty
### DELETE /DRXnsxb-/remove_item

No `CartRepository` class exists yet -- cart lines (`CartLine`: `productId, productName, storeName, unitPrice, quantity`) currently only live in `OrdersRepository.getCheckoutSummary(lines)` and `placeOrder(lines)`, which take a client-held cart array as a parameter rather than reading server state. Confirm with Xano: is the cart meant to be server-persisted (these 4 endpoints are the real source of truth) or is the current "client holds the array, only sends it at checkout" approach actually correct for the MVP? This changes whether these 4 endpoints need building into a repository at all right now.

---

## 3. Orders / Checkout (already-frozen paths, schema needed for 3 of 4 methods)

### POST /rapex-orders/create + /checkout/validate + /checkout/execute
Already wired for `placeOrder()` -- if this is working end-to-end, no action needed here.

### GET /rapex-orders/order/status
Not yet wired. Powers `getOrderById()`. Expected (`OrderSummary`):
```json
{ "id": "...", "storeName": "...", "status": "pending" | "accepted" | "preparing" | "ready" | "delivering" | "completed" | "cancelled", "total": 0, "placedAt": "...", "itemCount": 0 }
```

### GET (path not yet frozen) — my orders list
Powers `getMyOrders()`. Response: array of `OrderSummary` above. No path was ever assigned for this one -- confirm which endpoint returns the list vs. `order/status`'s single-order shape.

### POST /rapex-alpha/pricing/simulate (Pricing, section 4 of the frozen doc)
Powers `getCheckoutSummary(lines)`. Expected (`CheckoutSummary`):
```json
{ "lines": [...CartLine], "subtotal": 0, "deliveryFee": 0, "platformFee": 0, "total": 0 }
```
**Hard rule reminder**: this must be a real server computation the frontend trusts as-is -- never re-derive subtotal/fees/total on the frontend.

---

## 4. Child Accounts / Baon (genuinely new -- no path frozen)

This is the parent-controls-a-child's-spending-allowance feature
(`ChildAccountRepository`). No Xano conversation has happened on this at all yet.

### GET /admin-master-data/child-accounts (mine, as the parent)
Response: array of `ChildAccountSummary` -- see `packages/api-client/src/repositories/types.ts` line ~800 for the exact field list (name, avatar, active status, current baon balance summary).

### POST /admin-master-data/child-accounts
body: `CreateChildAccountInput` (line ~811) — response: created `ChildAccountSummary`

### GET /admin-master-data/child-accounts/{child_id}
### POST /admin-master-data/child-accounts/{child_id}/deactivate
### POST /admin-master-data/child-accounts/{child_id}/reactivate
### GET /admin-master-data/child-accounts/{child_id}/purchase-history
Response: array of `ChildPurchaseHistoryEntry` = `OrderSummary` + whatever extra field ties it to the child (line ~840).

### GET /admin-master-data/child-accounts/{child_id}/baon
### POST /admin-master-data/child-accounts/{child_id}/baon
body: `{ newAllocatedBudget: number }` — response: `ChildBaonSummary` (line ~833)

### GET /admin-master-data/child-accounts/unallocated-balance
Response: `UnallocatedBalanceSummary` (line ~844) — parent's wallet balance minus every active child's remaining budget.

**This whole feature might not be MVP-critical** -- flag to whoever prioritizes Xano's queue that this is lower priority than Marketplace/Cart/Checkout schema confirmation, which blocks the entire Customer app's core loop.

---

## Next: see CustomerRiderEndpoints-Batch2.md for Rider (Profile, Wallet, Earnings, Dispatch/Delivery) — a much bigger gap, since none of it has any Xano contract yet at all, unlike Marketplace/Cart/Checkout above.
