# Merchant Portal

Dashboard for merchants to manage products, orders, and their storefront.

- **Platform:** React + Vite + TypeScript (scaffolded via `create-vite`, `react-ts` template)
- **Backend:** Xano (not connected yet)
- **Shared packages:** `@rapex/theme`, `@rapex/types`, `@rapex/constants`, `@rapex/utils`

## Run it

From the repo root:

```bash
pnpm --filter merchant-portal dev
```

## Status
Bootstrapped and running. Consumes `@rapex/theme` for colors/typography/spacing (see `src/App.tsx`). No navigation, no screens beyond the placeholder, no API calls yet.

See [../../docs/architecture/01_ARCHITECTURE.md](../../docs/architecture/01_ARCHITECTURE.md) and [../../docs/roadmap/09_ROADMAP.md](../../docs/roadmap/09_ROADMAP.md) for build order.

## Public demo (no backend, no auth)

The portal has a build-time demo switch, `VITE_DEMO_MODE=true`:

- uses only the Mock repositories from `@rapex/api-client` (no Xano calls at all)
- any login works (even empty fields); no OTP
- the "signed in" flag lives in `localStorage`, so a refresh keeps you in

Run it locally:

```bash
VITE_DEMO_MODE=true pnpm --filter merchant-portal dev
```

It is published to GitHub Pages by `.github/workflows/deploy-merchant-demo.yml`
(needs Settings -> Pages -> Source: GitHub Actions). Normal builds (no flag) are
unchanged and still use real Xano auth + store/product creation.
