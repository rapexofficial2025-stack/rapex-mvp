# 02 — Folder Structure

## Current (built now)

```
rapex-mvp/
├── docs/                       # knowledge base — see docs/README.md
└── apps/
    ├── login-module/           # shared authentication flow (React Native)
    ├── customer-app/           # customer-facing marketplace + delivery (React Native)
    ├── rider-app/              # rider delivery app (React Native)
    ├── merchant-portal/        # merchant dashboard (React Web)
    ├── admin-portal/           # internal admin dashboard (React Web)
    └── provider-portal/        # professional service provider dashboard (React Web)
```

Each app will follow this internal structure once code is added (standard for both React Native and React Web apps in this project):

```
src/
├── components/
├── screens/
├── navigation/
├── hooks/
├── services/
├── types/
├── utils/
├── assets/
├── contexts/
└── providers/
```

## Target enterprise architecture (built in phases, not all at once)

This is the full structure RAPEX is growing into. Each top-level folder below gets created when its phase of work actually begins — see [01_ARCHITECTURE.md](01_ARCHITECTURE.md#enterprise-target-architecture) for why, and [../roadmap/09_ROADMAP.md](../roadmap/09_ROADMAP.md) for sequencing.

```
rapex-mvp/
├── apps/                       # ✅ built — see "Current" above
│
├── packages/                   # ⬜ blocked on Xano API contract
│   ├── api-client/             # typed Xano API wrapper
│   ├── types/                  # shared TS interfaces (User, Order, Product, Wallet...)
│   ├── firebase-client/        # shared Firebase init (push, chat, presence, R.E.X. state)
│   ├── constants/               # enums, config values
│   ├── utils/                  # pure helper functions
│   ├── ui/ , design-system/    # shared UI primitives (from Base44 conversions)
│   ├── theme/                  # colors, spacing, radius, shadows, typography, icons
│   ├── navigation/              # shared navigation (mobile/web/shared)
│   ├── hooks/ , contexts/ , providers/
│   ├── animations/              # includes R.E.X. animation logic
│   ├── maps/                    # Google Maps helpers (tracking, directions, distance)
│   ├── payments/                # wallet, PayMongo, QRPH, future gateways
│   ├── notifications/           # Firebase, local, push, in-app
│   ├── permissions/ , feature-flags/
│   ├── rex-ai/                  # R.E.X. chat, emotion, animations, voice, memory, prompts
│   └── config/
│
├── backend/                    # ⬜ reference docs only, mirrors real Xano/Firebase setup
│   ├── xano/ , firebase/ , integrations/
│   └── api-specs/ , database/ , schemas/ , erd/ , exports/ , workflows/
│
├── assets/                     # ⬜ built per-category/per-feature as content is produced
│   ├── branding/ , logos/ , icons/ , illustrations/ , backgrounds/ , banners/
│   ├── categories/ , stores/ , products/ , avatars/ , payments/ , maps/
│   ├── videos/ , sounds/ , fonts/ , lottie/ , gif/
│   └── rex/                    # idle, happy, sad, thinking, typing, delivery, shopping,
│                                # celebration, loading, warning, error, sleep, walking,
│                                # pointing, voice, expressions
│
├── branding/                   # ⬜ logos, colors, typography, templates, guidelines
│
├── database/                   # ⬜ sample-data, seed-data, schemas, relationships, ERD, migration
│
├── testing/                    # ⬜ manual, qa, automation, screenshots, performance, security
│
├── config/                     # ⬜ expo, vite, typescript, eslint, prettier, metro, environment
│
├── scripts/                    # ⬜ setup, migration, build, deploy, generate, cleanup
│
├── tools/                      # ⬜ base44, figma, migration, utilities, codegen
│
└── docs/                       # ✅ built — see docs/README.md
```

**Not part of this repo:** `analytics/`, `crm/`, `erp/`, `marketing/`, `finance/`, `hr/` are noted in [../roadmap/09_ROADMAP.md](../roadmap/09_ROADMAP.md) as possible future systems, but are not folders here — they're separate enterprise systems, not part of the marketplace/delivery product.

## Status
Current structure built. Target structure documented and phased — nothing under "Target enterprise architecture" is created yet except where marked otherwise in the roadmap.
