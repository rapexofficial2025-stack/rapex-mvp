import { useEffect, useState } from "react";
import { Loading, ErrorState, EmptyState, useTheme } from "@rapex/ui-web";
import { useMyMerchantAccount, useMyStores, useMerchantStoreProducts, useToggleStoreStatusAction } from "@rapex/api-client";
import { OnboardingWizard } from "../onboarding/OnboardingWizard";
import { HqTopHeader } from "./HqTopHeader";
import { StoreHeroCard } from "./StoreHeroCard";
import { StoreExpansionSection } from "./StoreExpansionSection";
import { ProductsOverviewSection } from "./ProductsOverviewSection";
import { CoverageMapSection } from "./CoverageMapSection";
import { ProductPerformanceSection } from "./ProductPerformanceSection";
import { AvailableRidersSection } from "./AvailableRidersSection";
import { StoreInsightsSection } from "./StoreInsightsSection";
import { ActivityTimelineSection } from "./ActivityTimelineSection";
import { StoreBadgesSection } from "./StoreBadgesSection";
import { StoreChecklistSection } from "./StoreChecklistSection";

export function StorePage() {
  const theme = useTheme();
  const { data: account, loading: accountLoading, error: accountError, refetch: refetchAccount } = useMyMerchantAccount();
  const { data: stores, loading: storesLoading, error: storesError, refetch: refetchStores } = useMyStores();

  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!selectedStoreId && stores && stores.length > 0) setSelectedStoreId(stores[0]!.id);
  }, [stores, selectedStoreId]);

  const selectedStore = stores?.find((s) => s.id === selectedStoreId) ?? null;

  const { data: products, loading: productsLoading, refetch: refetchProducts } = useMerchantStoreProducts(selectedStoreId);

  const toggleStatus = useToggleStoreStatusAction();

  if ((accountLoading && !account) || (storesLoading && !stores)) return <Loading label="Loading Merchant Headquarters…" />;
  if (accountError) return <ErrorState description={accountError} />;
  if (storesError) return <ErrorState description={storesError} onRetry={refetchStores} />;
  if (!account) return null;

  return (
    <div style={{ backgroundColor: theme.colors.background, minHeight: "calc(100vh - 65px)" }}>
      <HqTopHeader
        account={account}
        storeMode={selectedStore?.status === "online"}
        toggling={toggleStatus.loading}
        onToggleStoreMode={async () => {
          if (!selectedStore) return;
          await toggleStatus.execute(selectedStore.id);
          refetchStores();
        }}
      />

      {!selectedStore ? (
        <div style={{ padding: theme.spacing.lg }}>
          <EmptyState title="No stores yet" description="Register your first business to get started." actionLabel="+ Register Business" onAction={() => setShowOnboarding(true)} />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.lg, padding: theme.spacing.lg }}>
          <StoreHeroCard
            store={selectedStore}
            products={products ?? []}
            storeMode={selectedStore.status === "online"}
            toggling={toggleStatus.loading}
            onToggleStoreMode={async () => {
              await toggleStatus.execute(selectedStore.id);
              refetchStores();
            }}
          />

          <StoreExpansionSection
            key={refreshKey}
            account={account}
            selectedStoreId={selectedStoreId}
            onSelectStore={setSelectedStoreId}
            onAddStore={() => setShowOnboarding(true)}
          />

          <ProductsOverviewSection
            stores={stores ?? []}
            selectedStoreId={selectedStoreId}
            onSelectStore={setSelectedStoreId}
            products={products ?? []}
            loading={productsLoading}
          />

          <CoverageMapSection stores={stores ?? []} />

          <ProductPerformanceSection products={products ?? []} />

          <AvailableRidersSection />

          <StoreInsightsSection />

          <ActivityTimelineSection />

          <StoreBadgesSection account={account} />

          <StoreChecklistSection account={account} store={selectedStore} />
        </div>
      )}

      {showOnboarding ? (
        <OnboardingWizard
          onClose={() => setShowOnboarding(false)}
          onCompleted={() => {
            refetchAccount();
            refetchStores();
            refetchProducts();
            setRefreshKey((k) => k + 1);
          }}
        />
      ) : null}
    </div>
  );
}
