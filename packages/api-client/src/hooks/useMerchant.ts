import { useRepositories } from "../RepositoryProvider";
import { useAsync, type AsyncState } from "./useAsync";
import { useAsyncAction, type AsyncActionState } from "./useAsyncAction";
import type { MerchantAccount, MerchantProduct, MerchantStore, ProductVariant } from "../repositories/types";
import type {
  CreateProductInput,
  CreateStoreInput,
  CreateVariantInput,
  UpdateProductInput,
  UpdateStoreInput,
  UpdateVariantInput,
} from "../repositories/merchant/MerchantRepository";

export function useMyMerchantAccount(): AsyncState<MerchantAccount> {
  const { merchant } = useRepositories();
  return useAsync(() => merchant.getMyAccount(), []);
}

export function useMyStores(): AsyncState<MerchantStore[]> {
  const { merchant } = useRepositories();
  return useAsync(() => merchant.getMyStores(), []);
}

export function useMerchantStoreProducts(storeId: string | null): AsyncState<MerchantProduct[]> {
  const { merchant } = useRepositories();
  return useAsync(() => (storeId ? merchant.getStoreProducts(storeId) : Promise.resolve([])), [storeId]);
}

export function useProductVariants(productId: string | null): AsyncState<ProductVariant[]> {
  const { merchant } = useRepositories();
  return useAsync(() => (productId ? merchant.getProductVariants(productId) : Promise.resolve([])), [productId]);
}

export function useCreateStoreAction(): AsyncActionState<[CreateStoreInput], MerchantStore> {
  const { merchant } = useRepositories();
  return useAsyncAction((input: CreateStoreInput) => merchant.createStore(input));
}

export function useUpdateStoreAction(): AsyncActionState<[string, UpdateStoreInput], MerchantStore> {
  const { merchant } = useRepositories();
  return useAsyncAction((storeId: string, input: UpdateStoreInput) => merchant.updateStore(storeId, input));
}

export function useToggleStoreStatusAction(): AsyncActionState<[string], MerchantStore> {
  const { merchant } = useRepositories();
  return useAsyncAction((storeId: string) => merchant.toggleStoreStatus(storeId));
}

export function useCreateProductAction(): AsyncActionState<[string, CreateProductInput], MerchantProduct> {
  const { merchant } = useRepositories();
  return useAsyncAction((storeId: string, input: CreateProductInput) => merchant.createProduct(storeId, input));
}

export function useUpdateProductAction(): AsyncActionState<[string, UpdateProductInput], MerchantProduct> {
  const { merchant } = useRepositories();
  return useAsyncAction((productId: string, input: UpdateProductInput) => merchant.updateProduct(productId, input));
}

export function useCreateVariantAction(): AsyncActionState<[string, CreateVariantInput], ProductVariant> {
  const { merchant } = useRepositories();
  return useAsyncAction((productId: string, input: CreateVariantInput) => merchant.createVariant(productId, input));
}

export function useUpdateVariantAction(): AsyncActionState<[string, UpdateVariantInput], ProductVariant> {
  const { merchant } = useRepositories();
  return useAsyncAction((variantId: string, input: UpdateVariantInput) => merchant.updateVariant(variantId, input));
}

export function useDeleteVariantAction(): AsyncActionState<[string], void> {
  const { merchant } = useRepositories();
  return useAsyncAction((variantId: string) => merchant.deleteVariant(variantId));
}
