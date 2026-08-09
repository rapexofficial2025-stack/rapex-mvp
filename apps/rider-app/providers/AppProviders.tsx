import type { ReactNode } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RepositoryProvider, createMockRepositories } from "@rapex/api-client";
import { ThemeProvider } from "@rapex/ui-native";

type AppProvidersProps = {
  children: ReactNode;
};

// Swap createMockRepositories() for a real Xano-backed set once the API
// contract lands -- this is the only line that needs to change. See
// packages/api-client/README.md.
//
// Blocked on auth specifically (not just untested): the frozen Alpha API
// contract's X-RAPEX-App header only defines "buyer" | "merchant" | "admin"
// (see docs/api/README.md and core/createRapexHttpClient.ts's RapexAppId
// type) -- there is no confirmed value for the rider role, and rider-app
// isn't even listed in the contract's base-URL table. Reusing "buyer" would
// be guessing at an unconfirmed header value, which the contract's own hard
// rules forbid ("do not guess"). customer-app/services/secureTokenStorage.ts
// and userCache.ts equivalents already exist here
// (services/secureTokenStorage.ts, services/userCache.ts) ready to wire in
// the moment "rider" (or whatever the real value is) is confirmed.
const repositories = createMockRepositories();

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RepositoryProvider repositories={repositories}>{children}</RepositoryProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
