import type { MarketplaceRepository } from "./MarketplaceRepository";
import type { Category, ProductDetail, ProductSummary, StoreDetail, StoreSummary } from "../types";
import { MOCK_CATEGORIES, MOCK_PRODUCTS, MOCK_PRODUCT_DETAILS, MOCK_STORES, MOCK_STORE_DETAILS } from "./mockData";

const MOCK_DELAY_MS = 350;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

/** Stands in for the real Xano-backed MarketplaceRepository until that API contract is provided. */
export class MockMarketplaceRepository implements MarketplaceRepository {
  async getCategories(): Promise<Category[]> {
    return delay(MOCK_CATEGORIES);
  }

  async getFeaturedStores(): Promise<StoreSummary[]> {
    return delay(MOCK_STORES.filter((s) => s.isOpen));
  }

  async getStores(categoryId?: string): Promise<StoreSummary[]> {
    if (!categoryId) return delay(MOCK_STORES);
    const category = MOCK_CATEGORIES.find((c) => c.id === categoryId);
    return delay(category ? MOCK_STORES.filter((s) => s.category === category.name) : []);
  }

  async getStoreById(storeId: string): Promise<StoreSummary | null> {
    return delay(MOCK_STORES.find((s) => s.id === storeId) ?? null);
  }

  async getStoreDetail(storeId: string): Promise<StoreDetail | null> {
    return delay(MOCK_STORE_DETAILS[storeId] ?? null);
  }

  async getProductsByStore(storeId: string): Promise<ProductSummary[]> {
    return delay(MOCK_PRODUCTS.filter((p) => p.storeId === storeId));
  }

  async getProductById(productId: string): Promise<ProductDetail | null> {
    return delay(MOCK_PRODUCT_DETAILS[productId] ?? null);
  }

  async searchProducts(query: string): Promise<ProductSummary[]> {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return delay(MOCK_PRODUCTS);
    return delay(MOCK_PRODUCTS.filter((p) => p.name.toLowerCase().includes(normalized)));
  }
}
