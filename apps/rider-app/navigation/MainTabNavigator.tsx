import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createBottomTabNavigator, type BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Home, Package, Power, User, Wallet as WalletIcon } from "lucide-react-native";
import { useAsyncAction, useRepositories, useRiderProfile } from "@rapex/api-client";
import type { MainTabParamList } from "../types/navigation";
import { useAppTheme } from "../hooks/useAppTheme";
import { HomeScreen } from "../screens/HomeScreen";
import { EarningsScreen } from "../screens/EarningsScreen";
import { WalletScreen } from "../screens/WalletScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { addNotificationResponseListener, registerForPushNotificationsAsync } from "../services/notifications";

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Custom tab bar so the floating "Go Offline"/"Go Online" center button
 * (per the reference design) can sit ABOVE the bar and directly toggle the
 * rider's real availability status -- the same real action HomeScreen's own
 * toggle uses (rider.setAvailabilityStatus), not a separate/fake control.
 */
function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const theme = useAppTheme();
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
    const color = focused ? theme.colors.brandPrimary : theme.colors.textSecondary;
    return (
      <Pressable key={tab.key} style={styles.tab} onPress={() => navigation.navigate(tab.key)}>
        <tab.icon color={color} size={22} />
        <Text style={{ color, fontSize: 11, fontWeight: "600", marginTop: 2 }}>{tab.label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.wrap, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
      <View style={styles.centerButtonWrap}>
        <Pressable
          onPress={async () => {
            await toggleOnline.execute(!isOnline);
            refetch();
          }}
          disabled={toggleOnline.loading}
          style={[
            styles.centerButton,
            { backgroundColor: isOnline ? "#DC2626" : theme.colors.brandPrimary, shadowColor: isOnline ? "#DC2626" : theme.colors.brandPrimary },
          ]}
        >
          <Power color="#FFFFFF" size={26} />
        </Pressable>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 11, fontWeight: "700", marginTop: 4 }}>
          {isOnline ? "Go Offline" : "Go Online"}
        </Text>
      </View>
      <SafeAreaView edges={["bottom"]}>
        <View style={styles.tabRow}>
          {tabs.map(renderTab)}
          <View style={styles.centerSpacer} />
          {rightTabs.map(renderTab)}
        </View>
      </SafeAreaView>
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

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <CustomTabBar {...props} />}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: 1,
  },
  centerButtonWrap: {
    position: "absolute",
    top: -28,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  tabRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 6,
  },
  tab: {
    flex: 1,
    alignItems: "center",
  },
  centerSpacer: {
    flex: 1,
  },
});
