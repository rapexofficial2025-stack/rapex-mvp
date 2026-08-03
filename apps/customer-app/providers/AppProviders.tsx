import type { ReactNode } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RepositoryProvider, createMockRepositories, XanoAuthRepository } from "@rapex/api-client";
import { ThemeProvider, ToastProvider } from "@rapex/ui-native";
import { rapexAuthHttpClient } from "../services/apiConfig";
import { secureTokenStorage } from "../services/secureTokenStorage";
import { secureUserCache } from "../services/userCache";

type AppProvidersProps = {
  children: ReactNode;
};

// Real Xano auth (rapex-auth group, live per 2026-08-03 handover); every
// other domain (marketplace/orders/wallet/merchant) stays Mock until its
// own contract is confirmed. This is the E2E Alpha auth wiring only --
// swap createMockRepositories()'s other repos in one at a time as their
// contracts land. See packages/api-client/README.md.
const repositories = {
  ...createMockRepositories(),
  auth: new XanoAuthRepository(rapexAuthHttpClient, secureTokenStorage, secureUserCache, "customer"),
};

/**
 * Composition root for app-wide providers. Auth/Location/Notification/
 * Wallet/Cart/Wishlist contexts land here in Sprint FE-06. Kept as one file
 * so App.tsx never needs to change when new providers are added.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SafeAreaProvider>
      {/* forceMode="light": the new white/glass background design (2026-08-02) is light-only for now -- remove this prop once a dark variant exists. */}
      <ThemeProvider forceMode="light">
        <ToastProvider>
          <RepositoryProvider repositories={repositories}>{children}</RepositoryProvider>
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
