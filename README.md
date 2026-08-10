# RAPEX (Rapid Express)

**"Gawang Lokal, Para sa Masa"**

RAPEX is a hyperlocal marketplace and delivery platform built for the Philippines, piloting in Imus, Kawit, Lancaster, and General Trias.

Active development, targeting a September 1, 2026 pilot launch. See [docs/deployment/README.md](docs/deployment/README.md) for the real current build/deploy status and [docs/00_PROJECT_OVERVIEW.md](docs/00_PROJECT_OVERVIEW.md) for full context.

## Repo layout

- `docs/` — the RAPEX knowledge base: architecture, business rules, roadmap, deployment status, and more. Start at [docs/README.md](docs/README.md).
- `apps/` — the applications that make up RAPEX (see each app's README/folder for its role)
- `packages/` — shared code all apps build on: `@rapex/api-client` (repository-pattern API client, Mock + Xano implementations per domain), `@rapex/ui-web`/`@rapex/ui-native`, `@rapex/theme`, `@rapex/constants`, `@rapex/types`, `@rapex/utils`

## Applications

| App | Folder | Platform | Status |
|---|---|---|---|
| Customer App | [apps/customer-app](apps/customer-app) | React Native (Expo) | Active — marketplace, cart/checkout, wallet, auctions, full auth/registration wizard |
| Admin Portal | [apps/admin-portal](apps/admin-portal) | React + Vite (web) | Active — real Xano admin login; most dashboards still mock-data pending confirmed endpoints |
| Merchant Portal | [apps/merchant-portal](apps/merchant-portal) | React + Vite (web) | Active — store/product creation wired to Xano; most other screens mock |
| Rider App | [apps/rider-app](apps/rider-app) | React Native (Expo) | Scaffolded — auth blocked on an unconfirmed Xano contract value, see docs/api/README.md |
| Provider Portal | [apps/provider-portal](apps/provider-portal) | React + Vite (web) | Skeleton only, not yet built out |
| Login Module | ~~apps/login-module~~ | — | Never built — each app implements its own login screen directly instead; folder is a leftover placeholder |

## Stack

React Native + Expo + TypeScript (mobile) · React + Vite + TypeScript (web) · Xano (backend/API) · Firebase (realtime/push) · Google Maps · PayMongo/QRPH/GCash/Maya (payments)

See [docs/00_PROJECT_OVERVIEW.md](docs/00_PROJECT_OVERVIEW.md) for full context.
