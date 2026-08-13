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

export interface AuthRepository {
  /** Real backend age + 48h device/IP-block check. Throws (via the request's own error) if underage or currently blocked. Not every role's flow calls this. */
  checkAge(birthYear: number): Promise<void>;
  register(input: RegisterInput): Promise<RegisterResult>;
  login(input: LoginInput): Promise<LoginResult>;
  /** Completes a login that returned `otp_required`. */
  verifyOtp(code: string): Promise<AuthSession>;
  /**
   * Exchanges a real Google ID token for a RAPEX session -- single-phase,
   * no OTP (Google already verified the email). New accounts are created
   * automatically; call `getNextStep()` after this to find out whether
   * profile setup is still required.
   */
  loginWithGoogle(idToken: string): Promise<AuthSession>;
  requestPasswordReset(identifier: string): Promise<void>;
  getCurrentUser(): Promise<AuthUser | null>;
  /** The onboarding "navigation brain". Null when there's no authenticated session to ask about. */
  getNextStep(): Promise<NextStep | null>;
  logout(): Promise<void>;
}
