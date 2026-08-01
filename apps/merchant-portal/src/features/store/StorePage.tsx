import { useEffect, useState } from "react";
import { Loading, ErrorState, EmptyState, useTheme } from "@rapex/ui-web";
import {
  useMyMerchantAccount,
  useMyStores,
  useMerchantStoreProducts,
  useProductVariants,
  useToggleStoreStatusAction,
  useDeleteVariantAction,
} from "@rapex/api-client";
import { StoreDirectory } from "./StoreDirectory";
import { StoreHero } from "./StoreHero";
import { StoreProducts } from "./StoreProducts";
import { StoreVariants } from "./StoreVariants";
import { MerchantVerification } from "./MerchantVerification";
import { StoreChecklist } from "./StoreChecklist";
import { AddStoreModal } from "./AddStoreModal";
import { AddProductModal } from "./AddProductModal";
import { AddVariantModal } from "./AddVariantModal";

export function StorePage() {
  const theme = useTheme();
  const { data: account, loading: accountLoading, error: accountError } = useMyMerchantAccount();
  const { data: stores, loading: storesLoading, error: storesError, refetch: refetchStores } = useMyStores();

  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showAddStore, setShowAddStore] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddVariant, setShowAddVariant] = useState(false);

  useEffect(() => {
    if (!selectedStoreId && stores && stores.length > 0) setSelectedStoreId(stores[0]!.id);
  }, [stores, selectedStoreId]);

  const selectedStore = stores?.find((s) => s.id === selectedStoreId) ?? null;

  const {
    data: products,
    loading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useMerchantStoreProducts(selectedStoreId);

  const { data: variants, refetch: refetchVariants } = useProductVariants(selectedProductId);
  const selectedProduct = products?.find((p) => p.id === selectedProductId) ?? null;

  const toggleStatus = useToggleStoreStatusAction();
  const deleteVariant = useDeleteVariantAction();

  if (accountLoading || storesLoading) return <Loading label="Loading Merchant Headquarters…" />;
  if (accountError) return <ErrorState description={accountError} />;
  if (storesError) return <ErrorState description={storesError} onRetry={refetchStores} />;
  if (!account) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 65px)" }}>
      <div style={{ display: "flex", gap: theme.spacing.md, padding: theme.spacing.lg, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <MerchantVerification account={account} />
        </div>
        <StoreChecklist account={account} store={selectedStore} products={products ?? []} />
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <StoreDirectory
          stores={stores ?? []}
          selectedStoreId={selectedStoreId}
          onSelect={(id) => {
            setSelectedStoreId(id);
            setSelectedProductId(null);
          }}
          onAddStore={() => setShowAddStore(true)}
        />

        <div style={{ flex: 1, overflowY: "auto", padding: theme.spacing.lg, display: "flex", flexDirection: "column", gap: theme.spacing.lg }}>
          {!selectedStore ? (
            <EmptyState title="No stores yet" description="Create your first store to get started." actionLabel="+ Add Store" onAction={() => setShowAddStore(true)} />
          ) : (
            <>
              <StoreHero
                store={selectedStore}
                toggling={toggleStatus.loading}
                onToggleStatus={async () => {
                  await toggleStatus.execute(selectedStore.id);
                  refetchStores();
                }}
              />

              {productsLoading ? (
                <Loading label="Loading products…" />
              ) : productsError ? (
                <ErrorState description={productsError} onRetry={refetchProducts} />
              ) : (
                <StoreProducts
                  products={products ?? []}
                  selectedProductId={selectedProductId}
                  onSelectProduct={setSelectedProductId}
                  onAddProduct={() => setShowAddProduct(true)}
                />
              )}

              {selectedProduct ? (
                <StoreVariants
                  productName={selectedProduct.name}
                  variants={variants ?? []}
                  onAddVariant={() => setShowAddVariant(true)}
                  onDeleteVariant={async (variantId) => {
                    await deleteVariant.execute(variantId);
                    refetchVariants();
                    refetchProducts();
                  }}
                  onClose={() => setSelectedProductId(null)}
                />
              ) : null}
            </>
          )}
        </div>
      </div>

      {showAddStore ? (
        <AddStoreModal
          onClose={() => setShowAddStore(false)}
          onCreated={(storeId) => {
            setShowAddStore(false);
            refetchStores();
            setSelectedStoreId(storeId);
          }}
        />
      ) : null}

      {showAddProduct && selectedStore ? (
        <AddProductModal
          storeId={selectedStore.id}
          onClose={() => setShowAddProduct(false)}
          onCreated={() => {
            setShowAddProduct(false);
            refetchProducts();
            refetchStores();
          }}
        />
      ) : null}

      {showAddVariant && selectedProduct ? (
        <AddVariantModal
          productId={selectedProduct.id}
          onClose={() => setShowAddVariant(false)}
          onCreated={() => {
            setShowAddVariant(false);
            refetchVariants();
            refetchProducts();
          }}
        />
      ) : null}
    </div>
  );
}
