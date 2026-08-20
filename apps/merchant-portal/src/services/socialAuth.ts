import { GoogleAuthProvider, signInWithPopup, type UserCredential } from "firebase/auth";
import { firebaseAuth, isFirebaseConfigured } from "./firebaseConfig";

/**
 * Real Google sign-in for the web -- no OAuth-broker complexity needed
 * here (unlike the mobile apps), since Firebase JS SDK's signInWithPopup
 * is a genuine browser OAuth popup that works directly once a real
 * Firebase project exists. Nothing here fakes a successful sign-in: it
 * either does the real popup flow or throws a clear "not configured"
 * error, same discipline as apps/customer-app/services/socialAuth.ts.
 *
 * This only gets the user a Firebase identity -- exchanging that for a
 * real RAPEX/Xano session is a separate step gated on Xano's confirmed
 * `/auth/me` field schema for Merchant (see docs/api/README.md and
 * docs/business/Authentication.md), not implemented here.
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  if (!isFirebaseConfigured || !firebaseAuth) {
    throw new Error("Firebase is not configured -- set VITE_FIREBASE_* in .env.local (see .env.example).");
  }
  return signInWithPopup(firebaseAuth, new GoogleAuthProvider());
}
