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
4. Firebase Cloud Messaging (push) — started, see below.

## Cloud Messaging (push notifications)

**Status: Cloud Function saved to the repo, not deployed, not wired end to
end.** Irvin provided a `sendPushNotification` Cloud Function
(2026-08-21); it lives at `firebase/functions/index.js` (deploy config at
the repo root: `firebase.json` + `.firebaserc`, default project
`studio-9520309954-bfd24` — the same project already used for Auth).

### To deploy it
This has to be done from a machine with the Firebase CLI and Irvin's own
Google login — nothing in this coding environment can do it:
1. `npm install -g firebase-tools` (once), `firebase login`.
2. Cloud Functions (2nd gen, `firebase-functions/v2/https`) requires the
   project to be on the **Blaze (pay-as-you-go)** plan, even for usage
   that stays inside the free tier. Enable that in the Firebase Console
   first if it isn't already.
3. From the repo root: `firebase deploy --only functions`.

### Two real gaps before this can actually send a notification

1. **Token type mismatch.** `sendPushNotification` expects a native FCM
   device token (`admin.messaging().send({ token: targetToken, ... })`).
   `apps/customer-app/services/notifications.ts` and
   `apps/rider-app/services/notifications.ts` currently obtain **Expo**
   push tokens (`Notifications.getExpoPushTokenAsync`) — a different token
   type FCM's `send()` doesn't accept. Two ways to close this, pick one:
   - Switch the apps to get a native FCM token instead
     (`Notifications.getDevicePushTokenAsync()`), which needs a Firebase
     config file bundled into the native build
     (`google-services.json`/`GoogleService-Info.plist`) and a custom dev
     client / EAS build (won't work in plain Expo Go); or
   - Skip this Cloud Function and call
     [Expo's own push service](https://docs.expo.dev/push-notifications/sending-notifications/)
     directly from Xano with the Expo token already being collected —
     no Firebase Function needed at all.
2. **No caller authentication.** As written, `sendPushNotification` is a
   public HTTP endpoint — anyone who finds the URL can send an arbitrary
   push to an arbitrary token. Before this is called from Xano in
   production, it needs some form of caller verification (e.g. a shared
   secret header checked against a Xano env var, or Firebase App Check).
   Not added here since it's Irvin's function as provided — flagging it
   rather than changing the logic unasked.
3. There is also still no confirmed Xano endpoint to register/store a
   device's push token per user (see `notifications.ts`'s own comment) —
   that's the other missing half of the pipeline regardless of which
   token type is chosen above.
