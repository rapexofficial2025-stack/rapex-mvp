import { Platform } from "react-native";
import { GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, type UserCredential } from "firebase/auth";
import { firebaseAuth, isFirebaseConfigured } from "./firebaseConfig";

/**
 * Same architecture as customer-app/services/socialAuth.ts. Not wired to
 * any screen yet -- rider-app's WelcomeScreen/LoginScreen don't have
 * Google/Facebook buttons today (unlike customer-app's), and adding them is
 * a UI change out of scope for this foundation pass. Prepared so the
 * service exists the moment that UI work happens, with the same native
 * caveat: web-only until expo-auth-session + OAuth client IDs are set up.
 */

function assertConfigured(): void {
  if (!isFirebaseConfigured || !firebaseAuth) {
    throw new Error("Firebase is not configured -- see docs/deployment/Firebase.md for what's required.");
  }
}

export async function signInWithGoogle(): Promise<UserCredential> {
  assertConfigured();
  if (Platform.OS !== "web") {
    throw new Error(
      "Native Google sign-in needs expo-auth-session + a Google OAuth client ID, not yet set up -- see docs/deployment/Firebase.md.",
    );
  }
  return signInWithPopup(firebaseAuth!, new GoogleAuthProvider());
}

export async function signInWithFacebook(): Promise<UserCredential> {
  assertConfigured();
  if (Platform.OS !== "web") {
    throw new Error(
      "Native Facebook sign-in needs expo-auth-session + a Meta App ID, not yet set up -- see docs/deployment/Firebase.md.",
    );
  }
  return signInWithPopup(firebaseAuth!, new FacebookAuthProvider());
}
