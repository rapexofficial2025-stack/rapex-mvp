import { useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { MainTabParamList } from "../types/navigation";
import { useAppTheme } from "../hooks/useAppTheme";
import { HomeScreen } from "../screens/HomeScreen";
import { EarningsScreen } from "../screens/EarningsScreen";
import { WalletScreen } from "../screens/WalletScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { addNotificationResponseListener, registerForPushNotificationsAsync } from "../services/notifications";

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  const theme = useAppTheme();

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
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.brandPrimary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
