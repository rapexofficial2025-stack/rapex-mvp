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
- **Firebase is not the backend.** It is scoped strictly to push notifications, Cloud Messaging, presence, live tracking, chat, Cloud Storage, analytics, crash reporting, Remote Config, and App Check. Business rules, validation, auth workflow, wallet logic, order processing, the auction engine, and financial operations must never be implemented in Firebase — they live in Xano. Full detail in [../06_FIREBASE_PLAN.md](../06_FIREBASE_PLAN.md).
- Firebase integration must be modular and replaceable — isolated behind its own package (`packages/firebase-client`) rather than called directly from screens or business logic, so it can be swapped without touching the business layer.
- Frontend talks to **Xano** for business operations and to **Firebase** only for realtime communication.
- Each app under `apps/` is independently runnable and only shares code via common packages once those are introduced.
- No duplicate components or business logic — all reusable code belongs in `packages/`.
- Base44 generates UI only; React apps consume APIs only.
- Documentation is updated alongside every architecture change.

## Planning pipeline

```
YOU
 │
 ▼
ChatGPT — Architecture
 │
 ▼
Xano — Business Logic
 │
 ▼
Firebase — Realtime Layer
 │
 ▼
Claude — Frontend
 │
 ▼
Base44 — UI
 │
 ▼
Google — QA
```

Each stage's output is the input to the next: architecture decisions (ChatGPT) shape the Xano data/business layer, which Firebase's realtime layer sits alongside (never inside), which Claude wires into the frontend, which Base44's generated UI drops into, which is then QA'd. See [../development/08_AI_WORKFLOW.md](../development/08_AI_WORKFLOW.md) for the full tool-responsibility breakdown.

## Enterprise target architecture

This is the full architecture RAPEX is building toward — see [02_FOLDER_STRUCTURE.md](02_FOLDER_STRUCTURE.md) for the folder tree. Not everything here is built yet; each piece is created when its phase actually starts, not in advance. Current build status lives in [../roadmap/09_ROADMAP.md](../roadmap/09_ROADMAP.md).

**Phased in as work reaches them:**
- `packages/` — shared code (API client, types, Firebase client, UI/design-system, theme, navigation, hooks, animations, maps, payments, notifications, rex-ai, etc.). **Blocked on the Xano API contract** — these get built to match the real backend, not guessed in advance.
- `backend/` — reference docs for the Xano/Firebase setup, integration specs, and database exports (documentation, mirrors what's actually configured in Xano/Firebase — not application code).
- `assets/` — branding, icons, illustrations, category imagery, R.E.X. animation assets, fonts, sounds. Built out per-category/per-feature as that content is actually produced.
- `config/`, `scripts/`, `tools/` — shared tooling config (ESLint/Prettier/TypeScript/Expo/Vite), setup/build/deploy scripts, and dev tooling (Base44/Figma helpers, codegen). Added once there's real code for them to configure.
- `testing/` — automation, QA, and performance/security test artifacts. Added once there's code to test (see [../testing/README.md](../testing/README.md) for the plan).

**Explicitly out of scope for this repo:** analytics, CRM, ERP, marketing, finance, and HR systems are not part of `rapex-mvp` — they are separate potential future systems, tracked only as a note in the roadmap, not as folders here. This keeps the repo scoped to the actual marketplace/delivery product.

## Status
Outline + enterprise target both documented. Physical build proceeds phase by phase per the roadmap.
