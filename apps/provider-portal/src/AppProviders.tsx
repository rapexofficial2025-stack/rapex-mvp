import type { ReactNode } from "react";
import { ThemeProvider } from "@rapex/ui-web";

export function AppProviders({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
