# auth-preview

A standalone, backend-free preview of the auth screens (Welcome → Age Verification → Login), built for one thing: **live-editing UI in plain Expo Go**, with instant Fast Refresh on your phone — no EAS build, no Java, no Android Studio, no keystore, ever.

## Why this exists

The real app (`apps/customer-app`) depends on native modules (`react-native-maps`, `@sentry/react-native`) that Expo Go can't run — those need a custom EAS development build, which is a much slower, heavier workflow. This project has **zero** native dependencies on purpose, so it always just works in Expo Go.

It has no real backend calls and no Google auth SDK — every button either navigates between the three screens or shows a status line saying it's "not wired here." Purely for looking at and editing UI.

## Run it

```
cd apps/auth-preview
pnpm install   # only needed once, or after changing package.json
npx expo start
```

Scan the QR code with **Expo Go** (the regular app from the Play Store / App Store — not a custom dev-client). Edit any file in `screens/`, hit save, and the screen updates on your phone in about a second.

## Screens

- `screens/WelcomeScreen.tsx` — Screen 1, "Let's get Started"
- `screens/AgeGateScreen.tsx` — Screen 2, year-of-birth check (local only, no real 18+ backend enforcement)
- `screens/LoginScreen.tsx` — Screen 3, email/password + Google button (visual only)

## When you're ready to make it real

Real backend wiring, Google OAuth, age-lockout enforcement, and everything past Login already exists in `apps/customer-app` — port changes there when ready to connect to the real Xano backend, rather than adding backend logic here.
