import { createContext, useContext, type ReactNode } from "react";
import type { AuthRepository } from "./repositories/auth/AuthRepository";
import type { MarketplaceRepository } from "./repositories/marketplace/MarketplaceRepository";
import type { OrdersRepository } from "./repositories/orders/OrdersRepository";
import type { WalletRepository } from "./repositories/wallet/WalletRepository";
import type { RiderWalletRepository } from "./repositories/wallet/RiderWalletRepository";
import type { MerchantRepository } from "./repositories/merchant/MerchantRepository";
import type { AdminRepository } from "./repositories/admin/AdminRepository";
import type { RiderRepository } from "./repositories/rider/RiderRepository";
import type { RiderEconomyRepository } from "./repositories/rider/RiderEconomyRepository";
import type { DeliveryRepository } from "./repositories/delivery/DeliveryRepository";
import type { ReferenceDataRepository } from "./repositories/reference/ReferenceDataRepository";
import type { KycRepository } from "./repositories/kyc/KycRepository";

export type Repositories = {
  auth: AuthRepository;
  marketplace: MarketplaceRepository;
  orders: OrdersRepository;
  wallet: WalletRepository;
  merchant: MerchantRepository;
  admin: AdminRepository;
  /** Rider domain -- optional so existing (customer/merchant/admin) apps' repository sets don't need to change. */
  rider?: RiderRepository;
  riderWallet?: RiderWalletRepository;
  riderEconomy?: RiderEconomyRepository;
  delivery?: DeliveryRepository;
  /** Optional so existing apps' repository sets don't need to change -- same convention as the rider fields above. */
  referenceData?: ReferenceDataRepository;
  kyc?: KycRepository;
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
