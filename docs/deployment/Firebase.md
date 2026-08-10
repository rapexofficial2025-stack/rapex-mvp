# Firebase

## Status
**Architecture prepared, not connected.** No Firebase project exists yet
from this environment's point of view — no credentials have been supplied,
none are hardcoded anywhere in the repo, and nothing calls Firebase today.
Google/Facebook sign-in buttons stay disabled in the UI until this is done.

## Scope (deliberately narrow)
Firebase is assigned to:
1. **Authentication** — Google/Facebook social sign-in (email/password
   stays on the existing Xano `AuthRepository`/`XanoAuthRepository` — this
   is unchanged).
2. **Cloud Messaging** (push notifications) — later, not built yet.

Firebase is explicitly **not** used for the database, business logic, or
anything Xano already owns. Nothing in `packages/api-client`'s repository
pattern changes because of this.

## What Irvin needs to provide

### 1. A Firebase project
Console: https://console.firebase.google.com

- Create a project (or reuse one if it already exists — `apps/admin-portal/.env.example`
  has an old comment referencing project ID `studio-9520309954-bfd24`; confirm
  whether that's the intended project before creating a new one).
- Add a **Web app** to the project (Project settings → General → Your apps →
  Add app → Web). This gives you the 6 config values below — they're public
  client config, not secrets, but still go in `.env.local`, never hardcoded.
- In **Authentication → Sign-in method**, enable the **Google** and
  **Facebook** providers.

Copy these 6 values into `.env.local` for **both** `apps/customer-app` and
`apps/rider-app` (same project, same values, both apps' `.env.example`
already list them):

```
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

Once these are set, **web sign-in works immediately** — `signInWithPopup`
via the Firebase JS SDK needs nothing beyond this.

### 2. Google OAuth client ID (native only)
Needed only for the phone apps (iOS/Android) — web doesn't need this step.

Console: https://console.cloud.google.com (the same Google Cloud project
Firebase created automatically)

- APIs & Services → Credentials → Create OAuth client ID, once each for iOS
  and Android, using the `ph.rapex.customer`/`ph.rapex.rider` bundle
  IDs/package names already set in each app's `app.config.js`.
- These client IDs get wired into `expo-auth-session`'s Google provider —
  **not implemented yet** (see `apps/customer-app/services/socialAuth.ts`'s
  doc comment). That's the next piece of work once these IDs exist.

### 3. Facebook App (native only, and for the Facebook provider generally)
Console: https://developers.facebook.com

- Create an app, add the "Facebook Login" product.
- Get the App ID + App Secret; the secret goes into Firebase Console's
  Facebook provider settings (Firebase, not this repo — Firebase holds that
  secret server-side).
- For native sign-in specifically, the same `expo-auth-session` wiring
  gap as Google applies.

## What's already built, ready for those values

- `apps/customer-app/services/firebaseConfig.ts` and
  `apps/rider-app/services/firebaseConfig.ts` — reads the env vars above,
  initializes the Firebase app only if all 6 are present. If any are
  missing, `firebaseApp`/`firebaseAuth` are `null` and nothing breaks — the
  app behaves exactly as it does today.
- `apps/customer-app/services/socialAuth.ts` and
  `apps/rider-app/services/socialAuth.ts` — `signInWithGoogle()` /
  `signInWithFacebook()`. Real (not faked) on web once step 1 is done.
  Throws a clear error on native until step 2/3's `expo-auth-session`
  wiring is added — not guessed at here since the OAuth client IDs don't
  exist yet.

## Not yet done (in order)
1. Fill in step 1 above → **web** Google/Facebook sign-in becomes real.
2. Wire the disabled buttons in `WelcomeScreen.tsx`/`LoginScreen.tsx` to
   actually call `signInWithGoogle()`/`signInWithFacebook()` — currently
   intentionally not connected since calling them with no Firebase project
   configured would just throw; connecting them now would be UI work ahead
   of having something real to test, out of scope for this foundation pass.
3. Add `expo-auth-session` + steps 2/3 above → native sign-in becomes real.
4. Firebase Cloud Messaging (push) — not started, separate piece of work.
