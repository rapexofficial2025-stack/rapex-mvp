import type { ReactNode } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

type AppProvidersProps = {
  children: ReactNode;
};

/**
 * Composition root for app-wide providers. Currently just SafeAreaProvider --
 * Auth/Theme/Location/Notification/Wallet/Cart/Wishlist contexts land here in
 * Sprint FE-06. Kept as one file so App.tsx never needs to change when new
 * providers are added.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return <SafeAreaProvider>{children}</SafeAreaProvider>;
}
