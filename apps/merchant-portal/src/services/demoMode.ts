/**
 * Public demo build switch. Set VITE_DEMO_MODE=true at build time (see
 * .github/workflows/deploy-merchant-demo.yml) to get a Merchant Portal that:
 *  - uses ONLY the Mock repositories from @rapex/api-client (no Xano calls),
 *  - accepts any login (no OTP, no real authentication),
 *  - keeps the "signed in" flag in localStorage so a refresh doesn't log out.
 * Never set this for a staging/production build.
 */
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

const DEMO_SESSION_KEY = "rapex_demo_signed_in";

export const demoSession = {
  isSignedIn(): boolean {
    try {
      return localStorage.getItem(DEMO_SESSION_KEY) === "true";
    } catch {
      return false;
    }
  },
  signIn(): void {
    try {
      localStorage.setItem(DEMO_SESSION_KEY, "true");
    } catch {
      // Storage blocked (private mode): the demo still works for this page load.
    }
  },
  signOut(): void {
    try {
      localStorage.removeItem(DEMO_SESSION_KEY);
    } catch {
      // ignore
    }
  },
};
