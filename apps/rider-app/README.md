# Rider App

The delivery rider app: order pickup, live tracking, earnings.

- **Platform:** React Native + Expo + TypeScript (scaffolded via `create-expo-app`, `blank-typescript` template)
- **Backend:** Xano (not connected yet)
- **Realtime:** Firebase (notifications), Google Maps (live tracking) — not connected yet
- **Shared packages:** `@rapex/theme`, `@rapex/types`, `@rapex/constants`, `@rapex/utils`

## Run it

From the repo root:

```bash
pnpm --filter rider-app start
```

Then press `w` for web, or scan the QR code with the Expo Go app for a real device preview.

## Status
Bootstrapped and running. Consumes `@rapex/theme` for colors/typography/spacing (see `App.tsx`). No navigation, no screens beyond the placeholder, no API calls yet.

See [../../docs/architecture/01_ARCHITECTURE.md](../../docs/architecture/01_ARCHITECTURE.md) and [../../docs/roadmap/09_ROADMAP.md](../../docs/roadmap/09_ROADMAP.md) for build order.
