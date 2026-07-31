# RAPEX (Rapid Express)

**"Gawang Lokal, Para sa Masa"**

RAPEX is a hyperlocal marketplace and delivery platform built for the Philippines, piloting in Imus, Kawit, Lancaster, and General Trias.

This repository is currently a **skeletal structure only** — folders and planning docs, no application code yet. Code is being added incrementally following the build order in [docs/01_ARCHITECTURE.md](docs/01_ARCHITECTURE.md).

## Repo layout

- `docs/` — living planning documents (architecture, folder structure, features, business rules, roadmap, etc.)
- `apps/` — the five applications that make up RAPEX (see each app's README for its role)

## Applications

| App | Folder | Platform |
|---|---|---|
| Login Module (shared) | [apps/login-module](apps/login-module) | React Native |
| Customer App | [apps/customer-app](apps/customer-app) | React Native |
| Rider App | [apps/rider-app](apps/rider-app) | React Native |
| Merchant Portal | [apps/merchant-portal](apps/merchant-portal) | React Web |
| Admin Portal | [apps/admin-portal](apps/admin-portal) | React Web |

## Stack

React Native + Expo + TypeScript (mobile) · React + Vite + TypeScript (web) · Xano (backend/API) · Firebase (realtime/push) · Google Maps · PayMongo/QRPH/GCash/Maya (payments)

See [docs/00_PROJECT_OVERVIEW.md](docs/00_PROJECT_OVERVIEW.md) for full context.
