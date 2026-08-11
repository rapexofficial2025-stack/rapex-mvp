import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";

/**
 * Shared hit-area data + floating-reference modal for the two-stage login
 * flow (WelcomeScreen = Login1, LoginScreen = Login2). Both real background
 * images (login-dark-1.png, login-dark-2.png) already have the top icon row
 * (Chat/FB Page/FAQ) and the 5 category hexagons drawn into the artwork --
 * this file only supplies the invisible tap regions layered on top, plus
 * what happens when each is tapped.
 *
 * Rect percentages are a close visual estimate against the real 853x1844
 * assets, not a pixel measurement (no image-measurement tool available in
 * this environment) -- Login1 and Login2 place these rows at different
 * heights (Login1's hexagons sit low, after the tagline; Login2's sit
 * compact at the very top, above the login form) so each screen has its own
 * rect set. Nudge individual `topPct`/`leftPct`/etc values here if a hit
 * area feels off-icon on a real device -- everything else stays unchanged.
 */

export type FloatingKey = "chat" | "fbpage" | "faq" | "stores" | "community" | "food" | "serviceProvider" | "auction";

type Rect = { topPct: number; leftPct: number; widthPct: number; heightPct: number };
type HotspotDef = { key: FloatingKey; label: string; rect: Rect };

export const TOP_ICON_HOTSPOTS: Record<"login1" | "login2", HotspotDef[]> = {
  login1: [
    { key: "chat", label: "Chat with support", rect: { topPct: 11.6, leftPct: 4, widthPct: 29, heightPct: 5.8 } },
    { key: "fbpage", label: "RAPEX Facebook Page", rect: { topPct: 11.6, leftPct: 35.3, widthPct: 29, heightPct: 5.8 } },
    { key: "faq", label: "Frequently Asked Questions", rect: { topPct: 11.6, leftPct: 66.7, widthPct: 29, heightPct: 5.8 } },
  ],
  login2: [
    { key: "chat", label: "Chat with support", rect: { topPct: 4.2, leftPct: 4, widthPct: 29, heightPct: 5.5 } },
    { key: "fbpage", label: "RAPEX Facebook Page", rect: { topPct: 4.2, leftPct: 35.3, widthPct: 29, heightPct: 5.5 } },
    { key: "faq", label: "Frequently Asked Questions", rect: { topPct: 4.2, leftPct: 66.7, widthPct: 29, heightPct: 5.5 } },
  ],
};

export const CATEGORY_HOTSPOTS: Record<"login1" | "login2", HotspotDef[]> = {
  login1: [
    { key: "stores", label: "Stores", rect: { topPct: 65, leftPct: 3, widthPct: 17.5, heightPct: 12 } },
    { key: "community", label: "Community", rect: { topPct: 65, leftPct: 21, widthPct: 17.5, heightPct: 12 } },
    { key: "food", label: "Food", rect: { topPct: 65, leftPct: 39, widthPct: 17.5, heightPct: 12 } },
    { key: "serviceProvider", label: "Service Provider", rect: { topPct: 65, leftPct: 57, widthPct: 17.5, heightPct: 12 } },
    { key: "auction", label: "Auction", rect: { topPct: 65, leftPct: 75, widthPct: 17.5, heightPct: 12 } },
  ],
  login2: [
    { key: "stores", label: "Stores", rect: { topPct: 10.5, leftPct: 3, widthPct: 17.5, heightPct: 9 } },
    { key: "community", label: "Community", rect: { topPct: 10.5, leftPct: 21, widthPct: 17.5, heightPct: 9 } },
    { key: "food", label: "Food", rect: { topPct: 10.5, leftPct: 39, widthPct: 17.5, heightPct: 9 } },
    { key: "serviceProvider", label: "Service Provider", rect: { topPct: 10.5, leftPct: 57, widthPct: 17.5, heightPct: 9 } },
    { key: "auction", label: "Auction", rect: { topPct: 10.5, leftPct: 75, widthPct: 17.5, heightPct: 9 } },
  ],
};

/**
 * Only 4 of the 5 categories have an existing real reference image
 * (reused from the previous 4-category version of this screen) -- Community
 * has none yet, so its modal shows a plain "coming soon" placeholder instead
 * of inventing or approximating an image. Chat/FB Page/FAQ have no floating
 * image at all yet (per the founder's own note: "Floating image that i will
 * paste later") -- same honest placeholder until those are supplied.
 */
const FLOATING_IMAGES: Partial<Record<FloatingKey, number>> = {
  stores: require("../../../assets/images/reference/Login-marketplace.png"),
  food: require("../../../assets/images/reference/login-info-food.png"),
  serviceProvider: require("../../../assets/images/reference/login-services-info.png"),
  auction: require("../../../assets/images/reference/login-auction.png"),
};

const FLOATING_LABELS: Record<FloatingKey, string> = {
  chat: "Chat",
  fbpage: "Facebook Page",
  faq: "FAQ",
  stores: "Stores",
  community: "Community",
  food: "Food",
  serviceProvider: "Service Provider",
  auction: "Auction",
};

export function FloatingReferenceModal({ activeKey, onClose }: { activeKey: FloatingKey | null; onClose: () => void }) {
  const image = activeKey ? FLOATING_IMAGES[activeKey] : undefined;

  return (
    <Modal visible={activeKey != null} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.panel}>
          <Pressable style={styles.close} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close">
            <Text style={styles.closeText}>{"✕"}</Text>
          </Pressable>
          {image ? (
            <Image source={image} style={styles.image} resizeMode="contain" />
          ) : (
            <View style={styles.placeholderWrap}>
              <Text style={styles.placeholderTitle}>{activeKey ? FLOATING_LABELS[activeKey] : ""}</Text>
              <Text style={styles.placeholderText}>Coming soon</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)" },
  panel: {
    position: "absolute",
    top: 10,
    bottom: 5,
    left: 5,
    right: 5,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#0B0713",
  },
  close: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  closeText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  image: { width: "100%", height: "100%" },
  placeholderWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  placeholderTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
  placeholderText: { color: "rgba(255,255,255,0.6)", fontSize: 13 },
});
