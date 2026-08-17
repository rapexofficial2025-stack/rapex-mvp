# Codex UI Checklist — Merchant Portal + Admin Portal (web only)

Codex's job here is the same as Base44/Gemini: **draw the screen, nothing
else.** Claude is the only one who wires real data/logic into any app --
this keeps one source of truth instead of forking business rules across
tools. See `docs/design/07_UI_GUIDELINES.md` for the full house rule.

## Ground rules (apply to every screen below)

- **UI/UX only.** No backend calls, no new business logic, no invented
  features (gamification, points, fake wallet transfers, etc.) unless a
  screen below explicitly says to include it.
- Follow the accessibility rule: **one primary action per screen**, no
  icon-only buttons on anything that navigates or commits, max ~3
  secondary actions, predictable "you know where this leads" navigation.
- Use realistic **placeholder data** (peso amounts, PH addresses, names)
  -- doesn't need to match real field names exactly, Claude re-wires it
  to the real data during porting either way.
- Both apps below are plain **React + Vite (web)** -- regular CSS,
  regular DOM, no React Native translation needed. That's why Codex is
  scoped to these two and not the mobile apps (Rider/Customer/
  auth-preview are Expo/React Native, and stay with Claude -- CSS
  tricks like backdrop-filter/box-shadow/radial-gradient don't exist
  there, so a web-first tool's output needs a full rewrite to be usable
  on mobile anyway).
- **Output:** push to a single branch, e.g. `codex/ui-drafts`, on
  `rapexofficial2025-stack/rapex-mvp`. Don't touch `packages/*` (shared
  code), `apps/rider-app`, `apps/customer-app`, or `apps/auth-preview`.

## Merchant Portal (`apps/merchant-portal` -- web)

Existing pages to restyle/polish (don't rename routes or remove fields):

- [ ] `LoginPage` -- already has a reference design ported; only touch if
      you have a specific improvement, not a rebuild.
- [ ] `DashboardPage` -- store overview, key stats, recent orders at a
      glance.
- [ ] `OrdersPage` -- order list/detail, status updates.
- [ ] `StorePage` -- store profile/settings management.

## Admin Portal (`apps/admin-portal` -- web)

- [ ] `LoginPage` / `RegisterPage` -- admin auth screens.
- [ ] `DashboardPage` / `CommandCenterPage` -- top-level admin overview.
- [ ] `EngineCenterPage` -- delivery-fee/platform engine controls.
- [ ] `IntegrationsPage` -- third-party integration management.
- [ ] `OrderFinancialsPage` -- order-level financial breakdown.
- [ ] `VerificationQueuePage` -- rider/merchant document verification
      queue.

## Not in scope for Codex

`apps/rider-app`, `apps/customer-app`, `apps/auth-preview` -- all
Expo/React Native, stay with Claude.

## Tracking

Check items off here as Codex finishes them (don't need to paste the
full Codex conversation back -- Claude will review the branch + this
file directly).
