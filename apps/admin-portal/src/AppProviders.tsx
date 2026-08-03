import type { ReactNode } from "react";
import { RepositoryProvider, createMockRepositories } from "@rapex/api-client";
import { ThemeProvider } from "@rapex/ui-web";

// Swap createMockRepositories() for a real Xano-backed set once the API
// contract lands -- this is the only line that needs to change.
const repositories = createMockRepositories();

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultMode="dark">
      <RepositoryProvider repositories={repositories}>{children}</RepositoryProvider>
    </ThemeProvider>
  );
}
