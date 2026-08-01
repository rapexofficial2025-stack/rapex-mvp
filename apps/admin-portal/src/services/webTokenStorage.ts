import type { TokenStorage } from "@rapex/api-client";

const TOKEN_KEY = "rapex_auth_token";

export const webTokenStorage: TokenStorage = {
  async getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
  async setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  async clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },
};
