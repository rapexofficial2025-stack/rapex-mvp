import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { MainTabParamList } from "../types/navigation";
import { useAppTheme } from "../hooks/useAppTheme";
import { HomeScreen } from "../screens/HomeScreen";
import { MarketplaceScreen } from "../screens/MarketplaceScreen";
import { WishlistScreen } from "../screens/WishlistScreen";
import { OrdersScreen } from "../screens/OrdersScreen";

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
      <Tab.Screen name="Marketplace" component={MarketplaceScreen} />
      <Tab.Screen name="Wishlist" component={WishlistScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
    </Tab.Navigator>
  );
}
