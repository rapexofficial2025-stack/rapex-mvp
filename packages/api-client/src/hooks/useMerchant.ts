import { useRepositories } from "../RepositoryProvider";
import { useAsync, type AsyncState } from "./useAsync";
import { useAsyncAction, type AsyncActionState } from "./useAsyncAction";
import type {
  MerchantAccount,
  MerchantProduct,
  MerchantRegistrationDraft,
  MerchantStore,
  NearbyRider,
  ProductImportResult,
  ProductImportRow,
  ProductVariant,
  StoreExpansionRequest,
  StoreInsights,
  StoreSlot,
  StoreTimelineEvent,
} from "../repositories/types";
import type {
  AddDraftProductInput,
  CreateExpansionRequestInput,
  CreateProductInput,
  CreateStoreInput,
  CreateVariantInput,
  SaveRegistrationDraftInput,
  UpdateProductInput,
  UpdateStoreInput,
  UpdateVariantInput,
} from "../repositories/merchant/MerchantRepository";

export function useMyMerchantAccount(): AsyncState<MerchantAccount> {
  const { merchant } = useRepositories();
  return useAsync(() => merchant.getMyAccount(), []);
}

export function useRegistrationDraft(): AsyncState<MerchantRegistrationDraft> {
  const { merchant } = useRepositories();
  return useAsync(() => merchant.getRegistrationDraft(), []);
}

export function useSaveRegistrationDraftAction(): AsyncActionState<[SaveRegistrationDraftInput], MerchantRegistrationDraft> {
  const { merchant } = useRepositories();
  return useAsyncAction((input: SaveRegistrationDraftInput) => merchant.saveRegistrationDraft(input));
}

export function useAddDraftProductAction(): AsyncActionState<[AddDraftProductInput], MerchantRegistrationDraft> {
  const { merchant } = useRepositories();
  return useAsyncAction((input: AddDraftProductInput) => merchant.addDraftProduct(input));
}

export function useRemoveDraftProductAction(): AsyncActionState<[string], MerchantRegistrationDraft> {
  const { merchant } = useRepositories();
  return useAsyncAction((draftProductId: string) => merchant.removeDraftProduct(draftProductId));
}

export function useSubmitRegistrationAction(): AsyncActionState<[], MerchantRegistrationDraft> {
  const { merchant } = useRepositories();
  return useAsyncAction(() => merchant.submitRegistration());
}

export function useStoreSlots(): AsyncState<StoreSlot[]> {
  const { merchant } = useRepositories();
  return useAsync(() => merchant.getStoreSlots(), []);
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

export function useBulkImportProductsAction(): AsyncActionState<[string, ProductImportRow[]], ProductImportResult> {
  const { merchant } = useRepositories();
  return useAsyncAction((storeId: string, rows: ProductImportRow[]) => merchant.bulkImportProducts(storeId, rows));
}

export function useStoreExpansionRequests(storeId: string | null): AsyncState<StoreExpansionRequest[]> {
  const { merchant } = useRepositories();
  return useAsync(() => (storeId ? merchant.getStoreExpansionRequests(storeId) : Promise.resolve([])), [storeId]);
}

export function useCreateExpansionRequestAction(): AsyncActionState<[string, CreateExpansionRequestInput], StoreExpansionRequest> {
  const { merchant } = useRepositories();
  return useAsyncAction((storeId: string, input: CreateExpansionRequestInput) => merchant.createExpansionRequest(storeId, input));
}

export function useNearbyRiders(storeId: string | null): AsyncState<NearbyRider[]> {
  const { merchant } = useRepositories();
  return useAsync(() => (storeId ? merchant.getNearbyRiders(storeId) : Promise.resolve([])), [storeId]);
}

export function useStoreInsights(storeId: string | null): AsyncState<StoreInsights | null> {
  const { merchant } = useRepositories();
  return useAsync(() => (storeId ? merchant.getStoreInsights(storeId) : Promise.resolve(null)), [storeId]);
}

export function useStoreTimeline(storeId: string | null): AsyncState<StoreTimelineEvent[]> {
  const { merchant } = useRepositories();
  return useAsync(() => (storeId ? merchant.getStoreTimeline(storeId) : Promise.resolve([])), [storeId]);
}
