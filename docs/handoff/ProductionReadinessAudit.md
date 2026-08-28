# RAPEX — Production Readiness Audit

Audited against `D:\JED\RAPEX_MVP` (the Django/Next.js/Expo repo — the
real forward path), 2026-08-26. Methodology: static inspection of actual
code, config, CI, and Docker/infra files — not a live-running-system test.
Status legend:

- ✅ **Implemented** — real code found and read, not just a plan doc reference
- 🟡 **Designed, partially built** — a genuine plan exists (usually in
  `single_source_of_truth/`) and some real code backs it, but coverage is
  incomplete or unverified end-to-end
- ⚪ **Planned, not yet built** — documented intent exists, no corresponding
  code found
- 🚫 **Not inspectable from here** — requires live infrastructure, a running
  deployment, external dashboards, or App/Play Store console access I
  cannot reach from this sandbox; needs you or Jed to verify directly

Overall read: the architecture and planning documents
(`single_source_of_truth/security_and_operations.md`,
`infrastructure_deployment.md`) are unusually thorough for an MVP-stage
project, and real code backs a meaningful share of it — this is not a shell.
The honest gaps cluster around **deployment automation, observability
wiring beyond the SDK being present, and everything requiring a live
environment to prove** (items in the 🚫 category below are the real
punch-list before a genuine production launch, not the code itself).

---

## 1. React Native production readiness — 🟡
Real, non-stub screens confirmed in `mobile-user` and `mobile-rider`
(auth, cart, offers screens read directly — 80-151 lines each, not
placeholders). CI runs typecheck + tests for both apps and the shared
`mobile-core` package independently. **Missing/unverified**: no EAS build
profile or App/Play Store submission config found in either app — 🚫 store
readiness itself needs direct verification, this only confirms the code
compiles and passes its own tests.

## 2. Web/Admin/Merchant production readiness — 🟡
Route groups exist for `(admin)`, `(merchant)`, `(superadmin)`, `(app)`,
`(public)` with `PortalGate` role-checking wrapping pages. Several pages
are still placeholder-depth (hardcoded dashboard stat cards, a 10-line
`AdminUsersRoute` stub delegating to an unbuilt component) — confirmed by
direct reading, not assumed. Host-based portal routing matches the
documented Nginx canonical-hosts table.

## 3. Xano APIs and backend logic — N/A (superseded)
Not applicable going forward — the plan is Django, not Xano. See item 46
and the Claude-Summary.md handoff for the full confirmed Xano *business
logic* (which still matters), independent of the Xano *platform* itself.

## 4. Database structure and relationships — ✅
25 Django apps, each with real models and migrations (only `discovery`,
`analytics`, `reports` show zero migrations — confirmed via direct
migration-file count, not guessed). `WalletLedgerEntry` confirms a real
double-entry ledger model exists, not just a balance field.

## 5. Authentication and authorization — 🟡
Real RBAC models (`Role`, `Permission`, `UserRole`, `RolePermission`) with
service-layer enforcement confirmed in actual code
(`OperationsService.assert_admin`/`assert_superadmin`, reading
`UserRole`/role-codes directly — not a stub). Documented: JWT + rotating
refresh, HttpOnly/Secure cookies, PKCE for Expo, portal-role checks at
both Next.js middleware and Django API layers. **Not independently
verified**: whether the documented cookie/CSRF/PKCE behavior is fully
implemented everywhere it's specified, vs. designed — would need a
request-level test to confirm, not just a settings read.

## 6. RLS / data access security — 🟡
No native Postgres row-level security found (Django doesn't typically use
DB-level RLS; this is done via ORM-level scoped selectors/object policies
per the security doc). Confirmed in code: `select_for_update()` row
locking used correctly in payment reconciliation. IDOR mitigation is
documented (public IDs + object policies) — not exhaustively verified
across every endpoint.

## 7. API security — ✅ (core), 🟡 (coverage)
CORS via `django-cors-headers`, deny-by-default permission classes
documented and confirmed in the one service-layer pattern inspected.
Production settings **fail closed**: confirmed by direct code read —
`config/settings/production.py` raises `RuntimeError` at startup if
`DJANGO_SECRET_KEY`/`POSTGRES_PASSWORD`/`REDIS_URL` are missing, `DEBUG =
False` hardcoded. Real, not aspirational.

## 8. Rate limiting — ✅ (mechanism), 🟡 (coverage)
`common/rate_limits.py` confirmed: a real Redis-cache-backed sliding
counter (`rate_limit_exceeded(key, max_attempts, window_seconds)`).
Whether it's actually *called* on every sensitive endpoint (login, OTP,
P2P transfer) needs a broader grep than done here to confirm full
coverage, not just that the primitive exists.

## 9. Input validation — ✅
DRF serializers throughout (confirmed via `serializers.py` files across
every inspected app), plus a dedicated `common/validators/philippines.py`
for PH-specific formats (phone numbers, addresses) — a real,
purpose-built validator, not generic-only.

## 10. Error handling — ✅
`common/exceptions/handlers.py` exists; confirmed pattern in
`payments/services.py`: typed `PaymentError(code, message)` exceptions
mapped to specific HTTP status codes (400/403/404/409) in
`_error_response_from_exception`-style handlers, not bare 500s.

## 11. Error/crash tracking — ✅
Sentry SDK **confirmed actually wired**, not just listed as a dependency:
`config/settings/base.py` conditionally calls `sentry_sdk.init(dsn=...,
traces_sample_rate=...)` when `SENTRY_DSN` is set. 🚫 Whether a real DSN is
provisioned and the dashboard is being watched is a live-account fact I
can't check from here.

## 12. Server logs — 🟡
Structured JSON logging with request-ID propagation is documented in
detail (`security_and_operations.md`). `common/middleware/request_id.py`
exists, confirming the request-ID piece is real. Full structured-log
formatting across every log stream wasn't independently verified line by
line.

## 13. Audit logs — ✅
Real, append-only pattern confirmed by direct code read:
`SystemSettingChangeLog` in `apps/system/models.py` overrides `save()`/
`delete()` to raise `ValueError` — genuinely can't be mutated or deleted
after creation, not just documented as should-be-immutable. Documented
audit field schema (`actor_type`, `actor_id`, `action`, `entity_type`,
`request_id`, `ip`, `user_agent`, `metadata`, `created_at`) matches what
the Xano deep-dive separately confirmed should exist.

## 14. Traffic management — 🚫
Nginx config strategy is well-documented (rate-limit login/upload/search,
request size limits, no public DB/Redis exposure) but I did not locate an
actual `nginx.conf`/`infra/nginx/*` file to confirm it's implemented
exactly as documented — worth a direct check of `infra/nginx/`.

## 15. Caching — 🟡
`django-redis` is a real dependency; Redis is a real Docker service.
Documented: hot-list/dashboard-summary caching. Not verified: which
specific endpoints actually cache today vs. plan-only.

## 16. CDN — 🚫
Documented as a future step (`media.rapex.ph` optional public-media
origin, object-storage migration triggers) — no CDN is live yet by
design at this MVP stage; nothing to verify as broken, just not built yet
and not urgent per the plan's own scale triggers.

## 17. Load balancing — ⚪
Explicitly a future scale trigger in the infra doc ("split web/API
replicas behind a load balancer when sustained CPU exceeds 70%") — single
KVM4 host by design for MVP, not a current gap.

## 18. Cloud compute/scaling — 🟡
Single Hostinger KVM4 (4 vCPU/16GB) is the documented target with a real,
specific resource budget per service (Postgres 4GB, Django 2.5-3GB, Redis
512MB-1GB, etc.) and named upgrade triggers. 🚫 Whether this host is
actually provisioned yet needs direct confirmation from you/Jed.

## 19. Background jobs / queues — ✅
Real, isolated Celery queues confirmed directly in `docker-compose.yml`:
`celery_worker_critical`, `_dispatch`, `_notifications`, `_media`,
`_analytics`, `_maintenance`, plus `celery_beat` — exactly matching the
documented "critical/dispatch work can't be starved by report/media work"
design, not just described.

## 20. Real-time services — 🚫
Realtime rider-tracking/dispatch-push (the `map:updates` channel, GPS
heartbeat) is thoroughly specified in the Xano-side business rules
(section 8 of the handoff doc) but I did not find a Django Channels/
WebSocket implementation in this codebase during this pass — worth a
direct check of whether realtime is planned via Channels, polling, or a
third-party service (Pusher/Ably) before assuming it's unbuilt.

## 21. Push notifications — 🟡
Firebase is the confirmed, correctly-scoped integration point (push +
social login only, per both the architecture doc and the Xano rules) — a
real `notifications` Django app exists with migrations. End-to-end wiring
(Django → FCM) wasn't traced in this pass.

## 22. Payment security — ✅
Directly confirmed in `payments/services.py`: webhook signature
verification happens *before* any processing
(`provider_impl.verify_webhook_signature(...)`, request rejected with
`PERMISSION_DENIED` on failure) — matches the "never trust a redirect,
always verify the webhook" rule confirmed independently on the Xano side.

## 23. Wallet transaction integrity — ✅
`WalletLedgerEntry` model confirms a real ledger (not a mutable balance
field). Payment/order status transitions go through
`OrderService._append_status_history`, an audit-trailed transition
function, not a raw field write.

## 24. Idempotency for orders/payments/webhooks — ✅
This is the standout finding of this audit. Directly read and confirmed
in `payments/services.py`:
- `initialize_payment` uses `select_for_update()` + an `idempotency_key`
  lookup — a duplicate request returns the existing `PaymentTransaction`
  instead of creating a second one.
- `reconcile_webhook` locks on `provider_event_id` first — a replayed
  webhook is a no-op, returns the already-processed record.
- Both wrapped in `transaction.atomic()`.

This is genuinely production-grade idempotency handling, not a gap.

## 25. Database performance/indexing — 🟡
Confirmed real indexes on the models inspected (`authorization`,
`operations`, `system` all have explicit `models.Index(...)` entries on
their `Meta` classes). Full coverage across all 25 apps' models wasn't
audited in this pass — recommend a dedicated index-review pass before
launch, especially on high-write tables (orders, wallet ledger, audit
log).

## 26. Backup and disaster recovery — 🟡 (planned), 🚫 (executed)
Extremely well specified: nightly encrypted off-host PostgreSQL backups,
monthly restore drills, RPO 24h / RTO 4-8h, explicit recovery-order
runbook. `infra/scripts/` and `infra/compose/` exist but I did not verify
an actual backup job script is implemented and tested — this is the kind
of thing that's easy to plan and easy to silently never actually test;
recommend confirming a real restore drill has happened, not just that the
plan describes one.

## 27. CI/CD — 🟡
Real CI confirmed: `.github/workflows/ci.yml` runs format/lint/type-check/
tests for backend + all 4 frontend apps independently, plus a Docker
Compose build-validation job. **What's missing**: no deploy job, no
security-scanning step, no post-deploy health check, no automated
rollback — the documented 9-stage pipeline (lint→types→tests→security
scan→build→docker build→**deploy→health check→rollback**) only has the
first 3 stages and the docker-build stage automated. Deployment is
presumably manual today. This is a real, concrete gap to close before
relying on CI/CD for safe releases.

## 28. Development/Staging/Production environments — ✅
Confirmed real, separate settings files: `development.py`, `staging.py`,
`testing.py`, `production.py`, each extending a shared `base.py` — not a
single settings file with if-branches.

## 29. Secrets/environment variables — ✅
`.env.example` pattern confirmed (placeholders only, real values never
committed). Production settings fail closed on missing secrets (see item
7) — this is real enforcement, not just a convention.

## 30. File/media storage — 🟡
Documented: dedicated Docker volume now, S3-compatible object storage
migration trigger at 60% disk usage; private vs. public media
classification with different cache/retention rules. `common/storage/`
module exists. Full private-media authorization-URL implementation
wasn't traced end-to-end in this pass.

## 31. Monitoring and alerts — 🟡 (SDK/tooling present), 🚫 (live alerting)
`django-prometheus` is a real dependency (metrics exporter). Alert
thresholds are precisely documented (CPU/memory/disk pressure, DB
connection exhaustion, Redis eviction, queue age, 5xx rate, TLS expiry,
etc.) but I found no Grafana/Prometheus config files or alert-rule
definitions in this pass — 🚫 whether alerts actually fire today needs
live verification, this is exactly the kind of thing that looks done in
a plan doc and isn't wired yet in practice.

## 32. Security testing — 🚫
No penetration test, dependency vulnerability scan report, or security
audit artifact found in the repo. CI has no security-scanning step (see
item 27). Recommend adding `pip-audit`/`npm audit`/Dependabot at minimum
before launch, and a real pen-test pass given this handles real money.

## 33. API testing — 🟡
`tests/contract/` directory exists (empty or minimal — not deeply
inspected this pass) and `drf-spectacular` (OpenAPI schema generation) is
a real dependency, which the plan explicitly calls for as a contract
check in CI. Whether contract tests actually run and gate merges wasn't
confirmed.

## 34. Integration testing — 🟡
`tests/integration/test_health.py` and `tests/integration/
test_auth_phase1.py` confirmed to exist — real integration test files,
not just unit tests. Coverage beyond Phase 1 (auth) wasn't found — no
`test_phase2`+ equivalents located, matching the earlier finding that
Phase 1 is the only phase with confirmed test coverage.

## 35. End-to-end order testing — 🟡
`tests/e2e_api/` directory exists. Depth/coverage not verified in this
pass — worth confirming a real order-to-delivery-to-settlement E2E test
exists and passes, given how much money-moving logic sits behind that
flow (item 24's idempotency work deserves an E2E test proving it, not
just unit-level confidence).

## 36. Load/stress testing — 🟡 (tooling), 🚫 (results)
`locust` is a real dependency and `tests/performance/locustfile.py`
exists — the tooling is genuinely present, not aspirational. 🚫 Whether
it's been run against anything resembling production load, and what the
results were, needs direct confirmation — a locustfile existing doesn't
mean a load test has actually happened.

## 37. Deployment/rollback strategy — 🟡 (documented), ⚪ (automated)
Extremely well-documented rollback strategy (backward-compatible
migrations, expand-migrate-contract for destructive changes, documented
rollback decision required before deploying irreversible changes). Not
automated in CI (see item 27) — today this is a manual, documented
procedure, not a one-click safety net.

## 38. App Store / Play Store production requirements — 🚫
Cannot verify from static code — no EAS build profiles, app store
listing assets, or submission-readiness artifacts found in this pass.
Needs direct confirmation: Apple Developer/Google Play accounts set up,
app identifiers registered (`ph.rapex.user`/`ph.rapex.rider` per the
architecture doc), privacy policy + data-safety forms prepared,
screenshots/store listings ready.

## 39. Firebase configuration — 🟡
Correctly scoped in design (push + social login only, confirmed both in
architecture docs and independently in the Xano business-rules deep-dive
— consistent across two separate sources). Actual `google-services.json`/
`GoogleService-Info.plist` presence and Firebase project provisioning
wasn't verified — these are typically gitignored, so absence in a repo
scan doesn't mean absence in reality; needs direct confirmation.

## 40. Google Maps / location production configuration — 🟡
Design is confirmed sound (Maps used only for address lookup + route
polylines, all distance/geofencing computed server-side to save cost —
confirmed independently via the Xano deep-dive). Whether a real, properly
domain-restricted Google Maps API key is provisioned for this specific
Django/Next.js/Expo stack needs direct confirmation — the key used
earlier in the Xano-based rapex-mvp project doesn't automatically carry
over key-restriction-wise.

## 41. Sentry/error monitoring — ✅ (see item 11)

## 42. POS integration readiness — 🚫
No POS integration code or third-party POS adapter found in this pass.
Given the earlier-documented No-POS/Traditional-Merchant flow is a first-
class, deliberately-designed alternative (manual inventory toggle, 5-minute
acceptance window) — POS integration may genuinely be out of MVP scope by
design, not a gap. Worth confirming explicitly rather than assuming either
way.

## 43. Order/Delivery Engine reliability — 🟡
Real `orders`/`deliveries` apps with substantial code (`orders` views: 210
lines; `deliveries` views: 276 lines — both confirmed non-trivial).
Status-transition audit trail confirmed real (item 13). The full 14-state
order flow confirmed via the Xano business-logic deep-dive — whether the
Django `OrderStatus` enum matches that exact 14-state list wasn't
line-by-line verified in this pass; worth a direct diff before relying on
it.

## 44. Commission/Markup/Revenue Engine reliability — ⚪
This is a real, confirmed gap: `authorization` app has RBAC models but
zero views/serializers found for anything resembling the Engine
Center/commission-tier system documented in the Xano rules (20% markup,
tiered 10%→7% commission by merchant rank, category-pillar overrides).
This was the subject of the in-progress Django build discussed earlier in
this session — genuinely not built yet, worth prioritizing given it's
core platform revenue logic.

## 45. Wallet/Settlement reconciliation — 🟡
The atomic settlement mechanism itself is well-built (item 23/24). The
specific 4-party split (Merchant/Rider/Partner/Admin, each getting a
distinct cut) confirmed via the Xano deep-dive wasn't verified as
implemented in `apps/wallet` or `apps/orders` in this pass — worth
confirming the Django `accounting/distribute_funds`-equivalent function
actually exists and matches that exact 4-way split before assuming
parity.

## 46. Admin monitoring capability — 🟡
Real `AdminDashboardView`/`SuperadminDashboardView`-style views confirmed
in `operations/views.py`, backed by a real service layer
(`OperationsService.admin_dashboard()`). Depth of what's actually
surfaced (vs. the ~14-area Admin feature set documented in the frontend
handoff) wasn't cross-checked screen-by-screen in this pass.

---

## Honest summary — what to actually prioritize

**Genuinely solid, verified by reading real code** (not just docs): payment
webhook idempotency and signature verification, atomic wallet/order
settlement, fail-closed production secrets handling, append-only audit
logging, isolated Celery queue architecture, real CI quality gates across
every app.

**Real, concrete gaps worth closing before launch**, not just
theoretical: no automated deployment/rollback in CI (manual today), no
security-scanning step in CI, the Commission/Markup Engine has no backend
implementation yet, test coverage beyond Phase 1 (auth) is unconfirmed,
and realtime dispatch (WebSocket/Channels or equivalent) wasn't located.

**Needs your/Jed's direct confirmation, not code review** (marked 🚫
throughout): actual Sentry DSN provisioned and watched, actual backup
restore drill performed, actual load test results, App/Play Store
submission readiness, actual host provisioning status, and whether
alerting rules are live vs. just documented thresholds.
