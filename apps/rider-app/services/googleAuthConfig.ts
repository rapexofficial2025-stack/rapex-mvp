/**
 * Real Google OAuth client IDs (from Google Cloud Console -- each platform
 * needs its own). Undefined until these env vars are set, which is exactly
 * what LoginScreen's Google button checks before attempting sign-in --
 * matches the existing "disabled with an honest message until configured"
 * pattern used everywhere else in this codebase.
 *
 * Mirrors customer-app/services/googleAuthConfig.ts exactly: Xano's real
 * `/auth/google` contract wants pre-parsed profile fields, and
 * expo-auth-session's Google provider gets a raw ID token directly -- on
 * web AND native -- without needing a separate Firebase project.
 */
export const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
export const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
export const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

export const isGoogleSignInConfigured = !!(GOOGLE_WEB_CLIENT_ID || GOOGLE_IOS_CLIENT_ID || GOOGLE_ANDROID_CLIENT_ID);

/**
 * expo-auth-session's Google provider hard-requires a non-empty client ID
 * for the current platform at hook-call time, even if the request is never
 * actually prompted -- it throws synchronously on render otherwise,
 * crashing the whole screen. LoginScreen already gates the real sign-in
 * attempt behind `isGoogleSignInConfigured` (toast + no-op when false), so
 * this placeholder is only ever load-bearing for that hook-invariant check,
 * never for a real request.
 */
export const GOOGLE_WEB_CLIENT_ID_OR_PLACEHOLDER = GOOGLE_WEB_CLIENT_ID ?? "unconfigured";
export const GOOGLE_IOS_CLIENT_ID_OR_PLACEHOLDER = GOOGLE_IOS_CLIENT_ID ?? "unconfigured";
export const GOOGLE_ANDROID_CLIENT_ID_OR_PLACEHOLDER = GOOGLE_ANDROID_CLIENT_ID ?? "unconfigured";

export type GoogleIdTokenProfile = {
  googleId: string;
  email: string;
  firstName?: string;
  lastName?: string;
};

/**
 * Xano's real `/auth/google` contract takes pre-parsed profile fields
 * (`google_id`, `email`, `first_name`, `last_name`), not the raw ID token
 * itself -- so this decodes the JWT's payload (base64url, no signature
 * verification needed here: the token came straight from Google's own
 * OAuth server via expo-auth-session, never from user input, so its claims
 * are already trustworthy for this purpose). `sub` is Google's stable
 * per-account identifier -- that's `google_id`.
 */
export function decodeGoogleIdToken(idToken: string): GoogleIdTokenProfile {
  const payloadSegment = idToken.split(".")[1];
  if (!payloadSegment) throw new Error("Malformed Google ID token.");
  const base64 = payloadSegment.replace(/-/g, "+").replace(/_/g, "/").padEnd(payloadSegment.length + ((4 - (payloadSegment.length % 4)) % 4), "=");
  const claims = JSON.parse(atob(base64)) as { sub?: string; email?: string; given_name?: string; family_name?: string };
  if (!claims.sub || !claims.email) throw new Error("Google ID token is missing sub/email claims.");
  return { googleId: claims.sub, email: claims.email, firstName: claims.given_name, lastName: claims.family_name };
}
