import type { AuthSession, AuthUser } from "../types";

/**
 * Matches the RAPEX Master Authentication Suite (Xano `rapex-auth` group,
 * confirmed 2026-08-13) used by Customer, Merchant, and (once its role
 * header is confirmed) Rider. Registration is now admin-approved and
 * address-complete: `register()` no longer returns a session -- the account
 * is created `pending_verification` and can't log in until an admin
 * approves it. Login is two-phase: `login()` validates the password and
 * emails a 6-digit code, `verifyOtp()` confirms that code and is the only
 * call that returns a real session.
 *
 * Admin (a separate Xano group, `super_app`, XanoAdminAuthRepository) is
 * genuinely single-phase -- its `login()` returns a session immediately.
 * `LoginResult` models both shapes honestly instead of forcing Admin
 * through a fake OTP step it doesn't have.
 */
export type GoogleProfileInput = {
  googleId: string;
  email: string;
  firstName?: string;
  lastName?: string;
};

export type RegisterInput = {
  email: string;
  password: string;
  role: AuthUser["role"];
  firstName: string;
  lastName: string;
  mobile: string;
  /** ISO date (YYYY-MM-DD). Optional -- not every app collects this at registration. */
  dateOfBirth?: string;
  /**
   * GAP: this codebase has no real region/province/municipality/barangay ID
   * lookup (only a fixed pilot-area constant, see @rapex/constants). Left
   * optional/undefined rather than sending fabricated IDs -- Xano's signup
   * may reject registration until a real location-lookup endpoint exists
   * and these are wired for real.
   */
  regionId?: string;
  provinceId?: string;
  municipalityId?: string;
  barangayId?: string;
  addressLine1?: string;
};

export type LoginInput = { email: string; password: string };

export type RegisterResult = { userId: string; accountStatus: string };

export type LoginResult = { status: "otp_required" } | { status: "authenticated"; session: AuthSession };

export type NextStep = "PRIVACY_TERMS" | "REGISTRATION" | "WELCOME_ANIMATION" | "PROFILE_SETUP" | "HOME";

/**
 * The richer `GET /auth/me` payload Xano confirmed exists, beyond the bare
 * `next_step` `getNextStep()` already reads. Field-level confirmation as of
 * 2026-08-14:
 *   - `next_step` (text), `welcome_seen` (boolean), `registration_progress`
 *     (integer 0-100) -- typed for real below.
 *   - `profile_checklist` -- confirmed to be an array, but its *item* shape
 *     (what fields each entry has, and what an entry's presence/absence
 *     means) was not specified. Typed as `unknown[]` rather than guessed --
 *     a consumer narrows individual items once that's confirmed.
 *   - `branding` -- confirmed to be an object; `tagline` and
 *     `welcomeVideoUrl` are the two sub-fields named explicitly in this
 *     project's Xano handover. Both optional since even those two aren't
 *     guaranteed present on every response, and no other sub-field name has
 *     been confirmed.
 */
export type AuthMeResponse = {
  nextStep: NextStep | null;
  welcomeSeen: boolean;
  registrationProgress: number | null;
  profileChecklist: unknown[];
  branding: { tagline?: string; welcomeVideoUrl?: string } | null;
};

export interface AuthRepository {
  /** Real backend age + 48h device/IP-block check. Throws (via the request's own error) if underage or currently blocked. Not every role's flow calls this. */
  checkAge(birthYear: number): Promise<void>;
  register(input: RegisterInput): Promise<RegisterResult>;
  login(input: LoginInput): Promise<LoginResult>;
  /** Completes a login that returned `otp_required`. */
  verifyOtp(code: string): Promise<AuthSession>;
  /**
   * Exchanges a Google identity for a RAPEX session -- single-phase, no OTP
   * (Google already verified the email). New accounts are created
   * automatically; call `getNextStep()` after this to find out whether
   * profile setup is still required. Takes pre-parsed profile fields
   * (decoded from the Google ID token client-side), not the raw token --
   * matches Xano's real `/auth/google` contract (2026-08-21 build).
   */
  loginWithGoogle(profile: GoogleProfileInput): Promise<AuthSession>;
  requestPasswordReset(identifier: string): Promise<void>;
  getCurrentUser(): Promise<AuthUser | null>;
  /** The onboarding "navigation brain". Null when there's no authenticated session to ask about. Untouched by the addition of getAuthMe()/acknowledgeWelcome() below -- same 3 existing callers, same behavior. */
  getNextStep(): Promise<NextStep | null>;
  /** Richer `/auth/me` read -- see AuthMeResponse. Requires a session; null if there's none (mirrors getNextStep()'s own no-session behavior), never guesses. */
  getAuthMe(): Promise<AuthMeResponse | null>;
  /**
   * `POST /acknowledge-welcome` -- requires a session (Xano-confirmed).
   * Only call this from an authenticated Welcome experience; a newly
   * registered `pending_verification` account has no token yet and must
   * NOT call this (see WelcomeVideoScreen's two-path split). Returns the
   * real `next_step` Xano hands back so the caller navigates off Xano's
   * own answer instead of assuming Profile Setup.
   */
  acknowledgeWelcome(): Promise<NextStep | null>;
  logout(): Promise<void>;
}
