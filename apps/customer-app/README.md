# Customer App

The customer-facing marketplace and delivery app.

- **Platform:** React Native + Expo + TypeScript (scaffolded via `create-expo-app`, `blank-typescript` template)
- **Backend:** Xano (not connected yet)
- **Realtime:** Firebase (not connected yet)
- **Shared packages:** `@rapex/theme`, `@rapex/types`, `@rapex/constants`, `@rapex/utils`

## Run it

From the repo root:

```bash
pnpm --filter customer-app start
```

Then press `w` for web, or scan the QR code with the Expo Go app on your phone for a real device preview. Requires no Xano/Firebase setup — this is UI-only right now.

## Status
Bootstrapped and running. Consumes `@rapex/theme` for colors/typography/spacing (see `App.tsx`). No navigation, no screens beyond the placeholder, no API calls yet.

See [../../docs/architecture/01_ARCHITECTURE.md](../../docs/architecture/01_ARCHITECTURE.md) and [../../docs/roadmap/09_ROADMAP.md](../../docs/roadmap/09_ROADMAP.md) for build order.
