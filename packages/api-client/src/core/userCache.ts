import type { AuthUser } from "../repositories/types";

/**
 * Xano's auth endpoints (signup/login) return only { authToken, user_id } --
 * no name/phone/role. The full AuthUser shape our screens expect is cached
 * locally at register/login time (constructed from what we already have:
 * the input the user typed + the returned user_id) so getCurrentUser() can
 * work without inventing an unconfirmed "/auth/me" endpoint. Platform-
 * specific storage lives in each app, same split as TokenStorage.
 */
export interface UserCache {
  getUser(): Promise<AuthUser | null>;
  setUser(user: AuthUser): Promise<void>;
  clearUser(): Promise<void>;
}

/** In-memory fallback -- useful for tests, or an app that hasn't wired real storage yet. */
export class InMemoryUserCache implements UserCache {
  private user: AuthUser | null = null;

  async getUser(): Promise<AuthUser | null> {
    return this.user;
  }

  async setUser(user: AuthUser): Promise<void> {
    this.user = user;
  }

  async clearUser(): Promise<void> {
    this.user = null;
  }
}
