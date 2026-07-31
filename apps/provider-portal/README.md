# Provider Portal

Dashboard for professional service providers (e.g. home services, bookings) to manage their listings, availability, and bookings.

- **Platform:** React + Vite + TypeScript (scaffolded via `create-vite`, `react-ts` template)
- **Backend:** Xano (not connected yet)
- **Shared packages:** `@rapex/theme`, `@rapex/types`, `@rapex/constants`, `@rapex/utils`

## Run it

From the repo root:

```bash
pnpm --filter provider-portal dev
```

## Status
Bootstrapped and running. Consumes `@rapex/theme` for colors/typography/spacing (see `src/App.tsx`). No navigation, no screens beyond the placeholder, no API calls yet.

See [../../docs/architecture/01_ARCHITECTURE.md](../../docs/architecture/01_ARCHITECTURE.md) and [../../docs/roadmap/09_ROADMAP.md](../../docs/roadmap/09_ROADMAP.md) for build order.
