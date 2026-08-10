import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

/**
 * Same architecture as customer-app/services/firebaseConfig.ts -- Firebase
 * is assigned only to Authentication (Google/Facebook, "where appropriate"
 * for riders) and, later, Cloud Messaging. Xano remains the primary
 * backend and this doesn't touch the existing AuthRepository pattern.
 *
 * No credentials hardcoded -- undefined until EXPO_PUBLIC_FIREBASE_* env
 * vars are set (see .env.example and docs/deployment/Firebase.md).
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
