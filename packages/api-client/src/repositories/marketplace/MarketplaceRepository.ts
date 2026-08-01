import type { Category, ProductDetail, ProductSummary, StoreDetail, StoreSummary } from "../types";

export interface MarketplaceRepository {
  getCategories(): Promise<Category[]>;
  getFeaturedStores(): Promise<StoreSummary[]>;
  getStores(categoryId?: string): Promise<StoreSummary[]>;
  getStoreById(storeId: string): Promise<StoreSummary | null>;
  getStoreDetail(storeId: string): Promise<StoreDetail | null>;
  getProductsByStore(storeId: string): Promise<ProductSummary[]>;
  getProductById(productId: string): Promise<ProductDetail | null>;
  searchProducts(query: string): Promise<ProductSummary[]>;
}
