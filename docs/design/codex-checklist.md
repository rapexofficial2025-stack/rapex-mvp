# Codex Brief — Merchant Portal + Admin Portal (web)

Paste this whole file to Codex as its first message. It's written so Codex
understands the project without the founder having to re-explain it, and
so nothing it builds contradicts what already exists.

---

## 1. Who's on this team, and your role in it

- **The founder (product owner)** — decides features, priorities, and
  marketing. Reviews your work via this checklist, not full transcripts.
- **Claude (senior dev, your reviewer)** — owns real backend wiring,
  business logic, the mobile apps (React Native), and integrates
  whatever you build into the real codebase. Report to Claude the same
  way a junior dev reports a PR to a senior dev: what you built, what's
  still a placeholder, what you're unsure about.
- **ChatGPT** — architecture/business-logic planning, roadmap.
- **Base44 / Gemini** — draw UI for the mobile apps (not your scope).
- **Xano** — the real backend. Auth, database, REST API, business logic
  (orders, wallet, products, auctions, users, merchants, reports) all
  live there — never in frontend code.
- **You (Codex)** — UI/UX for the two web portals below. Draw screens.
  Do not invent backend logic; Claude wires anything real.

**Hard rule carried over from the whole project:** business logic never
lives in the frontend. If a screen needs a number, a status, a
calculation — use realistic placeholder data, and leave a comment
marking it as placeholder. Claude replaces it with the real Xano call.

## 2. Where this lives

- **Repo:** `rapexofficial2025-stack/rapex-mvp` on GitHub.
- **Your branch:** push to `codex/ui-drafts` (create it off `main`).
  Don't touch `packages/*` (shared code) or `apps/rider-app`,
  `apps/customer-app`, `apps/auth-preview` (those are React Native,
  not your scope, and stay with Claude).
- **Local dev:** both apps are Vite. `pnpm install` at the repo root,
  then `pnpm --filter merchant-portal dev` or
  `pnpm --filter admin-portal dev` opens a local dev server link — the
  founder views it in a browser tab from VS Code, not inside the editor.
- **Live domain:** `staging.rapexmarketplace.store` is the intended
  staging URL, but **it is not live yet** — DNS + GitHub Pages haven't
  been switched on by a repo admin. Don't assume anything is publicly
  reachable; test locally.

## 3. What RAPEX is, and what each portal is for

RAPEX ("Gawang Lokal, Para sa Masa") is a hyperlocal marketplace +
delivery platform for the Philippines, piloting in Imus, Kawit,
Lancaster, and General Trias. There are 5 apps total:

| App | Stack | Who uses it | Purpose |
|---|---|---|---|
| Customer App | React Native | Buyers | Browse/order from local stores, food, services; track delivery; wallet. |
| Rider App | React Native | Delivery riders | Accept/complete deliveries, earnings, wallet, incentives. |
| **Merchant Portal** | React web | Store owners | Manage their store, products, incoming orders, payouts. **← your scope** |
| **Admin Portal** | React web | RAPEX staff | Platform-wide oversight: verification queue, order financials, the delivery-fee "engine," integrations. **← your scope** |
| Provider Portal | React web | Service providers | Similar to Merchant, for service-based listings (not in your checklist below, ask before touching). |

## 4. Real current status — read this so you don't assume more is done than is

- **Backend (Xano):** mostly real and wired for Customer/Merchant/Admin
  auth + data. Two known live blockers: a signup/seed error on Xano's
  side, and the Rider app's auth header value isn't finalized yet — so
  Rider is still on mock data. Doesn't affect your two portals directly,
  just don't assume Rider-related data shapes are final if you ever see them.
- **Google Maps:** dependencies and components exist (`@react-google-maps/api`
  for web), but **no map has ever actually rendered** — there's no billing-enabled
  API key yet. If a screen needs a map, build it with the real component
  Claude already has (`GoogleMapView` in `@rapex/ui-web`) rather than a
  fake static map image, but expect it to show blank/error until a real
  key is added — that's expected, not your bug to fix.
- **Payments:** Alpha scope is Cash-on-Delivery + RAPEX Wallet only.
  PayMongo/GCash/Maya/QRPH are planned for **Beta**, not implemented yet.
  Don't build a payment screen assuming those rails are live — use
  placeholder/"coming soon" treatment for anything beyond COD + Wallet.
- **CI:** green (typecheck/lint/build passes on every push). Keep it
  that way — run `pnpm --filter merchant-portal typecheck` /
  `pnpm --filter admin-portal typecheck` before you consider a screen done.

## 5. The "static image + invisible button" technique (use when full code UI isn't worth it)

When a screen's visual design is complex (gradients, custom shapes,
photo-real backgrounds) and rebuilding it in code pixel-for-pixel isn't
worth the time, this project already has a working pattern for faking
interactivity on top of a flat reference image:

- Render the design as a single background image.
- Overlay `Hotspot` components (`packages/ui-web/src/Hotspot.tsx`) —
  fully transparent, positioned by **percentage** (not pixels) so they
  stay aligned regardless of image scaling — one per tappable region.
  Each one requires a `label` (for accessibility) and an `onClick`.
- The user sees a "static" image, but every tappable area is a real,
  working, invisible button underneath.

Use this ONLY when it's genuinely faster than real code UI, and only
for truly static/decorative regions — anything with dynamic data (an
order list, a live count) must be real code, not baked into an image.
Default to full code UI; reach for this only if needed.

## 6. Build order

1. **Full skeleton first** — every screen in the checklist below exists,
   routes work, navigation between them works, using placeholder data.
   Don't polish one screen to perfection while others don't exist yet.
2. Founder reviews the skeleton (screenshots / a running preview).
3. **Then polish** — once the skeleton is confirmed, refine spacing,
   color, motion, detail per screen.

## 7. Mixing in outside AI-generated code (screenshots, other tools' output)

The founder may hand you screenshots or code snippets pulled from other
AI tools (ChatGPT, Gemini, Glide, etc.) as visual/structural reference.
That outside code is **never wired into the real system** — it doesn't
know about this repo's real components, hooks, or data shapes. Treat it
as a picture, not a patch:
- Copy the *look*, not the literal code, into this repo's real
  components/patterns.
- Don't import or paste foreign code wholesale — re-implement what you
  need using this project's existing conventions.
- If unsure whether something should be real (wired to Xano) or fake
  (placeholder), default to placeholder and flag it — Claude decides.

## 8. Ground rules for every screen

- **One primary action per screen.** A single, visually dominant CTA
  that does the obvious next thing. Two equally-important actions on
  one screen usually means it should be two screens.
- **No icon-only buttons for anything that navigates or commits.**
  Every meaningful button gets a visible label. Icon-only is fine only
  for purely decorative things (a close X, a map layers toggle).
- **Cap secondary actions at ~3 per screen**, visually subordinate to
  the primary CTA.
- **Predictable navigation** — a button's label/icon should tell the
  user what screen they'll land on before they tap it. RAPEX's
  customers/staff skew toward users with little app experience (target:
  Grab/foodpanda/GCash-level clarity, not Lazada-style button sprawl).
- Full rule set: `docs/design/07_UI_GUIDELINES.md`.

---

## Checklist — Merchant Portal (`apps/merchant-portal`)

- [x] `LoginPage` — Alpha auth architecture applied (5-stage registration
      shell, cursor-following glow). Verified by Claude: typecheck/lint/
      build clean, merged `918ae8c..1a5311f`.
- [x] `DashboardPage` — store overview, key stats, recent orders.
      Verified by Claude: typecheck/lint/build clean (commit `94ff396`).
- [~] `OrdersPage` — order list/detail, status updates, now includes
      receipt history/preview integration. Verified typecheck/build
      clean; not yet checked against real Xano order-status schema.
- [ ] `StorePage` — store profile/settings management.
- [x] (new, not on original list) `RegisterPage` — 5-stage Merchant
      onboarding (Account → OTP → Basic Identity → Main Store →
      Identity Verification), matches `docs/business/Merchant.md`'s
      13-step spec collapsed to Alpha scope. Verified.
- [x] (new) Receipt history + printable preview, "Request Official
      Receipt" UI that stops before any real request — correctly no
      fake export/QR/receipt-number generated. Verified.

## Checklist — Admin Portal (`apps/admin-portal`)

- [x] `LoginPage` / `RegisterPage` — admin auth screens. Now
      invitation-only: public `/admin/register` redirects to login (no
      "Create Account" button), real account creation only via
      `/admin/invite/:token`. Verified by Claude directly in code
      (confirmed the redirect + route gating), matches
      `docs/business/Admin.md`. Super Admin confirmed still inactive/
      backend-gated.
- [~] `DashboardPage` / `CommandCenterPage` — top-level admin overview.
      `DashboardPage` done (icon-only approve/reject replaced with labeled
      buttons, actions capped at 1 primary + 3 secondary) and verified by
      Claude: typecheck/lint/build clean (commit `918ae8c`).
      `CommandCenterPage` not started yet.
- [ ] `EngineCenterPage` — delivery-fee/platform engine controls.
- [ ] `IntegrationsPage` — third-party integration management.
- [ ] `OrderFinancialsPage` — order-level financial breakdown.
- [ ] `VerificationQueuePage` — rider/merchant document verification queue.

## Not in scope for Codex

`apps/rider-app`, `apps/customer-app`, `apps/auth-preview`, `apps/provider-portal`
(ask first on Provider) — stay with Claude.

## Tracking

Check items off above as you finish them. The founder updates this file
so Claude can review just the branch + this checklist, without needing
the full Codex conversation pasted back.

---

## Addendum — routing/file conventions + "checked off" definition

### Routing (react-router-dom, both apps)

**Merchant Portal** (`apps/merchant-portal/src/App.tsx`):
- Auth screens are top-level: `/login`
- Everything else lives under `/portal`, wrapped in `<RequireMerchantAuth>` + `<PortalLayout>`:
  - `/portal/dashboard` → `DashboardPage` (in `src/routes/`)
  - `/portal/orders` → `OrdersPage` (in `src/routes/`)
  - `/portal/store` → `StorePage` (in `src/features/store/`)
- Default route (`/`) redirects to `/login`; `/portal` index redirects to `/portal/store`.

**Admin Portal** (`apps/admin-portal/src/App.tsx`):
- Auth screens are top-level: `/admin/login`, `/admin/register`
- Everything else lives under `/admin`, wrapped in `<RequireAdminAuth>` + `<PortalLayout>`:
  - `/admin/dashboard` → `DashboardPage` (in `src/features/dashboard/`)
  - `/admin/command-center` → `CommandCenterPage` (in `src/routes/`)
  - `/admin/verification` → `VerificationQueuePage` (in `src/features/verification/`)
  - `/admin/engine-center` → `EngineCenterPage` (in `src/features/engine-center/`)
  - `/admin/order-financials` → `OrderFinancialsPage` (in `src/features/order-financials/`)
  - `/admin/integrations` → `IntegrationsPage` (in `src/features/integrations/`)
- Default route (`/`) redirects to `/admin/dashboard`.

**File convention:** newer pages live under `src/features/<feature-name>/<PageName>.tsx`, older ones under `src/routes/<PageName>.tsx` — both are registered the same way in `App.tsx`. Prefer `src/features/<name>/` for anything new. Don't invent a different routing library or folder shape.

### Definition of "checked off" (✅ in the checklist)

An item is done when ALL of the following are true:
1. The route renders without crashing on a fresh `pnpm install` + `pnpm --filter <app> dev`.
2. It follows the ground rules (one primary action, no icon-only nav buttons, ≤3 secondary actions, predictable navigation).
3. Any number/status/data shown is clearly placeholder (not silently invented as if real).
4. `pnpm --filter merchant-portal typecheck` / `pnpm --filter admin-portal typecheck` passes clean.
5. It's pushed to `codex/ui-drafts`.

Skeleton-stage items don't need visual polish to count as checked off — just working, rule-following, and typechecked. Polish is a separate later pass.
