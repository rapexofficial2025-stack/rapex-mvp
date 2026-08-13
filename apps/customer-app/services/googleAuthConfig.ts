/**
 * Real Google OAuth client IDs (from Google Cloud Console -- each platform
 * needs its own). Undefined until these env vars are set, which is exactly
 * what LoginScreen's Google button checks before attempting sign-in --
 * matches the existing "disabled with an honest message until configured"
 * pattern used everywhere else in this codebase.
 *
 * Supersedes the earlier Firebase-based Google prep (see socialAuth.ts/
 * firebaseConfig.ts) for this specific purpose: Xano's real `/auth/google`
 * contract wants a raw Google ID token, and expo-auth-session's Google
 * provider gets one directly -- on web AND native -- without needing a
 * separate Firebase project as a middleman. Firebase's `signInWithPopup`
 * path was also web-only; this works everywhere via a single OAuth
 * redirect flow.
 */
export const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
export const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
export const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

export const isGoogleSignInConfigured = !!(GOOGLE_WEB_CLIENT_ID || GOOGLE_IOS_CLIENT_ID || GOOGLE_ANDROID_CLIENT_ID);
