import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

/**
 * Firebase is assigned only to Authentication (Google/Facebook social
 * sign-in) and, later, Cloud Messaging (push notifications) -- per
 * instruction, never business logic or data storage. Xano remains the
 * primary backend; this file has nothing to do with Xano and doesn't touch
 * the existing AuthRepository/XanoAuthRepository pattern.
 *
 * No credentials are hardcoded here -- every value below is undefined until
 * a real Firebase project's config is set via EXPO_PUBLIC_FIREBASE_* env
 * vars (see .env.example). If any required field is missing, `firebaseApp`
 * and `firebaseAuth` are both null and the app continues to work exactly as
 * it does today (Google/Facebook buttons stay disabled, matching the
 * existing "requires Firebase configuration" toast/badge already shown in
 * WelcomeScreen/LoginScreen -- this file makes that message literally true
 * rather than aspirational, it doesn't change the UI).
 *
 * See docs/deployment/Firebase.md for exactly what must be provided.
 */
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every((value) => !!value);

export const firebaseApp: FirebaseApp | null = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const firebaseAuth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;
