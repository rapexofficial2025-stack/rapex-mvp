import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import type { AuthUser, UserCache } from "@rapex/api-client";

const USER_KEY = "rapex_rider_auth_user";

/** Same web/native split as secureTokenStorage -- SecureStore has no web implementation. */
export const secureUserCache: UserCache = {
  async getUser() {
    const raw =
      Platform.OS === "web"
        ? typeof localStorage !== "undefined"
          ? localStorage.getItem(USER_KEY)
          : null
        : await SecureStore.getItemAsync(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  async setUser(user) {
    const raw = JSON.stringify(user);
    if (Platform.OS === "web") {
      if (typeof localStorage !== "undefined") localStorage.setItem(USER_KEY, raw);
      return;
    }
    await SecureStore.setItemAsync(USER_KEY, raw);
  },

  async clearUser() {
    if (Platform.OS === "web") {
      if (typeof localStorage !== "undefined") localStorage.removeItem(USER_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(USER_KEY);
  },
};
