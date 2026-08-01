import { useRepositories } from "../RepositoryProvider";
import { useAsync, type AsyncState } from "./useAsync";
import type { Category, ProductDetail, ProductSummary, StoreSummary } from "../repositories/types";

export function useCategories(): AsyncState<Category[]> {
  const { marketplace } = useRepositories();
  return useAsync(() => marketplace.getCategories(), []);
}

export function useFeaturedStores(): AsyncState<StoreSummary[]> {
  const { marketplace } = useRepositories();
  return useAsync(() => marketplace.getFeaturedStores(), []);
}

export function useStores(categoryId?: string): AsyncState<StoreSummary[]> {
  const { marketplace } = useRepositories();
  return useAsync(() => marketplace.getStores(categoryId), [categoryId]);
}

export function useStore(storeId: string): AsyncState<StoreSummary | null> {
  const { marketplace } = useRepositories();
  return useAsync(() => marketplace.getStoreById(storeId), [storeId]);
}

export function useStoreProducts(storeId: string): AsyncState<ProductSummary[]> {
  const { marketplace } = useRepositories();
  return useAsync(() => marketplace.getProductsByStore(storeId), [storeId]);
}

export function useProduct(productId: string): AsyncState<ProductDetail | null> {
  const { marketplace } = useRepositories();
  return useAsync(() => marketplace.getProductById(productId), [productId]);
}
