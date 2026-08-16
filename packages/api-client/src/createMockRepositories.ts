import type { Repositories } from "./RepositoryProvider";
import { MockAuthRepository } from "./repositories/auth/MockAuthRepository";
import { MockMarketplaceRepository } from "./repositories/marketplace/MockMarketplaceRepository";
import { MockOrdersRepository } from "./repositories/orders/MockOrdersRepository";
import { MockWalletRepository } from "./repositories/wallet/MockWalletRepository";
import { MockRiderWalletRepository } from "./repositories/wallet/MockRiderWalletRepository";
import { MockMerchantRepository } from "./repositories/merchant/MockMerchantRepository";
import { MockAdminRepository } from "./repositories/admin/MockAdminRepository";
import { MockRiderRepository } from "./repositories/rider/MockRiderRepository";
import { MockRiderEconomyRepository } from "./repositories/rider/MockRiderEconomyRepository";
import { MockDeliveryRepository } from "./repositories/delivery/MockDeliveryRepository";
import { MockReferenceDataRepository } from "./repositories/reference/MockReferenceDataRepository";
import { MockKycRepository } from "./repositories/kyc/MockKycRepository";
import { MockChildAccountRepository } from "./repositories/childAccount/MockChildAccountRepository";

/** Every app wires this into its root RepositoryProvider until real Xano* implementations exist. */
export function createMockRepositories(): Repositories {
  return {
    auth: new MockAuthRepository(),
    marketplace: new MockMarketplaceRepository(),
    orders: new MockOrdersRepository(),
    wallet: new MockWalletRepository(),
    merchant: new MockMerchantRepository(),
    admin: new MockAdminRepository(),
    rider: new MockRiderRepository(),
    riderWallet: new MockRiderWalletRepository(),
    riderEconomy: new MockRiderEconomyRepository(),
    delivery: new MockDeliveryRepository(),
    referenceData: new MockReferenceDataRepository(),
    kyc: new MockKycRepository(),
    childAccount: new MockChildAccountRepository(),
  };
}
