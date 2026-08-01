import type { ReactNode } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RepositoryProvider, createMockRepositories } from "@rapex/api-client";

type AppProvidersProps = {
  children: ReactNode;
};

// Swap createMockRepositories() for a real Xano-backed set once the API
// contract lands -- this is the only line that needs to change. See
// packages/api-client/README.md.
const repositories = createMockRepositories();

/**
 * Composition root for app-wide providers. Auth/Theme/Location/Notification/
 * Wallet/Cart/Wishlist contexts land here in Sprint FE-06. Kept as one file
 * so App.tsx never needs to change when new providers are added.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SafeAreaProvider>
      <RepositoryProvider repositories={repositories}>{children}</RepositoryProvider>
    </SafeAreaProvider>
  );
}
