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

> **BLOCKER -- Rider App has no confirmed `X-RAPEX-App` value.** The frozen
> contract above only defines `buyer` / `merchant` / `admin`. Rider App
> (`apps/rider-app`) is not listed in the Base URLs table below either.
> Rider auth cannot be wired to real Xano until whoever owns the Xano
> backend confirms:
> 1. What `X-RAPEX-App` value riders should send (`rider`? reuse `buyer`?
>    something else?), and
> 2. Which Xano API group rider login actually lives in (`rapex-auth`
>    like customer/merchant, or something rider-specific).
> Until then, do not guess -- `apps/rider-app` stays on Mock. See
> `apps/rider-app/providers/AppProviders.tsx` and
> `apps/rider-app/services/{secureTokenStorage,userCache}.ts` (infra
> ready, unused) for exactly where this plugs in once confirmed.

## Base URLs (configured per environment, never hardcoded)

| App | Env var | Production value |
|---|---|---|
| Customer App | `EXPO_PUBLIC_API_BASE_URL` | `https://rapexmarketplace.ph` |
| Merchant Portal | `VITE_API_BASE_URL` | `https://rapexmarketplace.ph` |
| Admin Portal | `VITE_ADMIN_API_BASE_URL` | Alpha: temporary GitHub deployment URL, until the production admin domain is ready |

Each app has an `.env.example` documenting this; copy to `.env.local` and fill in for local dev. See each app's `services/apiConfig.ts`.

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

## Infrastructure ready (independent of field schemas)

- **HTTP client** — [`core/httpClient.ts`](../../packages/api-client/src/core/httpClient.ts): generic fetch wrapper, request/response interceptors.
- **Retry strategy** — [`core/retry.ts`](../../packages/api-client/src/core/retry.ts): exponential backoff, GET-only by default (mutating requests aren't retried automatically, to avoid duplicate side effects), configurable per app or per request.
- **Auth middleware** — a 401 response automatically clears the stored token via `onUnauthorized`, so the next auth check naturally routes back to login.
- **Token storage** — [`core/tokenStorage.ts`](../../packages/api-client/src/core/tokenStorage.ts) defines the `TokenStorage` interface; each app has its own platform-specific implementation (`expo-secure-store` for Customer App with a web/localStorage fallback for dev, `localStorage` for the web portals).
- **API config** — each app's `services/apiConfig.ts` reads its env var and constructs a ready `HttpClient` via `createRapexHttpClient`. Not yet used by any repository or screen.

All of the above verified with a local test server (retry-until-success, no-retry-on-POST, 401-clears-token, retry-exhaustion, auth-header-injection) — not just type-checked. No requests have been made to the real `rapexmarketplace.ph` domain.

## Still needed before real implementations can be written

For every endpoint above:
1. **Request body fields** (name, type, required/optional) for every POST/PATCH.
2. **Response body fields** (success shape) for every endpoint.
3. **Error response shape** (how Xano reports validation errors, auth failures, etc.).

Until these land, `packages/api-client` repositories stay on their Mock implementations. One example skeleton exists — [`XanoAuthRepository.ts`](../../packages/api-client/src/repositories/auth/XanoAuthRepository.ts) — with paths/methods/headers wired and request/response bodies explicitly marked `unknown` pending schema, proving the pattern without guessing.

## Status
Endpoint list, order, headers, and base URLs frozen. Infrastructure layer (client, retry, auth middleware, token storage, env config) built and verified. Field-level schemas pending — requested as a Swagger/OpenAPI export from Xano.
