import type { MerchantOrder, MerchantProfile, ProductSummary } from "../types";

export interface MerchantRepository {
  getMyProfile(): Promise<MerchantProfile>;
  getMyProducts(): Promise<ProductSummary[]>;
  createProduct(input: { name: string; price: number }): Promise<ProductSummary>;
  updateProduct(productId: string, input: { name?: string; price?: number }): Promise<ProductSummary>;
  getMyOrders(): Promise<MerchantOrder[]>;
  acceptOrder(orderId: string): Promise<MerchantOrder>;
  rejectOrder(orderId: string): Promise<MerchantOrder>;
}
