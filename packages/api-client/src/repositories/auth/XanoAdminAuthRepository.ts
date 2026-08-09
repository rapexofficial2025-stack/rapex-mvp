import type { HttpClient } from "../../core/httpClient";
import type { UserCache } from "../../core/userCache";
import type { TokenStorage } from "../../core/tokenStorage";
import type { AuthRepository, LoginInput, RegisterInput } from "./AuthRepository";
import type { AuthSession, AuthUser } from "../types";

/**
 * Real Xano-backed AuthRepository for the Admin Portal only.
 *
 * Admin login lives in a *different* Xano API group than customer/merchant
 * auth: confirmed via live OpenAPI spec fetch to be `super_app`'s
 * `POST /login` (not `rapex-auth`'s `POST /auth/login`, and not under
 * `admin-master-data`). Same Xano instance, same Bearer token scheme, just a
 * different `api:{group}` base path -- see apiConfig.ts's `rapexAuthHttpClient`.
 *
 *   POST /login   { email, password }   -> { authToken }
 *
 * Known gap (reported, not guessed around): the confirmed response carries no
 * user_id, rapex_id, name, or role -- there is no documented admin "/me"
 * endpoint yet. AuthUser.role is fixed to whatever this instance is
 * constructed with (Standard Admin by default), matching every other app's
 * "role is fixed per app instance" convention. This does NOT drive the
 * Super Admin vs Standard Admin distinction shown in the Engine Center --
 * that comes from AdminRepository.getCurrentAdmin(), which stays Mock until
 * a real "who is this admin" endpoint is confirmed.
 *
 * Admins are provisioned by other admins (see Engine Center's "Manage Admin
 * Access"), not self-registered through this portal -- there is no
 * signup/OTP screen in admin-portal, so register()/requestOtp()/verifyOtp()
 * intentionally throw rather than guess at an unconfirmed endpoint.
 */
export class XanoAdminAuthRepository implements AuthRepository {
  private readonly client: HttpClient;
  private readonly tokenStorage: TokenStorage;
  private readonly userCache: UserCache;
  private readonly role: AuthUser["role"];

  constructor(client: HttpClient, tokenStorage: TokenStorage, userCache: UserCache, role: AuthUser["role"] = "admin") {
    this.client = client;
    this.tokenStorage = tokenStorage;
    this.userCache = userCache;
    this.role = role;
  }

  async login(input: LoginInput): Promise<AuthSession> {
    const result = await this.client.request<{ authToken?: string }>({
      path: "/login",
      method: "POST",
      body: { email: input.email, password: input.password },
    });

    if (!result?.authToken) {
      throw new Error("Xano did not return an auth token for this login.");
    }

    await this.tokenStorage.setToken(result.authToken);
    // No user_id/name/role in the confirmed response -- reuse a previously
    // cached profile for this same email if one exists, else leave blank
    // rather than invent data.
    const previouslyCached = await this.userCache.getUser();
    const user: AuthUser = {
      id: previouslyCached?.email === input.email ? previouslyCached.id : "",
      rapexId: previouslyCached?.email === input.email ? previouslyCached.rapexId : undefined,
      name: previouslyCached?.email === input.email ? previouslyCached.name : "",
      email: input.email,
      phone: previouslyCached?.email === input.email ? previouslyCached.phone : "",
      role: this.role,
    };
    await this.userCache.setUser(user);
    return { user, token: result.authToken };
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

  async register(_input: RegisterInput): Promise<AuthSession> {
    throw new Error("Admin accounts are provisioned by other admins (Engine Center → Manage Admin Access), not self-registered.");
  }

  async requestOtp(_destination: string): Promise<void> {
    throw new Error("No OTP flow exists for admin login -- there is no confirmed Xano endpoint for it.");
  }

  async verifyOtp(_destination: string, _code: string): Promise<AuthSession> {
    throw new Error("No OTP flow exists for admin login -- there is no confirmed Xano endpoint for it.");
  }
}
