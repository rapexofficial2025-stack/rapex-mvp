# Deployment

How RAPEX apps get built and shipped — Expo builds/EAS for mobile, hosting for the web portals, environment configuration, CI/CD.

## Status (as of 2026-08-09, 23 days before the Sept 1 launch target)

CI and a staging deploy path now exist. Nothing has been deployed to a real, reachable URL yet — every item below marked **UNVERIFIED** needs a manual step from someone with the right account access before it's actually proven, not just configured.

## CI — `.github/workflows/ci.yml`

Runs on every push to `main` and every PR: `pnpm install`, `pnpm typecheck` (every workspace package now has a `typecheck` script — this used to be a no-op), lint (`oxlint`) and production `build` for the three web portals (admin/merchant/provider). Verified locally end-to-end before being committed (all 12 typed workspaces pass, all 3 web builds succeed, lint is clean/warning-only). **Not yet verified running as an actual GitHub Actions run** — needs a push/PR to trigger it for real.

## Web portals (admin-portal, merchant-portal, provider-portal)

**Status: UNVERIFIED — REQUIRES LIVE TESTING.** Nothing is hosted anywhere yet.

A staging deploy workflow exists: `.github/workflows/deploy-pages-staging.yml`, manual-trigger only (`workflow_dispatch`). It builds all three portals (each with its own `/admin/`, `/merchant/`, `/provider/` subpath via the new `VITE_BASE_PATH` env var read in each `vite.config.ts`) and deploys them as one combined GitHub Pages site. Verified locally: default build (no `VITE_BASE_PATH`) is byte-identical to before this change; subpath builds correctly rewrite JS/CSS/favicon references under `/admin/` etc. **Not yet verified as an actual live deployment** — it will fail until a repo admin does this one-time manual step:

1. Repo **Settings → Pages → Source → GitHub Actions**.
2. Run the "Deploy staging (GitHub Pages)" workflow manually (Actions tab → Run workflow).
3. Confirm the three portals actually load at `https://<org>.github.io/<repo>/admin/`, `/merchant/`, `/provider/`.

This is explicitly a **temporary Alpha staging URL**, matching the existing code comment in `admin-portal/src/services/apiConfig.ts` ("Alpha: temporary GitHub deployment URL, until the production admin domain is ready") — not a production deployment. Production hosting (custom domain, real CDN/hosting provider) is a separate decision not made yet.

### Env vars / secrets

Each portal's `.env.example` documents what it needs (Xano API base URLs, Google Maps key, Firebase config for admin, Django backend URL for admin's Integrations screen). None are hardcoded in source — confirmed by grep, this was already true before this pass. For the GitHub Pages staging build, none of these are currently injected as GitHub Actions secrets (the staging build runs with defaults/empty, same as a fresh local `.env.local`-less checkout) — add them as repo secrets and pass them via `env:` in the workflow once real values are ready to test live.

## Mobile apps (customer-app, rider-app)

**Status: UNVERIFIED — REQUIRES LIVE TESTING.** No EAS project exists for either app yet.

`eas.json` now exists for both (`development`/`preview`/`production` build profiles, standard Expo/EAS structure) so builds are one command away once a project is linked. Validated as well-formed JSON only — **not validated against the real `eas` CLI**, since that requires an Expo account login this environment doesn't have.

Manual steps needed (from a machine with an Expo account):
1. `npx eas login`
2. `npx eas init` (from each app's directory) — links a real EAS project, writes `extra.eas.projectId` into `app.json`. Do not invent a project ID by hand.
3. `npx eas build --profile development` (or `preview`) to produce the first real build.
4. For app store submission later: `npx eas submit`.

`customer-app/eas.json`'s `development`/`preview` profiles pre-fill the confirmed live Xano base URLs (the same defaults already hardcoded as fallbacks in `services/apiConfig.ts` — not secrets, just base URLs) so a dev/preview build talks to the real Alpha backend out of the box. `production` intentionally leaves these unset rather than assume the Alpha URLs are still correct at actual launch. `rider-app/eas.json` has no such env block — rider-app has no API wiring yet (see the auth blocker below).

## Known blockers affecting deployment readiness

- **Xano `22P02` signup/seed error** — blocks real account creation entirely. Every "unverified live" item above is unverified specifically because this (and general lack of network access to Xano from automated environments) has prevented a real end-to-end test. Documented, not touched, per current instructions not to debug it right now.
- **Rider App auth contract gap** — the frozen `X-RAPEX-App` header only defines `buyer`/`merchant`/`admin`; there's no confirmed value for `rider`. This blocks rider-app from being usefully deployed at all until resolved (a deployed build would still only work against Mock data).
- **No production hosting decision made** — GitHub Pages staging is a stopgap, not a launch-ready host. Needs a real decision (provider, custom domain, CDN) before Sept 1.

## Before the Aug 27 QA freeze, still needed

1. Actually run the CI workflow and the staging deploy workflow for real (both are written and locally verified, but never executed as GitHub Actions).
2. Resolve the Xano 22P02 blocker and get live credentials flowing so every "UNVERIFIED" item above can be tested for real.
3. Decide production hosting for the 3 web portals and an EAS/App Store Connect + Play Console plan for the 2 mobile apps.
4. Confirm the rider `X-RAPEX-App` header value so rider-app auth can be wired and deployed meaningfully.
