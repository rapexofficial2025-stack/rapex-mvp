# Deployment

How RAPEX apps get built and shipped — Expo builds/EAS for mobile, hosting for the web portals, environment configuration, CI/CD.

## Status (as of 2026-08-09, 23 days before the Sept 1 launch target)

CI is **VERIFIED GREEN** (confirmed as an actual GitHub Actions run, not just reproduced locally -- see below). A staging deploy path exists but is unverified. Nothing has been deployed to a real, reachable URL yet — every item below marked **UNVERIFIED** needs a manual step from someone with the right account access before it's actually proven, not just configured.

## CI — `.github/workflows/ci.yml` — VERIFIED GREEN

Runs on every push to `main` and every PR: `pnpm install`, `pnpm typecheck` (every workspace package now has a `typecheck` script — this used to be a no-op), lint (`oxlint`) and production `build` for the three web portals (admin/merchant/provider). Its first real run failed (`.nvmrc` pinned Node 20, but the pinned `pnpm@11.18.0` requires Node >=22.13 -- fixed by bumping `.nvmrc` to 22); the rerun on PR #3 passed as an actual GitHub Actions run (run 31309123021, conclusion `success`).

## Manual account-level actions required

Nothing below can be done from an automated sandbox -- each needs a human with the relevant account:

| # | Action | Blocks | Who |
|---|---|---|---|
| 1 | Fix the Xano `22P02` signup/seed error (rider-table column type/index) | All real signup/login testing, the entire live order lifecycle | Whoever has Xano workspace access |
| 2 | Confirm the rider `X-RAPEX-App` header value (see `docs/api/README.md`) | Rider App auth -- currently 100% Mock | Whoever owns the Xano backend contract |
| 3 | Repo **Settings → Pages → Source → GitHub Actions**, then manually run "Deploy staging" | The one staging URL for the 3 web portals | Repo admin |
| 4 | `npx eas login` + `npx eas init` (per app) -- links a real EAS project, writes `extra.eas.projectId` | Any real mobile build | Someone with an Expo account |
| 5 | Create a Google Cloud project, enable Maps SDK for Android/iOS + Maps JavaScript API + Directions/Distance Matrix as needed, generate an API key, enable billing | Any map actually rendering (web or native) | Whoever manages RAPEX's Google Cloud billing |
| 6 | Decide production hosting for the 3 web portals (GitHub Pages staging is a stopgap, not launch-ready) | Real production URLs | Product/eng decision |
| 7 | Apple Developer + Google Play Console accounts, when ready for store submission (`eas submit`) | App store distribution (post-MVP, not a Sept 1 blocker) | Whoever owns those accounts |

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

**Status: UNVERIFIED — REQUIRES LIVE TESTING.** No EAS project exists for either app yet, and no EAS build has ever been attempted against the real CLI/account.

`eas.json` exists for both (`development`/`preview`/`production` build profiles, standard Expo/EAS structure). `app.json` was converted to `app.config.js` for both (dynamic config, needed so the Google Maps API key env var actually resolves into the native manifests -- see the Maps section below) and now sets a proposed `ios.bundleIdentifier`/`android.package` (`ph.rapex.customer`, `ph.rapex.rider`) -- **neither app had one before, which would have failed a real EAS build immediately.** These are a reasonable default, not yet confirmed as final -- change them before a real release if the org wants something else.

Verified (not just written): `npx expo config --type public` successfully parses both apps' config, resolves the react-native-maps plugin, and correctly substitutes `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` when set (tested with a dummy value). All referenced icon/adaptive-icon/favicon assets confirmed present on disk. `pnpm typecheck` clean. **Still not verified**: an actual `eas build` has never been run, since that needs a real Expo account login this environment doesn't have.

Manual steps needed (from a machine with an Expo account):
1. `npx eas login`
2. `npx eas init` (from each app's directory) — links a real EAS project, writes `extra.eas.projectId` into `app.config.js`'s output. Do not invent a project ID by hand.
3. Confirm or change the proposed `ph.rapex.customer` / `ph.rapex.rider` bundle identifiers before the first real build.
4. Set `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` as an EAS secret (`eas secret:create`) once a real key exists (see Maps section).
5. `npx eas build --profile development` (or `preview`) to produce the first real build.
6. For app store submission later: `npx eas submit`.

`customer-app/eas.json`'s `development`/`preview` profiles pre-fill the confirmed live Xano base URLs (the same defaults already hardcoded as fallbacks in `services/apiConfig.ts` — not secrets, just base URLs) so a dev/preview build talks to the real Alpha backend out of the box. `production` intentionally leaves these unset rather than assume the Alpha URLs are still correct at actual launch. `rider-app/eas.json` has no such env block — rider-app has no API wiring yet (see the auth blocker below).

## Google Maps

**Status: UNVERIFIED — REQUIRES LIVE TESTING.** No map has ever actually rendered; this is dependency + architecture prep only, per instruction not to claim it works until one does.

Added, all deliberately **not wired into any existing screen** (the existing map screens -- admin Operations Command Center, merchant Coverage Map -- render mock x/y percentage positions, not real lat/lng; wiring them would mean redesigning their data model, out of scope here):
- Web: `@react-google-maps/api` added to `@rapex/ui-web`; new `GoogleMapView` component, markers colored by role via `@rapex/constants`'s `MAP_MARKER_COLORS` (customer green / merchant purple / rider orange). Verified zero bundle-size impact on all 3 portal builds (unused, tree-shaken).
- Native: `react-native-maps` added to `customer-app`/`rider-app` directly (native modules need to live in the consuming app for Expo autolinking, not a shared package) and as a peer dep of `@rapex/ui-native`; new `RapexMapView` component, same role-color scheme. `app.config.js` for both apps registers the `react-native-maps` config plugin with `androidGoogleMapsApiKey`/`iosGoogleMapsApiKey` read from `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` -- verified this resolves correctly via `npx expo config`.

What's still needed before a map can actually render, none of which can happen from this sandbox:
1. A real Google Cloud project with Maps JavaScript API (web), Maps SDK for Android, and Maps SDK for iOS enabled, billing turned on, and an API key generated.
2. That key set as each app's `.env.local` (`VITE_GOOGLE_MAPS_API_KEY` / `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`) for local dev, and as an EAS secret / GitHub Actions secret for real builds.
3. For native: a real EAS build (`expo prebuild` alone won't prove it works in Expo Go, since react-native-maps requires a native dev client or standalone build).
4. A screen that actually has real lat/lng data to plot -- today only mock x/y percentages exist on the admin/merchant map screens, and no confirmed Xano endpoint returns real coordinates yet.

## Known blockers affecting deployment readiness

- **Xano `22P02` signup/seed error** — blocks real account creation entirely. Every "unverified live" item above is unverified specifically because this (and general lack of network access to Xano from automated environments) has prevented a real end-to-end test. Documented, not touched, per current instructions not to debug it right now.
- **Rider App auth contract gap** — the frozen `X-RAPEX-App` header only defines `buyer`/`merchant`/`admin`; there's no confirmed value for `rider`. This blocks rider-app from being usefully deployed at all until resolved (a deployed build would still only work against Mock data).
- **No production hosting decision made** — GitHub Pages staging is a stopgap, not a launch-ready host. Needs a real decision (provider, custom domain, CDN) before Sept 1.

## Before the Aug 27 QA freeze, still needed

1. ~~Actually run the CI workflow~~ — done, verified green (see above). The staging Pages deploy still needs a real run once Pages is enabled.
2. Resolve the Xano 22P02 blocker and get live credentials flowing so every "UNVERIFIED" item above can be tested for real.
3. Decide production hosting for the 3 web portals and an EAS/App Store Connect + Play Console plan for the 2 mobile apps.
4. Confirm the rider `X-RAPEX-App` header value so rider-app auth can be wired and deployed meaningfully.
5. A real Google Cloud Maps API key + billing, so the now-installed map dependencies can actually be exercised.
6. A real EAS build, so "prepared for EAS" can become "confirmed working."
