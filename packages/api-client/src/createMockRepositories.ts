import type { Repositories } from "./RepositoryProvider";
import { MockAuthRepository } from "./repositories/auth/MockAuthRepository";
import { MockMarketplaceRepository } from "./repositories/marketplace/MockMarketplaceRepository";
import { MockOrdersRepository } from "./repositories/orders/MockOrdersRepository";
import { MockWalletRepository } from "./repositories/wallet/MockWalletRepository";
import { MockMerchantRepository } from "./repositories/merchant/MockMerchantRepository";
import { MockAdminRepository } from "./repositories/admin/MockAdminRepository";

/** Every app wires this into its root RepositoryProvider until real Xano* implementations exist. */
export function createMockRepositories(): Repositories {
  return {
    auth: new MockAuthRepository(),
    marketplace: new MockMarketplaceRepository(),
    orders: new MockOrdersRepository(),
    wallet: new MockWalletRepository(),
    merchant: new MockMerchantRepository(),
    admin: new MockAdminRepository(),
  };
}
