import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import type { TokenStorage } from "@rapex/api-client";

const TOKEN_KEY = "rapex_rider_auth_token";

/**
 * expo-secure-store has no web implementation (throws if called there).
 * Since this app also runs via `expo start --web` for development, fall
 * back to localStorage on web -- SecureStore is used on native builds.
 * Same pattern as customer-app's secureTokenStorage.ts.
 */
export const secureTokenStorage: TokenStorage = {
  async getToken() {
    if (Platform.OS === "web") {
      return typeof localStorage !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    }
    return SecureStore.getItemAsync(TOKEN_KEY);
  },

  async setToken(token) {
    if (Platform.OS === "web") {
      if (typeof localStorage !== "undefined") localStorage.setItem(TOKEN_KEY, token);
      return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async clearToken() {
    if (Platform.OS === "web") {
      if (typeof localStorage !== "undefined") localStorage.removeItem(TOKEN_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};
