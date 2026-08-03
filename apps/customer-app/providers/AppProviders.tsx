import type { ReactNode } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  RepositoryProvider,
  createMockRepositories,
  XanoAuthRepository,
  XanoOrdersRepository,
  XanoWalletRepository,
} from "@rapex/api-client";
import { ThemeProvider, ToastProvider } from "@rapex/ui-native";
import { rapexAuthHttpClient, rapexOrdersHttpClient, rapexFinanceHttpClient } from "../services/apiConfig";
import { secureTokenStorage } from "../services/secureTokenStorage";
import { secureUserCache } from "../services/userCache";

type AppProvidersProps = {
  children: ReactNode;
};

// Real Xano auth/orders/wallet (rapex-auth, rapex-orders, rapex-finance
// groups per 2026-08-04 handover -- NOT YET CONFIRMED LIVE, see each Xano*
// repository's doc comment for exact endpoint/gap details); marketplace and
// merchant stay Mock until their own contract is confirmed. Swap
// createMockRepositories()'s remaining repos in one at a time as their
// contracts land. See packages/api-client/README.md.
const mocks = createMockRepositories();
const repositories = {
  ...mocks,
  auth: new XanoAuthRepository(rapexAuthHttpClient, secureTokenStorage, secureUserCache, "customer"),
  orders: new XanoOrdersRepository(rapexOrdersHttpClient, mocks.orders),
  wallet: new XanoWalletRepository(rapexFinanceHttpClient),
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
