# API — RAPEX Alpha Contract

Source of truth for endpoints the frontend integrates against. Auth headers and integration order below are frozen; field-level request/response schemas are not yet available (see "Still needed" at the bottom).

## Headers (every request)

| Header | Value |
|---|---|
| `Authorization` | `Bearer <token>` |
| `Content-Type` | `application/json` |
| `X-RAPEX-App` | `buyer` \| `merchant` \| `admin` (per app) |
| `Accept-Language` | `en-PH` |

Implemented in [`packages/api-client/src/core/createRapexHttpClient.ts`](../../packages/api-client/src/core/createRapexHttpClient.ts).

## Endpoints, in integration order

### 1. Authentication
| Method | Path |
|---|---|
| POST | `/rapex-auth/auth/signup` |
| POST | `/rapex-auth/verify-otp` |
| POST | `/rapex-auth/complete-profile` |
| POST | `/rapex-auth/auth/login` |
| GET | `/rapex-auth/auth/me` |

### 2. Marketplace
| Method | Path |
|---|---|
| GET | `/rapex-market/products` |
| GET | `/admin-master-data/stores` |
| GET | `/super_app/categories` |
| GET | `/rapex-market/products/{id}` |

### 3. Cart
| Method | Path |
|---|---|
| POST | `/DRXnsxb-/add_item` |
| GET | `/DRXnsxb-/get_cart` |
| PATCH | `/DRXnsxb-/update_qty` |
| DELETE | `/DRXnsxb-/remove_item` |

### 4. Pricing
| Method | Path |
|---|---|
| POST | `/rapex-alpha/pricing/simulate` |

### 5. Checkout
| Method | Path |
|---|---|
| POST | `/rapex-orders/create` |
| POST | `/rapex-orders/checkout/validate` |
| POST | `/rapex-orders/checkout/execute` |
| GET | `/rapex-orders/order/status` |

### 6–8. Merchant / Admin / Super Admin
Prepare UI using this documented structure; keep Mock repositories where the specific endpoint isn't listed above yet.

## Hard rules (from the contract)

- Do not rename request or response fields.
- Do not calculate totals, commissions, or markups on the frontend — always trust Xano responses.
- If an endpoint is incomplete or missing fields, stop and report it — do not guess.

## Still needed before real implementations can be written

For every endpoint above:
1. **Base URL** — the actual Xano host these paths resolve against.
2. **Request body fields** (name, type, required/optional) for every POST/PATCH.
3. **Response body fields** (success shape) for every endpoint.
4. **Error response shape** (how Xano reports validation errors, auth failures, etc.).

Until these land, `packages/api-client` repositories stay on their Mock implementations. One example skeleton exists — [`XanoAuthRepository.ts`](../../packages/api-client/src/repositories/auth/XanoAuthRepository.ts) — with paths/methods/headers wired and request/response bodies explicitly marked `unknown` pending schema, proving the pattern without guessing.

## Status
Endpoint list, order, and headers frozen. Field-level schemas pending — requested as a Swagger/OpenAPI export from Xano.
