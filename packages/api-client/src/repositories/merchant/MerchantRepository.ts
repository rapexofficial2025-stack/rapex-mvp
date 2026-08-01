import type { MerchantAccount, MerchantOrder, MerchantProduct, MerchantStore, ProductVariant } from "../types";

export type CreateStoreInput = { name: string; category: string; address: string };
export type UpdateStoreInput = Partial<{ name: string; category: string; address: string; coverageRadiusKm: number }>;
export type CreateProductInput = { name: string; price: number; productCategory: string };
export type UpdateProductInput = Partial<{ name: string; price: number; stock: number; isActive: boolean }>;
export type CreateVariantInput = { name: string; priceDelta: number; stock: number; sku: string };
export type UpdateVariantInput = Partial<CreateVariantInput>;

export interface MerchantRepository {
  getMyAccount(): Promise<MerchantAccount>;

  getMyStores(): Promise<MerchantStore[]>;
  getStoreById(storeId: string): Promise<MerchantStore | null>;
  createStore(input: CreateStoreInput): Promise<MerchantStore>;
  updateStore(storeId: string, input: UpdateStoreInput): Promise<MerchantStore>;
  toggleStoreStatus(storeId: string): Promise<MerchantStore>;

  getStoreProducts(storeId: string): Promise<MerchantProduct[]>;
  createProduct(storeId: string, input: CreateProductInput): Promise<MerchantProduct>;
  updateProduct(productId: string, input: UpdateProductInput): Promise<MerchantProduct>;

  getProductVariants(productId: string): Promise<ProductVariant[]>;
  createVariant(productId: string, input: CreateVariantInput): Promise<ProductVariant>;
  updateVariant(variantId: string, input: UpdateVariantInput): Promise<ProductVariant>;
  deleteVariant(variantId: string): Promise<void>;

  getMyOrders(): Promise<MerchantOrder[]>;
  acceptOrder(orderId: string): Promise<MerchantOrder>;
  rejectOrder(orderId: string): Promise<MerchantOrder>;
}
