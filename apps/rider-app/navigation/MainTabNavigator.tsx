import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { createBottomTabNavigator, type BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Home, Package, Power, User, Wallet as WalletIcon } from "lucide-react-native";
import { useAsyncAction, useRepositories, useRiderProfile } from "@rapex/api-client";
import { FlashCardIntro } from "@rapex/ui-native";
import type { MainTabParamList } from "../types/navigation";
import { HomeScreen } from "../screens/HomeScreen";
import { EarningsScreen } from "../screens/EarningsScreen";
import { WalletScreen } from "../screens/WalletScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { addNotificationResponseListener, registerForPushNotificationsAsync } from "../services/notifications";
import { consumePreviewIntro } from "../services/previewIntro";
import { FLASHCARD_INTRO_IMAGES } from "../services/flashcardAssets";

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Custom tab bar so the floating "Go Offline"/"Go Online" center button
 * (per the reference design) can sit ABOVE the bar and directly toggle the
 * rider's real availability status -- the same real action HomeScreen's own
 * toggle uses (rider.setAvailabilityStatus), not a separate/fake control.
 */
function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const { rider } = useRepositories();
  const { data: profile, refetch } = useRiderProfile();
  const toggleOnline = useAsyncAction((next: boolean) => rider!.setAvailabilityStatus(next ? "online" : "offline"));
  const isOnline = profile?.availabilityStatus === "online";

  // "Orders" label maps onto the existing "Earnings" route (delivery history lives there) --
  // no separate Orders screen/route exists yet, avoided adding one to keep this change scoped.
  const tabs: { key: keyof MainTabParamList; label: string; icon: typeof Home }[] = [
    { key: "Home", label: "Home", icon: Home },
    { key: "Earnings", label: "Orders", icon: Package },
  ];
  const rightTabs: { key: keyof MainTabParamList; label: string; icon: typeof Home }[] = [
    { key: "Wallet", label: "Wallet", icon: WalletIcon },
    { key: "Profile", label: "Profile", icon: User },
  ];

  const renderTab = (tab: { key: keyof MainTabParamList; label: string; icon: typeof Home }) => {
    const routeIndex = state.routes.findIndex((r) => r.name === tab.key);
    const focused = state.index === routeIndex;
    const color = focused ? "#D8B4FE" : "rgba(255,255,255,0.55)";
    return (
      <Pressable key={tab.key} style={styles.tab} onPress={() => navigation.navigate(tab.key)}>
        <View style={[styles.tabPill, focused && styles.tabPillActive]}>
          <tab.icon color={focused ? "#FFFFFF" : color} size={20} />
          <Text style={{ color: focused ? "#FFFFFF" : color, fontSize: 11, fontWeight: "600", marginTop: 3 }}>{tab.label}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.wrap}>
      {/* Black glass pill with a violet glow ring -- matches the reference nav texture exactly (same
          recipe used for the "Go Offline" center button below): dark fill + soft outer purple shadow
          + a thin bright violet border standing in for the inner glow, since RN shadows are outer-only. */}
      <View style={styles.glassBar}>
        <LinearGradient
          colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.barTopHighlight}
          pointerEvents="none"
        />
        <SafeAreaView edges={["bottom"]}>
          <View style={styles.tabRow}>
            {tabs.map(renderTab)}
            <View style={styles.centerSpacer} />
            {rightTabs.map(renderTab)}
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.centerButtonWrap}>
        <Pressable
          onPress={async () => {
            await toggleOnline.execute(!isOnline);
            refetch();
          }}
          disabled={toggleOnline.loading}
          style={[styles.centerButtonGlow, isOnline && styles.centerButtonGlowActive]}
        >
          <LinearGradient
            colors={isOnline ? ["#3B1450", "#1A0B2E"] : ["#2E1065", "#150826"]}
            style={styles.centerButton}
          >
            <Power color="#F5EEFF" size={24} />
          </LinearGradient>
        </Pressable>
        <Text style={styles.centerLabel}>{isOnline ? "Go Offline" : "Go Online"}</Text>
      </View>
    </View>
  );
}

export function MainTabNavigator() {
  // Runs once the rider actually has the app open (not at cold splash) --
  // requests notification permission and gets a real Expo push token if
  // possible. Not uploaded anywhere: no confirmed Xano endpoint exists yet
  // to register a device token against (e.g. for new-delivery alerts). Tap
  // routing is a real, working listener, but doesn't dispatch to specific
  // screens yet -- there are no real notification types defined by the
  // backend/product yet to route.
  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token && __DEV__) console.log("Expo push token:", token);
    });
    return addNotificationResponseListener((data) => {
      if (__DEV__) console.log("Notification tapped:", data);
    });
  }, []);

  // Set once by LoginScreen's "Preview App" button -- read exactly once
  // here (MainTabNavigator remounts fresh each time Login replaces into
  // MainTabs), never re-triggered by normal tab navigation afterward.
  const [showFlashIntro, setShowFlashIntro] = useState(() => consumePreviewIntro());

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <CustomTabBar {...props} />}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Earnings" component={EarningsScreen} />
        <Tab.Screen name="Wallet" component={WalletScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
      {showFlashIntro ? <FlashCardIntro images={FLASHCARD_INTRO_IMAGES} onFinish={() => setShowFlashIntro(false)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 14,
    paddingBottom: 6,
  },
  // Black glass pill -- dark fill, thin bright-violet stroke, soft violet outer
  // glow (shadow), matching every row of the reference sheet.
  glassBar: {
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: "#150C24",
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.55)",
    shadowColor: "#A855F7",
    shadowOpacity: 0.55,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 14,
  },
  barTopHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "55%",
  },
  // Absolutely positioned over the FULL bar width (not the tabRow's flex
  // slots) so it's centered on the pill itself regardless of how many tabs
  // sit on each side -- the tabRow's own center spacer lines up with this
  // by construction (equal tab counts left/right), but this is what actually
  // pins the button dead-center.
  centerButtonWrap: {
    position: "absolute",
    top: -28,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  centerLabel: {
    color: "#C4A6F5",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3,
  },
  centerButtonGlow: {
    borderRadius: 34,
    padding: 3,
    borderWidth: 1.5,
    borderColor: "rgba(196,166,245,0.9)",
    shadowColor: "#A855F7",
    shadowOpacity: 0.9,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  centerButtonGlowActive: {
    borderColor: "rgba(216,180,254,0.95)",
    shadowOpacity: 1,
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  tabRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 18,
    paddingBottom: 6,
    paddingHorizontal: 6,
  },
  tab: {
    flex: 1,
    alignItems: "center",
  },
  // Wraps icon + label together as one block so the active-tab highlight
  // covers both, matching the reference (not just an icon chip above text).
  tabPill: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  tabPillActive: {
    backgroundColor: "rgba(168,85,247,0.28)",
    borderWidth: 1,
    borderColor: "rgba(196,166,245,0.4)",
  },
  centerSpacer: {
    flex: 1,
  },
});
