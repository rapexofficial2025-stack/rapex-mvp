import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

/**
 * Push notification infrastructure only -- device permission, channel
 * setup, and tap-routing. Deliberately NOT connected to Xano: there is no
 * confirmed endpoint yet to register a device's push token against, so
 * this stops at "the app has a real token" rather than guessing where to
 * send it (see registerForPushNotificationsAsync's return value). Once a
 * real endpoint exists, the only change needed is a single upload call
 * using the token this already gets -- everything else (permission flow,
 * Android channel, foreground display behavior, tap routing) needs no
 * rework.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type NotificationTapData = Record<string, unknown>;

/**
 * Requests permission (no-op if already granted/denied) and returns a real
 * Expo push token, or null if permission was denied, this is a simulator
 * (push doesn't work there), or no EAS project ID is configured yet
 * (`eas init` hasn't been run against a real Expo account -- see
 * docs/deployment/README.md). Never throws -- a missing push token is a
 * real, expected state this app must keep working without, not an error.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#8B5CF6",
    });
  }

  if (!Device.isDevice) {
    return null;
  }

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== "granted") {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  if (status !== "granted") return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    if (__DEV__) console.warn("Push notifications: no EAS project ID configured yet -- run `eas init` first.");
    return null;
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token.data;
  } catch (error) {
    if (__DEV__) console.warn("Push notifications: failed to get a push token.", error);
    return null;
  }
}

/** Fires when the user taps a notification (foreground, background, or cold-start). Returns an unsubscribe function. */
export function addNotificationResponseListener(onTap: (data: NotificationTapData) => void): () => void {
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    onTap((response.notification.request.content.data as NotificationTapData) ?? {});
  });
  return () => subscription.remove();
}
