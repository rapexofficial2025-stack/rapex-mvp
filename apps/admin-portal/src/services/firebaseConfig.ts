import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

/**
 * Firebase is assigned only to Authentication (Google sign-in) and, later,
 * Cloud Messaging (push notifications) -- per instruction, never business
 * logic or data storage. Xano remains the primary backend; this file has
 * nothing to do with Xano and doesn't touch the existing repository
 * pattern. Same pattern as apps/customer-app and apps/rider-app's
 * firebaseConfig.ts.
 *
 * No credentials are hardcoded here -- every value below is undefined
 * until a real Firebase project's config is set via VITE_FIREBASE_* env
 * vars (see .env.example). If any required field is missing,
 * `firebaseApp`/`firebaseAuth` are both null and the Google button shows
 * an honest "not configured" notice instead of a fake success.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every((value) => !!value);

export const firebaseApp: FirebaseApp | null = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const firebaseAuth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;
