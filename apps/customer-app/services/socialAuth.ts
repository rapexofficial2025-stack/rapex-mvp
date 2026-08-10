import { Platform } from "react-native";
import { GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, type UserCredential } from "firebase/auth";
import { firebaseAuth, isFirebaseConfigured } from "./firebaseConfig";

/**
 * Prepared, not wired to any button yet -- WelcomeScreen/LoginScreen's
 * Google/Facebook buttons stay disabled until a real Firebase project
 * exists (see docs/deployment/Firebase.md) AND, for native builds, an
 * OAuth broker is set up (see the native note below). Nothing here fakes
 * a successful sign-in; every path either does the real Firebase call or
 * throws a clear "not configured" error.
 *
 * Web works today (once Firebase config exists) via signInWithPopup --
 * genuine browser OAuth popup, no extra packages needed. Native
 * (iOS/Android) needs more than Firebase config alone: Firebase JS SDK's
 * signInWithPopup/signInWithRedirect are web-only. The real native path is
 * expo-auth-session's Google/Facebook providers to obtain an OAuth token,
 * then firebase/auth's signInWithCredential(auth, GoogleAuthProvider.
 * credential(idToken)) -- deliberately not implemented yet since it needs
 * OAuth client IDs from Google Cloud Console / Meta for Developers that
 * don't exist yet either. Throwing here instead of guessing at that wiring.
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
