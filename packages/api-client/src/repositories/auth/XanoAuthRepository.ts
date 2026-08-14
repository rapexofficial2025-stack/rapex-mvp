import type { HttpClient } from "../../core/httpClient";
import type { UserCache } from "../../core/userCache";
import type { TokenStorage } from "../../core/tokenStorage";
import type { AuthMeResponse, AuthRepository, LoginInput, LoginResult, NextStep, RegisterInput, RegisterResult } from "./AuthRepository";
import type { AuthSession, AuthUser } from "../types";

/**
 * Real Xano-backed AuthRepository for the RAPEX Master Authentication Suite
 * (Xano `rapex-auth` group, confirmed 2026-08-13 -- supersedes the older
 * signup/login pair this class used before, which the backend has since
 * removed as duplicates):
 *
 *   POST /pre-auth/check-age       { birth_year }                       -> throws "Device Blocked" / "You must be 18+..." on failure
 *   POST /auth/signup              { email, password, role, first_name,
 *                                    last_name, mobile, date_of_birth,
 *                                    region_id, province_id,
 *                                    municipality_id, barangay_id,
 *                                    address_line_1 }                   -> { user_id, account_status: "pending_verification" } (+ a wallet row; no session -- needs Admin approval before login works)
 *   POST /auth/login               { email, password }                  -> sends a 6-digit code to the account's email; no session yet
 *   POST /verify-otp               { code }             (Bearer)        -> { authToken } -- the real session
 *   GET  /reset/request-reset-link ?identifier=<email|mobile|full_name>  -> emails a reset link to the matched account
 *   GET  /auth/me                                       (Bearer)        -> { next_step }
 *
 * ASSUMPTION flagged for Xano confirmation: `/auth/login`'s response shape
 * wasn't given explicitly, but `/verify-otp` resolves `$auth.id` from a
 * Bearer token, so login() must issue *some* token for that to work. This
 * treats login()'s response as `{ authToken }` -- an interim/pending token,
 * stored only in-memory (never written to the real token slot) purely so
 * the very next verify-otp call can carry it as Bearer. If Xano's actual
 * field name differs, only the one line marked below needs to change.
 *
 * Known gap (reported, not guessed around): no confirmed region/province/
 * municipality/barangay ID lookup exists in this codebase (see
 * RegisterInput's doc comment) -- those fields are sent only when present,
 * and registration may be rejected by Xano until that's wired for real.
 */
export class XanoAuthRepository implements AuthRepository {
  private readonly client: HttpClient;
  private readonly tokenStorage: TokenStorage;
  private readonly userCache: UserCache;
  private readonly role: AuthUser["role"];
  /** In-memory only -- bridges login() -> verifyOtp() within the same app session. Never persisted. */
  private pendingOtpToken: string | null = null;
  private pendingLoginEmail: string | null = null;

  constructor(client: HttpClient, tokenStorage: TokenStorage, userCache: UserCache, role: AuthUser["role"]) {
    this.client = client;
    this.tokenStorage = tokenStorage;
    this.userCache = userCache;
    this.role = role;
  }

  async checkAge(birthYear: number): Promise<void> {
    await this.client.request({ path: "/pre-auth/check-age", method: "POST", body: { birth_year: birthYear } });
  }

  async register(input: RegisterInput): Promise<RegisterResult> {
    const result = await this.client.request<{ user_id?: number | string; account_status?: string }>({
      path: "/auth/signup",
      method: "POST",
      body: {
        email: input.email,
        password: input.password,
        role: input.role,
        first_name: input.firstName,
        last_name: input.lastName,
        mobile: input.mobile,
        date_of_birth: input.dateOfBirth,
        region_id: input.regionId,
        province_id: input.provinceId,
        municipality_id: input.municipalityId,
        barangay_id: input.barangayId,
        address_line_1: input.addressLine1,
      },
    });
    return {
      userId: String(result.user_id ?? ""),
      accountStatus: result.account_status ?? "pending_verification",
    };
  }

  /** Validates the password and triggers the email OTP -- does not return a session (see class doc comment). */
  async login(input: LoginInput): Promise<LoginResult> {
    await this.userCache.clearUser();
    const result = await this.client.request<{ authToken?: string }>({
      path: "/auth/login",
      method: "POST",
      body: { email: input.email, password: input.password },
    });
    // See class doc comment's ASSUMPTION note -- confirm this field name with Xano.
    this.pendingOtpToken = result?.authToken ?? null;
    this.pendingLoginEmail = input.email;
    return { status: "otp_required" };
  }

  async verifyOtp(code: string): Promise<AuthSession> {
    if (!this.pendingOtpToken) {
      throw new Error("No login in progress -- log in again before entering the verification code.");
    }
    const previousToken = this.pendingOtpToken;
    // Bearer-authed with the pending token so Xano's $auth.id resolves to the right account.
    await this.tokenStorage.setToken(previousToken);
    const result = await this.client.request<{ authToken?: string }>({
      path: "/verify-otp",
      method: "POST",
      body: { code },
    });

    const finalToken = result?.authToken ?? previousToken;
    await this.tokenStorage.setToken(finalToken);

    const previouslyCached = await this.userCache.getUser();
    const user: AuthUser = {
      id: previouslyCached?.email === this.pendingLoginEmail ? previouslyCached.id : "",
      rapexId: previouslyCached?.email === this.pendingLoginEmail ? previouslyCached.rapexId : undefined,
      name: previouslyCached?.email === this.pendingLoginEmail ? previouslyCached.name : "",
      email: this.pendingLoginEmail ?? "",
      phone: previouslyCached?.email === this.pendingLoginEmail ? previouslyCached.phone : "",
      role: this.role,
    };
    await this.userCache.setUser(user);
    this.pendingOtpToken = null;
    this.pendingLoginEmail = null;
    return { user, token: finalToken };
  }

  /**
   * POST /auth/google { id_token } -- single-phase, real session
   * immediately (Google already verified the email). Response shape
   * assumed to mirror verify-otp's ({ authToken }, optionally { user }) --
   * not explicitly confirmed by Xano; flag for confirmation once real
   * Google credentials exist and this can be tested end-to-end.
   */
  async loginWithGoogle(idToken: string): Promise<AuthSession> {
    const result = await this.client.request<{
      authToken?: string;
      user?: { id?: number | string; rapex_id?: string; first_name?: string; last_name?: string; email?: string; mobile?: string };
    }>({
      path: "/auth/google",
      method: "POST",
      body: { id_token: idToken },
    });

    if (!result?.authToken) {
      throw new Error("Xano did not return an auth token for Google sign-in.");
    }
    await this.tokenStorage.setToken(result.authToken);

    const remoteUser = result.user;
    const previouslyCached = await this.userCache.getUser();
    const email = remoteUser?.email ?? previouslyCached?.email ?? "";
    const user: AuthUser = {
      id: String(remoteUser?.id ?? previouslyCached?.id ?? ""),
      rapexId: remoteUser?.rapex_id ?? previouslyCached?.rapexId,
      name: remoteUser ? `${remoteUser.first_name ?? ""} ${remoteUser.last_name ?? ""}`.trim() : previouslyCached?.name ?? "",
      email,
      phone: remoteUser?.mobile ?? previouslyCached?.phone ?? "",
      role: this.role,
    };
    await this.userCache.setUser(user);
    return { user, token: result.authToken };
  }

  async requestPasswordReset(identifier: string): Promise<void> {
    await this.client.request({ path: "/reset/request-reset-link", method: "GET", query: { identifier } });
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const token = await this.tokenStorage.getToken();
    if (!token) return null;
    return this.userCache.getUser();
  }

  /** Response shape beyond `next_step` isn't confirmed -- doesn't overwrite the cached AuthUser. */
  async getNextStep(): Promise<NextStep | null> {
    const token = await this.tokenStorage.getToken();
    if (!token) return null;
    const result = await this.client.request<{ next_step?: NextStep }>({ path: "/auth/me", method: "GET" });
    return result?.next_step ?? null;
  }

  /**
   * Real `GET /auth/me` read -- requires a session (2026-08-14 Xano
   * confirmation). See AuthMeResponse's doc comment for why
   * registrationProgress/profileChecklist/branding are passed through
   * `unknown` rather than a guessed shape.
   */
  async getAuthMe(): Promise<AuthMeResponse | null> {
    const token = await this.tokenStorage.getToken();
    if (!token) return null;
    const result = await this.client.request<{
      next_step?: NextStep;
      welcome_seen?: boolean;
      registration_progress?: unknown;
      profile_checklist?: unknown;
      branding?: unknown;
    }>({ path: "/auth/me", method: "GET" });
    return {
      nextStep: result?.next_step ?? null,
      welcomeSeen: result?.welcome_seen ?? false,
      registrationProgress: result?.registration_progress,
      profileChecklist: result?.profile_checklist,
      branding: result?.branding,
    };
  }

  /**
   * Real `POST /acknowledge-welcome` -- requires a session (2026-08-14
   * Xano confirmation: `welcome_seen = true`, `next_step = "PROFILE_SETUP"`).
   * Returns null instead of calling the endpoint when there's no session,
   * same guard `getNextStep()` already uses -- a `pending_verification`
   * account (no token yet) must never reach this call in the first place
   * (see WelcomeVideoScreen), but this stays defensive either way.
   */
  async acknowledgeWelcome(): Promise<NextStep | null> {
    const token = await this.tokenStorage.getToken();
    if (!token) return null;
    const result = await this.client.request<{ next_step?: NextStep; welcome_seen?: boolean }>({
      path: "/acknowledge-welcome",
      method: "POST",
    });
    return result?.next_step ?? null;
  }

  async logout(): Promise<void> {
    this.pendingOtpToken = null;
    this.pendingLoginEmail = null;
    await this.tokenStorage.clearToken();
    await this.userCache.clearUser();
  }
}
