import type { HttpClient } from "../../core/httpClient";
import type { UserCache } from "../../core/userCache";
import type { TokenStorage } from "../../core/tokenStorage";
import type { AuthRepository, LoginInput, RegisterInput } from "./AuthRepository";
import type { AuthSession, AuthUser } from "../types";

/**
 * Real Xano-backed AuthRepository, wired exactly to the frozen contract
 * (handed over 2026-08-03, base https://x8ki-letl-twmt.n7.xano.io/api:rapex-auth/):
 *
 *   POST /auth/signup        { name, email, password }        -> { authToken, user_id }
 *   POST /verify-otp         { code }            (Bearer)      -> { success, data: { verification_progress } }
 *   POST /verify/send-code   {}                  (Bearer)      -> { success, message }
 *   POST /auth/login         { email, password }               -> { authToken, user_id }
 *
 * Known gap (reported, not guessed around): signup/login return no name,
 * phone, or role -- there is no documented "/auth/me" endpoint yet. AuthUser
 * is reconstructed locally from what the caller already provided (register
 * input) or from what's cached from a prior register/login (login input
 * only has email, so name/phone stay blank until a real profile endpoint
 * exists). `role` is fixed per app instance (e.g. customer-app always
 * passes "customer") since Xano's role scoping is presumed to follow the
 * X-RAPEX-App header, matching this client's existing convention.
 */
export class XanoAuthRepository implements AuthRepository {
  private readonly client: HttpClient;
  private readonly tokenStorage: TokenStorage;
  private readonly userCache: UserCache;
  private readonly role: AuthUser["role"];

  constructor(client: HttpClient, tokenStorage: TokenStorage, userCache: UserCache, role: AuthUser["role"]) {
    this.client = client;
    this.tokenStorage = tokenStorage;
    this.userCache = userCache;
    this.role = role;
  }

  async register(input: RegisterInput): Promise<AuthSession> {
    const result = await this.client.request<{
      authToken: string;
      user_id?: number | string;
      rapex_id?: string;
    }>({
      path: "/auth/signup",
      method: "POST",
      body: { name: input.name, email: input.email, password: input.password },
    });

    await this.tokenStorage.setToken(result.authToken);
    // Per the Hybrid Identity Architecture decision (2026-08-04): `id` is the
    // internal DB primary key used for all further API calls, `rapexId` is
    // the branded display ID. Some signup variants only return rapex_id and
    // no separate internal id yet -- fall back to it so `id` is never empty,
    // but this is a known gap to close once every signup path returns both.
    const user: AuthUser = {
      id: String(result.user_id ?? result.rapex_id ?? ""),
      rapexId: result.rapex_id,
      name: input.name,
      email: input.email,
      phone: input.phone,
      role: this.role,
    };
    await this.userCache.setUser(user);
    return { user, token: result.authToken };
  }

  async login(input: LoginInput): Promise<AuthSession> {
    const result = await this.client.request<{
      authToken: string;
      user_id?: number | string;
      rapex_id?: string;
    }>({
      path: "/auth/login",
      method: "POST",
      body: { email: input.email, password: input.password },
    });

    await this.tokenStorage.setToken(result.authToken);
    // Xano's login response has no name/phone -- reuse a previously cached
    // profile for this same account if one exists, else leave blank rather
    // than invent data.
    const previouslyCached = await this.userCache.getUser();
    const user: AuthUser = {
      id: String(result.user_id ?? previouslyCached?.id ?? ""),
      rapexId: result.rapex_id ?? previouslyCached?.rapexId,
      name: previouslyCached?.email === input.email ? previouslyCached.name : "",
      email: input.email,
      phone: previouslyCached?.email === input.email ? previouslyCached.phone : "",
      role: this.role,
    };
    await this.userCache.setUser(user);
    return { user, token: result.authToken };
  }

  /** Xano's /verify/send-code takes no destination -- it re-sends to whichever contact the Bearer-authed account already has on file. */
  async requestOtp(_destination: string): Promise<void> {
    await this.client.request({ path: "/verify/send-code", method: "POST", body: {} });
  }

  /** Xano's /verify-otp is Bearer-authed (token set at register() time) -- destination is not a separate parameter. */
  async verifyOtp(_destination: string, code: string): Promise<AuthSession> {
    await this.client.request({ path: "/verify-otp", method: "POST", body: { code } });
    const token = await this.tokenStorage.getToken();
    const user = await this.userCache.getUser();
    if (!token || !user) {
      throw new Error("No session found -- register or log in before verifying an OTP.");
    }
    return { user, token };
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const token = await this.tokenStorage.getToken();
    if (!token) return null;
    return this.userCache.getUser();
  }

  async logout(): Promise<void> {
    await this.tokenStorage.clearToken();
    await this.userCache.clearUser();
  }
}
