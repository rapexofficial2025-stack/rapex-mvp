import type { ReactNode } from "react";
import { RepositoryProvider, createMockRepositories, XanoAuthRepository, XanoMerchantRepository } from "@rapex/api-client";
import { ThemeProvider } from "@rapex/ui-web";
import { rapexAuthHttpClient, rapexMasterDataHttpClient } from "./services/apiConfig";
import { webTokenStorage } from "./services/webTokenStorage";
import { webUserCache } from "./services/userCache";

// Real Xano auth + store/product creation (E2E Alpha flow); everything else
// stays Mock until its own contract is confirmed. See packages/api-client/README.md.
const repositories = {
  ...createMockRepositories(),
  auth: new XanoAuthRepository(rapexAuthHttpClient, webTokenStorage, webUserCache, "merchant"),
  merchant: new XanoMerchantRepository(rapexMasterDataHttpClient),
};

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <RepositoryProvider repositories={repositories}>{children}</RepositoryProvider>
    </ThemeProvider>
  );
}
