# Infrastructure Layers — Review & Ownership

Reviewed against a proposed 8-layer backend architecture (Identity/Security,
Integration, Webhooks, API/Communication, Auditing, Testing/Sandbox,
Search/Indexing, Observability/Monitoring) plus a Jobs/Queues layer. This
records what's already real, what's frontend-buildable without Xano, and
what genuinely has to be built by Xano/a backend team — so effort isn't
wasted rebuilding something that already exists, and so nothing gets faked
on the frontend that actually needs a real server behind it.

## Already real (frontend side)

- **Session/token management**: real, per-app secure token storage
  (`secureTokenStorage` on native via `expo-secure-store`, `webTokenStorage`
  on web), wired through every `AuthRepository`.
- **Role authorization**: `AuthUser.role` gates routes today
  (`RequireAdminAuth`, `RequireMerchantAuth`), fixed per app instance.
- **Dev/staging/prod separation (frontend half)**: every Xano API group's
  base URL is an env var (`EXPO_PUBLIC_AUTH_API_BASE_URL` etc.), with
  separate values already set per EAS build profile
  (`development`/`preview`/`production` in each Expo app's `eas.json`).
- **Crash safety net**: `ErrorBoundary` (all 5 apps) with an `onError` hook
  ready for a real crash-reporting SDK — see "Observability" below, which
  is the piece that was actually missing and buildable now.

## Backend/Xano's job — not buildable from this frontend-only sandbox

These need a real server (Xano or a dedicated service) with a database,
a public HTTP endpoint, and/or secrets management. Building fake versions
of these on the frontend would misrepresent real security/data-integrity
guarantees this codebase has consistently avoided faking elsewhere:

- **Webhook receivers** (PayMongo, Track-POD, etc.) — needs a real public
  endpoint, signature verification, and idempotency storage. Zero frontend
  role beyond eventually displaying results.
- **Integration layer** (PayMongo, SMS, Email, Analytics as server-side
  proxies) — payment/SMS/email secrets must never live in a mobile app;
  this is inherently backend-only. (Google Maps and Firebase Auth are
  exceptions — their client SDKs are designed to hold a public/restricted
  key directly, which is why those are already wired frontend-side.)
- **Audit trail** — a real audit log only means something if it's recorded
  centrally and server-side; a local/frontend version wouldn't be trustworthy
  as an audit record.
- **Rate limiting, login-attempt monitoring, API keys, service-to-service
  credentials, OAuth refresh-token rotation, encryption/secrets
  management** — all backend/Xano configuration.
- **WebSocket / SSE servers** (rider live location, live order status,
  admin command center) — needs a real realtime endpoint from Xano first.
  A frontend client can be added quickly once that endpoint is confirmed;
  building one against a URL that doesn't exist yet would be speculative.
- **Search/Indexing** (Meilisearch/Algolia/etc.) — explicitly deferred per
  the source review itself: build the product data model first.
- **Jobs/Queues** (order-created fan-out to notification/rider-matching/
  audit workers) — needs a real backend worker runtime.
- **EDI** — explicitly not MVP-critical; skip until an enterprise partner
  integration actually requires it.

## Built as a direct result of this review

- **Crash/error reporting (Sentry-ready)** — the one genuinely
  frontend-buildable, Xano-independent piece from the "Observability" layer.
  See the code-level doc comments in each app's Sentry setup for exactly
  what's real vs. waiting on a DSN.

## Bottom line

Almost everything in the proposed 8-layer architecture is real, necessary,
**backend** work — it belongs in a spec handed to Xano/a backend
developer, the same way the Master Authentication Suite was. It is not
something this frontend codebase can build ahead of that backend existing
without fabricating behavior. The one exception (crash reporting) is done.
