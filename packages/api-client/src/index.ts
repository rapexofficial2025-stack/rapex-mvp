// Core
export * from "./core/httpClient";
export * from "./core/errors";
export * from "./core/createRapexHttpClient";

// DI
export * from "./RepositoryProvider";
export * from "./createMockRepositories";

// Repository interfaces + DTOs
export * from "./repositories/types";
export type { AuthRepository, RegisterInput, LoginInput } from "./repositories/auth/AuthRepository";
export type { MarketplaceRepository } from "./repositories/marketplace/MarketplaceRepository";
export type { OrdersRepository } from "./repositories/orders/OrdersRepository";
export type { WalletRepository } from "./repositories/wallet/WalletRepository";
export type { MerchantRepository } from "./repositories/merchant/MerchantRepository";
export type { AdminRepository } from "./repositories/admin/AdminRepository";

// Hooks
export * from "./hooks/useAsync";
export * from "./hooks/useAsyncAction";
export * from "./hooks/useMarketplace";
export * from "./hooks/useOrders";
export * from "./hooks/useWallet";
