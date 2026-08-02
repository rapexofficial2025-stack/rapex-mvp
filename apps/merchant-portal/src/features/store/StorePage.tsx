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
import { MerchantHeadquarters } from "./MerchantHeadquarters";
import { StoreHero } from "./StoreHero";
import { StoreProducts } from "./StoreProducts";
import { StoreVariants } from "./StoreVariants";
import { MerchantVerification } from "./MerchantVerification";
import { StoreChecklist } from "./StoreChecklist";
import { AddProductModal } from "./AddProductModal";
import { AddVariantModal } from "./AddVariantModal";
import { StoreProfile } from "./StoreProfile";
import { StoreExpansion } from "./StoreExpansion";
import { CoverageMap } from "./CoverageMap";
import { NearbyRiders } from "./NearbyRiders";
import { StoreInsights } from "./StoreInsights";
import { StoreTimeline } from "./StoreTimeline";
import { CsvImportPanel } from "./CsvImportPanel";
import { DeveloperMode } from "./DeveloperMode";
import { OnboardingWizard } from "../onboarding/OnboardingWizard";

type StoreTab = "overview" | "profile" | "csv" | "coverage" | "riders" | "insights" | "timeline" | "expansion" | "developer";

const STORE_TABS: { key: StoreTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "profile", label: "Store Profile" },
  { key: "csv", label: "CSV Import" },
  { key: "coverage", label: "Coverage Map" },
  { key: "riders", label: "Nearby Riders" },
  { key: "insights", label: "Store Insights" },
  { key: "timeline", label: "Timeline" },
  { key: "expansion", label: "Store Expansion" },
  { key: "developer", label: "Developer Mode" },
];

export function StorePage() {
  const theme = useTheme();
  const { data: account, loading: accountLoading, error: accountError, refetch: refetchAccount } = useMyMerchantAccount();
  const { data: stores, loading: storesLoading, error: storesError, refetch: refetchStores } = useMyStores();

  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddVariant, setShowAddVariant] = useState(false);
  const [activeTab, setActiveTab] = useState<StoreTab>("overview");
  const [headquartersKey, setHeadquartersKey] = useState(0);

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
        <MerchantHeadquarters
          key={headquartersKey}
          account={account}
          selectedStoreId={selectedStoreId}
          onSelectStore={(id) => {
            setSelectedStoreId(id);
            setSelectedProductId(null);
          }}
          onRegisterBusiness={() => setShowOnboarding(true)}
        />

        <div style={{ flex: 1, overflowY: "auto", padding: theme.spacing.lg, display: "flex", flexDirection: "column", gap: theme.spacing.lg }}>
          {!selectedStore ? (
            <EmptyState title="No stores yet" description="Register your first business to get started." actionLabel="+ Register Business" onAction={() => setShowOnboarding(true)} />
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

              <div style={{ display: "flex", gap: theme.spacing.xs, flexWrap: "wrap", borderBottom: `1px solid ${theme.colors.border}` }}>
                {STORE_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    style={{
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: activeTab === tab.key ? 700 : 500,
                      color: activeTab === tab.key ? theme.colors.brandPrimary : theme.colors.textSecondary,
                      borderBottom: `2px solid ${activeTab === tab.key ? theme.colors.brandPrimary : "transparent"}`,
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === "overview" ? (
                <>
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
              ) : null}

              {activeTab === "profile" ? <StoreProfile store={selectedStore} onUpdated={refetchStores} /> : null}
              {activeTab === "csv" ? <CsvImportPanel store={selectedStore} onImported={refetchProducts} /> : null}
              {activeTab === "coverage" ? <CoverageMap store={selectedStore} onUpdated={refetchStores} /> : null}
              {activeTab === "riders" ? <NearbyRiders store={selectedStore} /> : null}
              {activeTab === "insights" ? <StoreInsights store={selectedStore} /> : null}
              {activeTab === "timeline" ? <StoreTimeline store={selectedStore} /> : null}
              {activeTab === "expansion" ? <StoreExpansion store={selectedStore} /> : null}
              {activeTab === "developer" ? (
                <DeveloperMode account={account} store={selectedStore} products={products ?? []} />
              ) : null}
            </>
          )}
        </div>
      </div>

      {showOnboarding ? (
        <OnboardingWizard
          onClose={() => setShowOnboarding(false)}
          onCompleted={() => {
            refetchAccount();
            refetchStores();
            setHeadquartersKey((k) => k + 1);
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
