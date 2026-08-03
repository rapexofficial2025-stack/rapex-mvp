import type { AuthUser, UserCache } from "@rapex/api-client";

const USER_KEY = "rapex_auth_user";

export const webUserCache: UserCache = {
  async getUser() {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },
  async setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  async clearUser() {
    localStorage.removeItem(USER_KEY);
  },
};
