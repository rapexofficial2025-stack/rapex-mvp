# Admin Portal — Xano Endpoints Needed (Batch 2: Product Monitoring, Product Categories/Variants/Options/Images, Inventory)

## Status
None of these exist in Xano yet. All four screens below currently render from
either a hardcoded placeholder array (`ProductMonitoringPage.tsx`) or a fully
empty shell with no repository at all (`AdminDataModulePage.tsx`, covering
`product-categories`, `product-options`, `product-images`, `product-variants`,
`inventory`). Column names below were taken directly from what those screens
already display, so wiring them is a drop-in once these exist.

All endpoints require `Authorization: Bearer <token>` and should only
succeed for an authenticated Admin/Super Admin session. All list endpoints
should support `search` (free text) and pagination (`page`, `perPage`) —
none of these tables are safe to return unpaginated once real merchants are
on the platform.

---

## 1. Product Monitoring (catalog-wide, all stores)

### GET /admin-master-data/products
Query params (optional): `search`, `status` (Active | Review | Unavailable),
`storeId`, `categoryId`, `page`, `perPage`

Response:
```json
{
  "items": [
    {
      "id": "PRD-...",
      "name": "Premium rice 5 kg",
      "storeId": "STR-...",
      "storeName": "Example Grocery",
      "category": "Groceries",
      "price": 312.00,
      "stock": 48,
      "status": "Active",
      "updatedAt": "2026-08-20T10:00:00Z"
    }
  ],
  "total": 1,
  "summary": {
    "catalogProducts": 1240,
    "storesRepresented": 86,
    "needsReview": 4,
    "outOfStock": 19
  }
}
```
`summary` backs the four stat cards at the top of the screen — either compute
it server-side in this same call, or split it into its own
`GET /admin-master-data/products/summary` if that's cheaper to cache.

### POST /admin-master-data/products/{product_id}/status
body: `{ status: "Active" | "Review" | "Unavailable", reason?: string }`
response: `{ success: true }`
Same audited-action expectation as Batch 1's user-status endpoint — write who
changed it and when, don't just flip the field.

---

## 2. Product Categories

### GET /admin-master-data/product-categories
Query params (optional): `type` (Merchant products | Auction | Pre-Loved | Services | Partnership)

Response: array of
```json
{
  "id": "CAT-...",
  "name": "Groceries",
  "type": "Merchant products",
  "description": "...",
  "active": true,
  "productsCount": 312,
  "createdAt": "...",
  "updatedAt": "..."
}
```

### POST /admin-master-data/product-categories
body: `{ name, type, description, active }`
response: created category (same shape)

### PATCH /admin-master-data/product-categories/{category_id}
body: any subset of the fields above
response: updated category

### DELETE /admin-master-data/product-categories/{category_id}
response: `{ success: true }` — should fail with a clear error if
`productsCount > 0` rather than silently orphaning products.

---

## 3. Product Variants

### GET /admin-master-data/product-variants
Query params (optional): `productId`, `active`

Response: array of
```json
{
  "id": "VAR-...",
  "productId": "PRD-...",
  "productName": "Chicken meal set",
  "label": "Family Pack",
  "code": "SKU-...",
  "price": 450.00,
  "stock": 12,
  "reserved": 2,
  "isDefault": false,
  "active": true
}
```
Read-only monitoring for now (the screen has no create/edit UI yet) — GET is
enough for Batch 2. Flag if merchant-side variant edits should also write an
audit row here later.

---

## 4. Product Add-ons & Options

### GET /admin-master-data/product-options
Response: array of
```json
{
  "id": "OPT-...",
  "productId": "PRD-...",
  "productName": "Chicken meal set",
  "name": "Extra cheese",
  "description": "...",
  "price": 25.00,
  "required": false,
  "active": true,
  "sortOrder": 1
}
```
Read-only for Batch 2, same as variants.

---

## 5. Product Images

### GET /admin-master-data/product-images
Response: array of
```json
{
  "id": "IMG-...",
  "productId": "PRD-...",
  "productName": "Premium rice 5 kg",
  "storeName": "Example Grocery",
  "url": "https://.../image.jpg",
  "isPrimary": true,
  "sortOrder": 0,
  "active": true,
  "createdAt": "..."
}
```
Read-only for Batch 2.

---

## 6. Inventory Monitoring

### GET /admin-master-data/inventory
Query params (optional): `search`, `lowStockOnly` (bool), `outOfStockOnly` (bool)

Response: array of
```json
{
  "productId": "PRD-...",
  "productName": "USB-C charging cable",
  "storeName": "Example Electronics",
  "sku": "SKU-...",
  "stock": 0,
  "reserved": 0,
  "available": 0,
  "lowStock": false,
  "updatedAt": "..."
}
```
`lowStock` is presumably a threshold Xano computes (e.g. `available <
lowStockThreshold`) — tell us the threshold source (global setting vs.
per-product) when this is built.

### GET /admin-master-data/inventory/transactions
Query params (optional): `productId`, `page`, `perPage`

Response: array of
```json
{
  "id": "...",
  "productId": "PRD-...",
  "productName": "...",
  "type": "restock" | "sale" | "adjustment" | "reservation" | "release",
  "quantityChange": -1,
  "resultingStock": 47,
  "reference": "ORD-...",
  "occurredAt": "..."
}
```
Backs the screen's "Transaction history" tab.

---

## Next batches (not written yet)
- Master Data: Registration Monitor, Age & Registration Engine, Locations
  (regions/provinces/municipalities/barangays), Communities
- Merchant Management (full list — broader than Batch 1's pending-approvals
  widget: orders/sales per merchant, store status, verification)
- Order Management + Delivery Monitoring
- Rider Management + Active Deliveries
- Error Center, Operational Settings
- Super Admin (Admin Accounts, Users & Roles, Stores & Merchants, Products &
  Listings, Audit & Recovery, Receipt Design, Secure Exports)
- Merchant portal's remaining ~25 mock methods
