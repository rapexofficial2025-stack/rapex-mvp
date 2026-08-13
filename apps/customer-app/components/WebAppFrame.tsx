import type { ReactNode } from "react";
import { Platform, View } from "react-native";

const PHONE_MAX_WIDTH = 480;

/**
 * Web-only responsive shell. Expo Web's default HTML/CSS reset only sets
 * `height: 100%` up the html/body/#root chain, not width, so on desktop the
 * mobile UI ends up pinned to its own intrinsic width on the left with blank
 * space filling the rest of the browser instead of centering.
 *
 * This wraps the app (unchanged) in a full-viewport row that centers it and
 * caps it at a phone-like max width on wide viewports, and clips anything
 * that would otherwise overflow horizontally. On native, and on narrow/mobile
 * web viewports (<= PHONE_MAX_WIDTH), this renders as a no-op passthrough --
 * the existing mobile layout is untouched.
 */
export function WebAppFrame({ children }: { children: ReactNode }) {
  if (Platform.OS !== "web") {
    return <>{children}</>;
  }

  return (
    <View style={{ flex: 1, width: "100%", minHeight: "100vh" as unknown as number, alignItems: "center", backgroundColor: "#FFFFFF" }}>
      <View style={{ width: "100%", maxWidth: PHONE_MAX_WIDTH, minHeight: "100vh" as unknown as number, overflow: "hidden" }}>
        {children}
      </View>
    </View>
  );
}
