import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { MainTabParamList } from "../types/navigation";
import { useAppTheme } from "../hooks/useAppTheme";
import { HomeScreen } from "../screens/HomeScreen";
import { EarningsScreen } from "../screens/EarningsScreen";
import { WalletScreen } from "../screens/WalletScreen";
import { ProfileScreen } from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  const theme = useAppTheme();

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
