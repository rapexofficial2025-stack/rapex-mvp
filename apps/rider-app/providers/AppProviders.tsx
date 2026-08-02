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

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SafeAreaProvider>
      <RepositoryProvider repositories={repositories}>{children}</RepositoryProvider>
    </SafeAreaProvider>
  );
}
