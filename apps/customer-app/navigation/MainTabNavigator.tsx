import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { createBottomTabNavigator, type BottomTabBarProps, type BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { Grid2x2, Heart, Home, User, Wrench } from "lucide-react-native";
import type { MainTabParamList } from "../types/navigation";
import { HomeScreen } from "../screens/HomeScreen";
import { WishlistScreen } from "../screens/WishlistScreen";
import { MarketplaceScreen } from "../screens/MarketplaceScreen";
import { ServicesScreen } from "../screens/ServicesScreen";
import { ProfileScreen, type ProfileScreenProps } from "../screens/ProfileScreen";
import { addNotificationResponseListener, registerForPushNotificationsAsync } from "../services/notifications";
import { SupportChatWidget } from "../components/SupportChatWidget";
import { FlashCardIntro } from "@rapex/ui-native";
import { consumePreviewIntro } from "../services/previewIntro";
import { FLASHCARD_INTRO_IMAGES } from "../services/flashcardAssets";

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * ProfileScreen's own Props type is NativeStackScreenProps<RootStackParamList,
 * "Profile"> (it's also a standalone root-stack screen -- see RootNavigator).
 * Giving it a second CompositeScreenProps type for tab use as well previously
 * caused `tsc` to blow its call stack while checking JSX for this file
 * (RootStackParamList's own "MainTabs: NavigatorScreenParams<MainTabParamList>"
 * entry makes the two param lists mutually referential, and stacking a
 * composite type on top of that on the *tab* side too was one recursion too
 * many). A plain runtime cast sidesteps that instead of fighting the checker.
 */
function ProfileTabScreen(props: BottomTabScreenProps<MainTabParamList, "Profile">) {
  return <ProfileScreen {...(props as unknown as ProfileScreenProps)} />;
}

/**
 * Grab/Lazada/Food-Panda style nav bar per founder spec (2026-08-20): Home,
 * Save List, Category (center -- round, elevated, overlaps the bar, icon
 * larger than the others), Services, Profile. Bar itself is a dark-gray to
 * light-gray linear gradient with a heavy drop shadow + embossed edge; the
 * center Category button gets a neon gradient border-glow when active,
 * reusing the same glow-ring recipe already shipped for the rider app's
 * center "Go Offline" button (see rider-app/navigation/MainTabNavigator.tsx).
 */
function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const activeRouteName = state.routes[state.index]?.name;

  const tabs: { key: keyof MainTabParamList; label: string; icon: typeof Home }[] = [
    { key: "Home", label: "Home", icon: Home },
    { key: "Wishlist", label: "Save List", icon: Heart },
  ];
  const rightTabs: { key: keyof MainTabParamList; label: string; icon: typeof Home }[] = [
    { key: "Services", label: "Services", icon: Wrench },
    { key: "Profile", label: "Profile", icon: User },
  ];

  const renderTab = (tab: { key: keyof MainTabParamList; label: string; icon: typeof Home }) => {
    const routeIndex = state.routes.findIndex((r) => r.name === tab.key);
    const focused = state.index === routeIndex;
    const color = focused ? "#FFFFFF" : "rgba(255,255,255,0.55)";
    return (
      <Pressable key={tab.key} style={styles.tab} onPress={() => navigation.navigate(tab.key)}>
        <View style={[styles.tabPill, focused && styles.tabPillActive]}>
          <tab.icon color={color} size={20} />
          <Text style={{ color, fontSize: 11, fontWeight: "600", marginTop: 3 }}>{tab.label}</Text>
        </View>
      </Pressable>
    );
  };

  const categoryFocused = activeRouteName === "Marketplace";

  return (
    <View style={styles.wrap}>
      <View style={styles.glassBar}>
        <LinearGradient
          colors={["#3A3D45", "#B8BCC4"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={["rgba(255,255,255,0.16)", "rgba(255,255,255,0)"]}
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
        <Pressable onPress={() => navigation.navigate("Marketplace")} style={[styles.centerButtonGlow, categoryFocused && styles.centerButtonGlowActive]}>
          <LinearGradient colors={categoryFocused ? ["#FF7A1A", "#7C3AED"] : ["#2E3138", "#1B1D22"]} style={styles.centerButton}>
            <Grid2x2 color="#FFFFFF" size={28} />
          </LinearGradient>
        </Pressable>
        <Text style={styles.centerLabel}>Category</Text>
      </View>
    </View>
  );
}

export function MainTabNavigator() {
  // Runs once the user actually has the app open (not at cold splash) --
  // requests notification permission and gets a real Expo push token if
  // possible. Not uploaded anywhere: no confirmed Xano endpoint exists yet
  // to register a device token against. Tap routing is a real, working
  // listener, but doesn't dispatch to specific screens yet -- there are no
  // real notification types defined by the backend/product yet to route.
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
        <Tab.Screen name="Wishlist" component={WishlistScreen} />
        <Tab.Screen name="Marketplace" component={MarketplaceScreen} />
        <Tab.Screen name="Services" component={ServicesScreen} />
        <Tab.Screen name="Profile" component={ProfileTabScreen} />
      </Tab.Navigator>
      <SupportChatWidget />
      {showFlashIntro ? <FlashCardIntro images={FLASHCARD_INTRO_IMAGES} onFinish={() => setShowFlashIntro(false)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 14,
    paddingBottom: 6,
  },
  // Dark-gray to light-gray gradient bar with a heavy drop shadow and a
  // bright top-edge highlight standing in for an embossed rim (RN shadows
  // are outer-only, so the highlight gradient above does the "emboss" work).
  glassBar: {
    borderRadius: 32,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 16,
  },
  barTopHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "55%",
  },
  centerButtonWrap: {
    position: "absolute",
    top: -30,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  centerLabel: {
    color: "#2B2D33",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 4,
  },
  centerButtonGlow: {
    borderRadius: 36,
    padding: 3,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)",
    shadowColor: "#000000",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  centerButtonGlowActive: {
    borderColor: "#FF9A4D",
    shadowColor: "#7C3AED",
    shadowOpacity: 1,
    shadowRadius: 16,
  },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
  tabPill: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  tabPillActive: {
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  centerSpacer: {
    flex: 1,
  },
});
