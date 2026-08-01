import { createContext, useContext, type ReactNode } from "react";
import type { AuthRepository } from "./repositories/auth/AuthRepository";
import type { MarketplaceRepository } from "./repositories/marketplace/MarketplaceRepository";
import type { OrdersRepository } from "./repositories/orders/OrdersRepository";
import type { WalletRepository } from "./repositories/wallet/WalletRepository";
import type { MerchantRepository } from "./repositories/merchant/MerchantRepository";
import type { AdminRepository } from "./repositories/admin/AdminRepository";

export type Repositories = {
  auth: AuthRepository;
  marketplace: MarketplaceRepository;
  orders: OrdersRepository;
  wallet: WalletRepository;
  merchant: MerchantRepository;
  admin: AdminRepository;
};

const RepositoriesContext = createContext<Repositories | null>(null);

/**
 * Single place each app configures which repository implementations it uses.
 * Swapping Mock* for Xano* implementations here is the only change needed
 * once the API contract lands -- no screen changes required.
 */
export function RepositoryProvider({ repositories, children }: { repositories: Repositories; children: ReactNode }) {
  return <RepositoriesContext.Provider value={repositories}>{children}</RepositoriesContext.Provider>;
}

export function useRepositories(): Repositories {
  const context = useContext(RepositoriesContext);
  if (!context) {
    throw new Error("useRepositories must be used within a RepositoryProvider");
  }
  return context;
}
