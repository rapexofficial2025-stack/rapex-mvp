import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Persists across app restarts (unlike registrationStore.ts, which is
 * session-only) -- per spec: "Do not replay Welcome MP4 after welcome_seen
 * is true." Keyed by user id so a device shared between two accounts (or a
 * logout/login with a different account) doesn't skip a new user's welcome.
 */
function storageKey(userId: string): string {
  return `rapex_welcome_seen_${userId}`;
}

export async function getWelcomeSeen(userId: string): Promise<boolean> {
  const raw = await AsyncStorage.getItem(storageKey(userId));
  return raw === "true";
}

export async function setWelcomeSeen(userId: string): Promise<void> {
  await AsyncStorage.setItem(storageKey(userId), "true");
}
