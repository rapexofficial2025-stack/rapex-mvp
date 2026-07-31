# 01 — Architecture

## Build order for the MVP
1. Architecture (this doc)
2. Folder structure
3. Navigation
4. UI
5. Authentication
6. Backend integration
7. Testing

## Stack
- **Mobile:** React Native + Expo + TypeScript
- **Web:** React + Vite + TypeScript
- **Backend:** Xano (auth, database, REST API, business logic)
- **Realtime:** Firebase (push notifications, chat, presence, typing indicators, R.E.X. state)
- **Maps:** Google Maps
- **Payments:** PayMongo, QRPH, GCash, Maya
- **Version control:** GitHub
- **IDE:** VS Code
- **UI generation:** Base44 (converted into this repo's structure by Claude)

## Principles
- No backend logic in the frontend apps — Xano owns business logic, orders, wallet, products, auctions, users, merchants, and reports.
- Firebase is for realtime/presence concerns only, not source-of-truth business data.
- Each app under `apps/` is independently runnable and only shares code via common packages once those are introduced (not yet — see status in [00_PROJECT_OVERVIEW.md](00_PROJECT_OVERVIEW.md)).

## Status
Not yet detailed beyond this outline — to be expanded as ChatGPT-planned architecture decisions land.
