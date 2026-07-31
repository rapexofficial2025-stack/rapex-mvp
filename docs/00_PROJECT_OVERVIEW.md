# 00 — Project Overview

**Name:** RAPEX (Rapid Express)
**Tagline:** "Gawang Lokal, Para sa Masa"
**Mission:** Build the best hyperlocal marketplace and delivery platform for the Philippines.

## Pilot area
Imus, Kawit, Lancaster, General Trias.

## MVP goal
- Working marketplace
- Working delivery
- Working wallet
- Working authentication
- Working merchant portal
- Working rider app
- Working admin portal
- All connected to Xano

## Applications
1. Login Module (shared) — React Native
2. Customer App — React Native
3. Rider App — React Native
4. Merchant Portal — React Web
5. Admin Portal — React Web

## AI tool responsibilities
- **ChatGPT** — architecture, business logic design, UI planning, database planning, prompt engineering, product design, folder/feature planning, roadmap
- **Claude** — programming, folder structure, React Native, React web, code refactoring, reusable components, best practices, debugging, production code, API integration, GitHub
- **Base44** — UI, components, layouts, navigation, responsive design only (never backend)
- **Xano** — authentication, database, REST API, business logic (orders, wallet, products, auctions, users, merchants, reports)
- **Firebase** — push notifications, realtime chat, presence, typing indicators, R.E.X. conversation state

**Hard rule:** business logic never lives in the frontend — it belongs in Xano.

## Status
Skeletal folder structure only. No application code yet. See [09_ROADMAP.md](09_ROADMAP.md) for what's next.
