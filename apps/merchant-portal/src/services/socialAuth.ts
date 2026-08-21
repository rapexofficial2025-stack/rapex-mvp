import {
  GoogleAuthProvider,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  type UserCredential,
} from "firebase/auth";
import { firebaseAuth, isFirebaseConfigured } from "./firebaseConfig";

/**
 * Real Google sign-in for the web -- no OAuth-broker complexity needed
 * here (unlike the mobile apps), since Firebase JS SDK is a genuine
 * browser OAuth flow that works directly once a real Firebase project
 * exists. Nothing here fakes a successful sign-in: it either does the
 * real flow or throws a clear "not configured" error, same discipline as
 * apps/customer-app/services/socialAuth.ts.
 */
function requireFirebaseAuth() {
  if (!isFirebaseConfigured || !firebaseAuth) {
    throw new Error("Firebase is not configured -- set VITE_FIREBASE_* in .env.local (see .env.example).");
  }
  return firebaseAuth;
}

/**
 * Popup-based sign-in (desktop). Reliable there, but mobile browsers
 * routinely block or silently kill OAuth popups (observed: the popup
 * closes on its own after ~10s with no result on mobile Chrome/Edge) --
 * use signInWithGoogleRedirect() instead on mobile, see isMobileWebView().
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  return signInWithPopup(requireFirebaseAuth(), new GoogleAuthProvider());
}

/**
 * Redirect-based sign-in: navigates the whole page to Google instead of
 * opening a popup, then back to this same URL on completion. Never
 * resolves here -- the result is picked up by getGoogleRedirectResult()
 * after the page reloads.
 */
export async function signInWithGoogleRedirect(): Promise<never> {
  await signInWithRedirect(requireFirebaseAuth(), new GoogleAuthProvider());
  return new Promise<never>(() => {});
}

/** Call on every page load to pick up a signInWithGoogleRedirect() that just completed. Null if there's none pending. */
export async function getGoogleRedirectResult(): Promise<UserCredential | null> {
  if (!isFirebaseConfigured || !firebaseAuth) return null;
  return getRedirectResult(firebaseAuth);
}

/** Popups are unreliable enough on mobile browsers (see signInWithGoogle's note) that redirect is the safer default there. */
export function isMobileWebView(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}
