# RAPEX Production Readiness — Final Gap Audit

**Audit only. No code, API, or database changes were made.** Conducted
2026-08-19 against the real repository state (commit `83b28c9` on
`claude/rapex-deployment-summary-f2nraq`), CI config, and all
docs written so far this project.

## Methodology / what could and couldn't be verified

This environment has **no live network access to Xano, EAS, GCP, or any
production service** — everything marked `UNKNOWN` below is genuinely
unverifiable from here, not guessed. What I *could* verify directly:
the actual source code, `packages/api-client`'s Mock-vs-Xano repository
split (tells you exactly which flows are real vs. simulated), CI
workflow files, Sentry/ErrorBoundary wiring, `.env.example` files,
`eas.json`/`app.config.js`, and every doc already written in this repo
(`docs/deployment/README.md`, `docs/api/README.md`,
`docs/architecture/03_INFRASTRUCTURE_LAYERS.md`, `docs/business/*.md`).
Where those docs already contain a verified answer, I've cited them
instead of re-deriving it.

**Scope note per your instruction**: this is the *minimum* production
architecture for RAPEX's current pilot stage (Imus/Kawit/Lancaster/
General Trias), not enterprise infrastructure sized for scale RAPEX
doesn't have yet.

---

## A. MUST BUILD NOW — required before first real pilot users

### A1. Xano `22P02` signup/seed error
- **Missing**: real account creation is broken at the database level
  (rider-table column type/index error).
- **Why needed**: blocks *everything* downstream — no real signup,
  login, or order lifecycle can be tested end-to-end until this is
  fixed.
- **Status**: MISSING (confirmed broken, documented, not touched per
  earlier instruction not to debug it blind).
- **Owns it**: Xano workspace (backend).
- **Claude**: nothing to code — this isn't a frontend bug.
- **Codex**: nothing to code.
- **Xano**: fix the column type/index causing `22P02` on the rider
  table.
- **Infra/cloud**: none.
- **Risk if postponed**: total launch blocker — nothing else in this
  list can be *verified* live until this is fixed, only built and
  typechecked in isolation.
- **Priority**: P0.
- **Code now or config later**: Xano-side data/schema fix, not app code.

### A2. Rider `X-RAPEX-App` auth header value
- **Missing**: the frozen auth contract only defines `buyer`/`merchant`/
  `admin` — no confirmed value for `rider`. See `docs/api/README.md`.
- **Why needed**: `apps/rider-app` cannot be wired to real Xano auth at
  all without this — it's 100% on `MockAuthRepository` right now.
- **Status**: MISSING — real infra (`secureTokenStorage`, provider
  wiring) is ready and unused, waiting on this one decision.
- **Owns it**: whoever owns the Xano auth contract.
- **Claude**: wire `XanoAuthRepository` for rider the moment the value
  is confirmed — this is a small, fast change once unblocked.
- **Codex**: n/a (not in Codex's scope, mobile app).
- **Xano**: confirm the header value + which API group rider login
  lives in.
- **Infra/cloud**: none.
- **Risk if postponed**: Rider App cannot go live at all — every rider
  screen would be operating on fake data.
- **Priority**: P0.
- **Code now or config later**: needs a decision first, then a small
  code change (not built preemptively, per the "don't guess" rule
  already in `docs/api/README.md`).

### A3. Field-level Xano API schemas (request/response bodies)
- **Missing**: endpoint paths/order/headers are frozen, but no
  request/response field schemas exist for any endpoint. See
  `docs/api/README.md` "Still needed."
- **Why needed**: every real (`Xano*Repository`) implementation beyond
  the skeleton `XanoAuthRepository.ts` is blocked on this — the rest of
  the app runs on `Mock*Repository` classes returning fabricated data.
- **Status**: PARTIAL — infrastructure (HTTP client, retry, token
  storage, auth middleware) is built and verified against a local test
  server; zero real endpoints are wired end-to-end.
- **Owns it**: Xano backend owner.
- **Claude**: write each real repository the moment its schema lands —
  this is fast, mechanical work once unblocked, not a redesign.
- **Codex**: n/a.
- **Xano**: export a Swagger/OpenAPI spec or equivalent field-level
  documentation per endpoint.
- **Infra/cloud**: none.
- **Risk if postponed**: the entire app continues operating on
  simulated data — this is the single biggest gap between "looks done"
  and "is done."
- **Priority**: P0.
- **Code now or config later**: needs schemas first, then real code
  (can't be pre-built without guessing field names/shapes, which the
  contract explicitly forbids).

### A4. Payment / order / webhook idempotency
- **Missing**: zero idempotency handling anywhere in the codebase
  (confirmed via full-repo search — no mentions at all).
- **Why needed**: without it, a retried checkout request, a duplicated
  webhook delivery (PayMongo etc.), or a flaky network retry can double-
  charge a wallet or create duplicate orders. This is a real-money
  correctness issue, not a nice-to-have.
- **Status**: MISSING entirely.
- **Owns it**: Xano (webhook receivers, order/payment endpoints).
- **Claude**: ensure checkout/payment calls aren't blindly retried
  client-side without an idempotency key once Xano defines one (retry
  strategy already defaults to GET-only, not mutating requests — good
  baseline, see `core/retry.ts`).
- **Codex**: n/a.
- **Xano**: idempotency keys on order-create/payment/webhook endpoints;
  webhook signature verification + replay protection (PayMongo,
  Track-POD, etc.).
- **Infra/cloud**: none beyond Xano.
- **Risk if postponed**: real financial double-processing risk — this
  is a launch blocker specifically *because* real money (wallet, COD
  settlement) is involved from day one.
- **Priority**: P0.
- **Code now or config later**: backend logic, not frontend.

### A5. Zero automated test coverage
- **Missing**: no test files, no test runner config anywhere in the
  monorepo (confirmed: `0` test files across all apps/packages).
- **Why needed**: CI currently only catches typecheck/lint/build
  failures — it cannot catch a broken checkout flow, a wrong commission
  calculation display, or a regressed auth flow. For a system handling
  real money, that's a meaningful gap.
- **Status**: MISSING.
- **Owns it**: this repo (all apps).
- **Claude**: add a minimal test suite for the highest-risk paths first
  — checkout total calculation display, wallet balance rendering, auth
  token handling — not full coverage, just the paths where a silent bug
  costs real money or trust.
- **Codex**: same, scoped to Merchant/Admin's highest-risk screens
  (Order Financials, Engine Center inputs).
- **Xano**: n/a (backend-side testing is Xano's own responsibility,
  outside this repo's visibility).
- **Infra/cloud**: CI already runs `pnpm typecheck`/lint/build — add a
  test step to the same workflow once tests exist.
- **Risk if postponed**: regressions ship silently; every fix this
  session has relied on manual self-testing (Playwright screenshots,
  manual Expo Go checks) rather than a repeatable safety net.
- **Priority**: P0 for the money-handling paths specifically, P1 for
  broader coverage (see B).
- **Code now or config later**: code now, for the narrow critical set.

### A6. Sentry DSNs not configured (wired, but inactive)
- **Missing**: real `SENTRY_DSN`/`EXPO_PUBLIC_SENTRY_DSN` values.
- **Why needed**: `Sentry.init()` is conditionally skipped without a
  real DSN — right now, a production crash reports to nothing.
  `ErrorBoundary` still shows a recovery UI, but no one gets notified.
- **Status**: PARTIAL — code is real and correct in all 5 apps
  (`services/sentry.ts` + `ErrorBoundary` wiring), just missing the
  actual DSN value.
- **Owns it**: whoever owns the Sentry account.
- **Claude**: nothing further to code — this is pure configuration.
- **Codex**: nothing further to code.
- **Xano**: n/a.
- **Infra/cloud**: create a Sentry project, generate DSNs, set as
  secrets in each app's env + EAS/GitHub Actions secrets.
- **Risk if postponed**: production crashes/errors are invisible —
  you'd find out from a user complaint, not a dashboard.
- **Priority**: P0 (cheap, high-value, purely a config task).
- **Code now or config later**: **configuration only**, no code needed.

### A7. Production hosting for the 3 web portals
- **Missing**: nothing is hosted anywhere reachable yet. GitHub Pages
  staging workflows exist but have never been run (blocked on a DNS
  CNAME + enabling Pages — see `docs/deployment/README.md`).
- **Why needed**: Merchant/Admin/Provider portals need a real, stable
  URL before real merchants/admins can use them.
- **Status**: UNVERIFIED — deploy workflows written and typecheck/lint/
  build-clean locally, never actually served by GitHub Pages.
- **Owns it**: repo admin + DNS owner (Namecheap).
- **Claude**: none — infra step, not code.
- **Codex**: none.
- **Xano**: n/a.
- **Infra/cloud**: add the `staging` CNAME at the registrar, enable
  GitHub Pages (Settings → Pages → Source → GitHub Actions), run the
  deploy workflow, confirm HTTPS provisions. Separately: decide real
  production hosting (GitHub Pages staging is explicitly a stopgap).
- **Risk if postponed**: no reachable Merchant/Admin portal at all for
  a pilot.
- **Priority**: P0.
- **Code now or config later**: config/infra only, code is ready.

### A8. Google Maps — never actually rendered
- **Missing**: a real, billing-enabled Google Cloud Maps API key.
- **Why needed**: delivery, rider location, and Admin's Command Center
  map all depend on this; right now every map is a styled placeholder.
- **Status**: PARTIAL — dependencies + components exist for both web
  (`@react-google-maps/api`) and native (`react-native-maps`), wired
  with role-colored markers and a dark/night style toggle, but zero
  real coordinates and zero real key.
- **Owns it**: whoever manages RAPEX's Google Cloud billing.
- **Claude**: none further — architecture is done, waiting on the key.
- **Codex**: none.
- **Xano**: needs to actually return real lat/lng on orders/riders
  (today only mock x/y percentages exist on Admin/Merchant map screens).
- **Infra/cloud**: create GCP project, enable Maps SDK
  (Android/iOS/JS), enable billing, generate a key, set as env var +
  EAS secret.
- **Risk if postponed**: no real map anywhere in the product — for a
  delivery platform, this is core, not cosmetic.
- **Priority**: P0.
- **Code now or config later**: config first (key), then a *small*
  code change to swap mock coordinates for real ones once Xano returns
  them.

### A9. No real payment gateway live (Alpha = COD + Wallet only)
- **Missing**: PayMongo/GCash/Maya/QRPH integration — explicitly
  Beta-scoped, not built (see `docs/business/Wallet.md`).
- **Why needed**: depends entirely on how you want to launch. If Alpha
  pilot truly ships as COD + Wallet only, this is **not** a blocker —
  flag it here only because it constrains what "safe to launch" means.
- **Status**: MISSING (by design/scope, not oversight).
- **Owns it**: Xano (payment gateway integration must be server-side —
  secrets can't live in a mobile app).
- **Claude**: none until Beta scope starts.
- **Codex**: none until Beta scope starts.
- **Xano**: PayMongo integration + webhook handling (ties to A4).
- **Infra/cloud**: PayMongo merchant account/API keys when that phase
  starts.
- **Risk if postponed**: none, **if** the pilot genuinely launches
  COD+Wallet-only as scoped. Real risk only appears if launch
  expectations quietly shift to "customers can pay by GCash" without
  this being built.
- **Priority**: P0 only if Alpha scope changes; otherwise this is
  correctly deferred to Beta (see C).
- **Code now or config later**: neither, yet — confirm scope first.

### A10. Backup / disaster recovery — unverifiable from here
- **Missing**: no documented backup/DR policy for Xano's database
  anywhere in this repo.
- **Why needed**: a single Xano incident with no backup could mean
  permanent loss of every user, order, and wallet balance.
- **Status**: UNKNOWN — cannot verify Xano's own backup guarantees from
  this environment; this is a real question to ask Xano/whoever owns
  that account, not something to assume either way.
- **Owns it**: Xano account owner.
- **Claude / Codex**: n/a.
- **Xano**: confirm what backup/point-in-time-recovery Xano's plan
  actually includes, and whether it's sufficient for real customer
  financial data.
- **Infra/cloud**: none beyond confirming the Xano plan.
- **Risk if postponed**: unknown risk is still risk — this needs an
  answer before real money moves through the system, even if the
  answer turns out to be "already covered."
- **Priority**: P0 (as a question to answer, not necessarily a build).
- **Code now or config later**: neither — verification/documentation
  task.

---

## B. SHOULD BUILD BEFORE SCALE — not required for first pilot, needed before real growth

- **Rate limiting / login-attempt monitoring / API keys / OAuth
  refresh-token rotation** — all Xano/backend config, `UNKNOWN` status
  (unverifiable from here). Owns: Xano. Risk if postponed past pilot:
  brute-force/abuse exposure once there's real traffic worth attacking.
  Priority P1.
- **Webhook receivers + integration layer (PayMongo/SMS/Email/
  Analytics as server-side proxies)** — MISSING, needs a real backend
  endpoint. Owns: Xano. Ties to A4/A9. Priority P1 (P0 once Beta
  payment scope starts).
- **Real-time services** (WebSocket/SSE for live rider location, live
  order status, Admin Command Center) — MISSING, needs a confirmed
  Xano realtime endpoint first; frontend client is fast to add once
  that exists. Owns: Xano first, then Claude/Codex. Priority P1.
- **Background jobs/queues** (order-created fan-out to
  notification/rider-matching/audit workers) — MISSING, needs a real
  backend worker runtime. Owns: Xano/backend. Priority P1.
- **Caching / CDN** for static assets and read-heavy API responses —
  not built, not urgent at pilot scale (a handful of towns, not
  national traffic). Owns: Infra. Priority P1, revisit once traffic is
  real.
- **App Store / Play Store submission** — EAS build profiles and
  bundle identifiers (`ph.rapex.customer`, `ph.rapex.rider`) exist and
  are typecheck-clean, but no EAS build has ever actually run (needs a
  real Expo account login), and no Apple Developer/Google Play Console
  account is confirmed. Owns: whoever owns those accounts. Priority P1
  — not needed for a direct-install pilot, needed before public store
  distribution.
- **Broader automated test coverage** beyond the P0 money-handling
  paths in A5 — integration tests, component tests across all 5 apps.
  Owns: Claude (mobile), Codex (web). Priority P1.
- **POS integration completion** — data model exists
  (`pos_connected`, `POS Connection`, `POS Sync Log` tables per the
  data dictionary), Admin's Integrations screen exists, but real sync
  logic is unconfirmed. Owns: Xano + whichever POS provider. Priority
  P1, not needed until real merchants with POS systems onboard.
- **Admin monitoring / alerting** beyond the existing Command Center —
  the "System Readiness" panel pattern (Xano/Firebase/Maps/PayMongo/
  Push shown as Verified/Unverified) is a good foundation Codex already
  built into the Admin Dashboard preview; a real alerting layer (e.g.
  paged when Xano goes down) is still missing. Owns: Infra. Priority
  P1.
- **Load / stress testing** — not applicable yet at zero real traffic,
  but should happen before any marketing push. Owns: whoever runs the
  load test. Priority P1, timed to just before a real traffic event
  (launch day, not before).
- **Database performance / indexing review** — UNKNOWN, Xano-internal,
  worth a real review once real query patterns exist from pilot usage
  rather than guessed in advance. Owns: Xano. Priority P1.
- **Wallet/settlement reconciliation tooling** — the Formula/Revenue
  Engine spec (`docs/business/Commissions.md`) defines what *should* be
  tracked (base price, markup, commission, platform fee, rider earning,
  merchant settlement, RAPEX revenue, adjustments) but no reconciliation
  report/tool exists yet to verify Xano's numbers actually balance.
  Owns: Xano (source of truth) + Admin UI (Claude/Codex for display).
  Priority P1 — matters most once real transaction volume exists to
  reconcile.

---

## C. CAN WAIT — useful eventually, unnecessary at this stage

- **Load balancing / multi-region infrastructure** — RAPEX is a
  4-municipality pilot; a single well-configured Xano/hosting setup is
  sufficient. Revisit only if traffic actually demands it.
- **Search/Indexing service** (Meilisearch/Algolia) — explicitly
  deferred already per `docs/architecture/03_INFRASTRUCTURE_LAYERS.md`;
  build the product data model first, this is a real gap only once
  catalog size makes basic filtering too slow.
- **EDI integrations** — explicitly not MVP-critical per the same doc;
  skip until an enterprise partner actually requires it.
- **Full PayMongo/GCash/Maya/QRPH suite** — Beta-scoped by design (see
  A9), not a current-stage gap.
- **Subscription/VIP/Wholesale/Partnership commercial engines** — data
  foundations exist in the data dictionary as intentionally-inactive
  tables; explicitly "do not activate unfinished business rules" per
  that doc. Correctly deferred.
- **Auction settlement, industrial wholesale approval flow** — flagged
  as still-open in the source planning docs themselves; not needed for
  a Food/Fresh + Non-Food pilot launch.
- **Enterprise-scale auto-scaling / Kubernetes / container
  orchestration** — massive over-engineering for current traffic;
  Xano's own hosting already scales adequately at this stage.
- **Full BI/analytics pipeline** — Admin's existing dashboards
  (placeholder-labeled, ready to wire) cover pilot-stage reporting
  needs; a dedicated analytics warehouse is scale-stage infrastructure.

---

## Final summary

### 1. RAPEX current production readiness score: **~30%**

This measures "safe to operate as a real production system handling
real money," which is a much stricter bar than "UI is built." Breaking
that number down: **frontend/UI completeness is genuinely high** (all 5
apps have real, polished screens, CI is green, crash-safety nets and
retry/token infrastructure are real and verified) — but the score is
dragged down hard by three things that are foundational, not
incidental: (1) the Xano `22P02` blocker means **zero real end-to-end
flows have ever actually run**, (2) most repositories are still on Mock
because field-level API schemas don't exist yet, and (3) there is
**zero automated test coverage** anywhere. A system can look 80% done
visually while being ~30% ready to safely handle a stranger's money —
that gap is exactly what this audit is measuring.

### 2. Top 10 blockers
1. Xano `22P02` signup/seed error (A1) — nothing else can be verified
   live until this is fixed.
2. Rider `X-RAPEX-App` header undefined (A2) — Rider App is 100% Mock.
3. No field-level Xano API schemas (A3) — almost everything is on Mock.
4. Zero payment/order/webhook idempotency (A4) — real double-charge
   risk.
5. Zero automated tests on money-handling paths (A5).
6. Sentry DSNs unset — production errors are currently invisible (A6).
7. No web portal is actually reachable at a real URL yet (A7).
8. Google Maps has never rendered a real map (A8).
9. Unconfirmed Xano backup/DR policy (A10).
10. No real-time endpoint confirmed from Xano — live order/rider
    tracking has no backend to connect to yet (B).

### 3. Top 10 things we should NOT build yet
1. Load balancing / multi-region infrastructure.
2. Search/indexing service (Meilisearch/Algolia).
3. EDI integrations.
4. Kubernetes/container orchestration or any auto-scaling infra.
5. Full PayMongo/GCash/Maya/QRPH suite (Beta-scoped, COD+Wallet is
   correct for Alpha).
6. Subscription/VIP/Wholesale/Partnership commercial engines.
7. Auction settlement + industrial wholesale approval flow.
8. Dedicated analytics/BI warehouse.
9. Enterprise-grade CDN/edge caching for a 4-town pilot's traffic.
10. Background job/queue infrastructure sized for high volume (build
    the simple version only once Xano's realtime/webhook layer exists
    at all — don't over-build the queue before there's anything to
    queue).

### 4. Exact items Claude should code now
- The moment A2 (rider header) is confirmed: wire `XanoAuthRepository`
  for `apps/rider-app`.
- The moment A3 (schemas) lands per-endpoint: write the corresponding
  real repository, replacing Mock, starting with Authentication →
  Marketplace → Cart → Checkout (the documented integration order).
- A minimal test suite now (not waiting on anything) for: checkout
  total display math, wallet balance rendering, auth token
  storage/clearing on 401 — the highest-risk-if-silently-wrong paths in
  the mobile apps.
- Once A8's key exists: swap mock map coordinates for real ones on
  rider-app's Home map.

### 5. Exact items Codex should code now
- A minimal test suite for Merchant/Admin's highest-risk screens
  (Order Financials, Engine Center inputs) — same rationale as Claude's
  item above, scoped to the web portals.
- Continue the already-scoped Merchant/Admin skeleton work
  (`docs/design/codex-checklist.md`) — unaffected by this audit, no
  changes needed there.
- Nothing blocked on this audit specifically requires new Codex work
  beyond what's already assigned; the real gaps here are backend/infra,
  not frontend UI.

### 6. Exact items Xano should implement now
- Fix `22P02` (A1).
- Confirm rider auth header + API group (A2).
- Export field-level request/response schemas per endpoint (A3).
- Add idempotency keys + webhook signature verification on
  order/payment/webhook endpoints (A4).
- Confirm backup/DR policy (A10).
- Start returning real lat/lng for orders/riders (feeds A8 once the
  Maps key exists).

### 7. Exact infrastructure/DevOps items needed now
- Create Sentry project + set real DSNs as secrets in all 5 apps (A6).
- Add the `staging` CNAME + enable GitHub Pages + run the deploy
  workflow (A7).
- Create the GCP Maps project, enable billing, generate the key (A8).
- Decide real production hosting for the 3 web portals (GitHub Pages
  staging is explicitly a stopgap, not this).
- `npx eas login` + `npx eas init` for customer-app and rider-app when
  ready for a real device build (currently config-ready, never run).

### 8. Recommended order of implementation
1. Xano fixes `22P02` (A1) — everything else depends on being able to
   test against something real.
2. Xano confirms rider header (A2) + ships field-level schemas (A3),
   even incrementally (Auth first, per the documented integration
   order) — Claude starts replacing Mock repositories as each lands.
3. In parallel (doesn't block anything above): set Sentry DSNs (A6),
   stand up GitHub Pages staging (A7), get the Maps key (A8) — all pure
   config, zero code dependency on Xano.
4. Once Auth is real: add the minimal money-path test suite (A5) against
   real (not Mock) behavior, so it's testing something meaningful.
5. Xano adds idempotency + webhook handling (A4) before any payment
   gateway work starts (A9, still correctly Beta-scoped).
6. Confirm backup/DR (A10) — can happen anytime, but must land before
   real user data accumulates.
7. Only after 1–6 are solid: start on the "B" tier (rate limiting,
   real-time services, background jobs, broader test coverage, POS,
   load testing) — none of it is useful to build against a backend
   that still returns Mock data.
