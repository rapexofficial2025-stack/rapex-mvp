import type { ReactNode } from "react";
import { RepositoryProvider, createMockRepositories, XanoAdminAuthRepository } from "@rapex/api-client";
import { ThemeProvider } from "@rapex/ui-web";
import { rapexAuthHttpClient } from "./services/apiConfig";
import { webTokenStorage } from "./services/webTokenStorage";
import { webUserCache } from "./services/userCache";

// Real Xano auth (super_app group's confirmed POST /login); everything else
// stays Mock until its own contract is confirmed -- see
// packages/api-client/README.md and docs/change-log for what's real vs mock.
const repositories = {
  ...createMockRepositories(),
  auth: new XanoAdminAuthRepository(rapexAuthHttpClient, webTokenStorage, webUserCache, "admin"),
};

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultMode="dark">
      <RepositoryProvider repositories={repositories}>{children}</RepositoryProvider>
    </ThemeProvider>
  );
}
