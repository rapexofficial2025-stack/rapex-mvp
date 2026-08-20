import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, EmptyState, ErrorState, Loading } from "@rapex/ui-web";
import { formatPeso } from "@rapex/utils";
import { useMerchantStoreProducts, useMyMerchantAccount, useMyStores, useStoreInsights } from "@rapex/api-client";
import { PortalDashboardFrame, PortalMetric, PortalPanel } from "../../../admin-portal/src/shared/portal-ui/PortalDashboardPrimitives";
import { PortalInteractiveDonutChart, PortalInteractiveLineChart, type PortalDonutSlice } from "../../../admin-portal/src/shared/portal-ui/PortalInteractiveCharts";

const DONUT_TONES: PortalDonutSlice["tone"][] = ["lavender", "yellow", "mint"];

export function DashboardPage({ previewMode = false }: { previewMode?: boolean }) {
  const navigate = useNavigate();
  const [chosenStoreId, setChosenStoreId] = useState<string | null>(null);
  const accountState = useMyMerchantAccount();
  const storesState = useMyStores();
  const selectedStoreId = storesState.data?.some((store) => store.id === chosenStoreId) ? chosenStoreId : (storesState.data?.[0]?.id ?? null);
  const selectedStore = storesState.data?.find((store) => store.id === selectedStoreId) ?? null;
  const productsState = useMerchantStoreProducts(selectedStoreId);
  const insightsState = useStoreInsights(selectedStoreId);

  if ((accountState.loading && !accountState.data) || (storesState.loading && !storesState.data)) {
    return <div className="merchant-state-page"><Loading label="Loading merchant workspace…" /></div>;
  }
  if (accountState.error) {
    return <div className="merchant-state-page"><ErrorState description={accountState.error} onRetry={accountState.refetch} /></div>;
  }
  if (storesState.error) {
    return <div className="merchant-state-page"><ErrorState description={storesState.error} onRetry={storesState.refetch} /></div>;
  }
  if (!accountState.data) {
    return <div className="merchant-state-page"><EmptyState title="Merchant account unavailable" description="A real authenticated merchant account is required." /></div>;
  }

  const revenuePoints = (insightsState.data?.last7DaysRevenue ?? []).map((point) => ({
    label: new Date(point.date).toLocaleDateString("en-PH", { weekday: "short" }),
    value: point.revenue,
  }));
  const productMix: PortalDonutSlice[] = (insightsState.data?.topProducts ?? []).slice(0, 3).map((product, index) => ({
    label: product.name,
    value: product.unitsSold,
    tone: DONUT_TONES[index] ?? "lavender",
  }));

  function openStore() {
    navigate(previewMode ? "/login" : "/portal/store");
  }

  return (
    <PortalDashboardFrame
      eyebrow="RAPEX Merchant OS · Module 1"
      title="Store command dashboard"
      description="Select one store to keep every metric and action isolated to that business."
      notice={<span className="merchant-source-badge">Preview fallback · published Merchant response schema required</span>}
      activeTab="overview"
      tabs={[
        { key: "overview", label: "Overview", onSelect: () => navigate(previewMode ? "/portal/preview/dashboard" : "/portal/dashboard") },
        { key: "stores", label: "My Stores", onSelect: openStore },
      ]}
    >
      <PortalPanel className="is-full merchant-store-selector-panel" title="Active store" subtitle="All dashboard cards below follow this selection.">
        <div className="merchant-store-selector">
          <label>
            <span>Store workspace</span>
            <select value={selectedStoreId ?? ""} onChange={(event) => setChosenStoreId(event.target.value)}>
              {(storesState.data ?? []).map((store) => <option value={store.id} key={store.id}>{store.name} · {store.category}</option>)}
            </select>
          </label>
          {selectedStore ? (
            <div className="merchant-store-identity">
              <div><strong>{selectedStore.name}</strong><span>{selectedStore.address}</span></div>
              <span className="merchant-store-status" data-online={selectedStore.status === "online"}>{selectedStore.status === "online" ? "Online" : "Offline"} <small>legacy contract</small></span>
            </div>
          ) : null}
          <button className="merchant-secondary-button" type="button" onClick={() => { accountState.refetch(); storesState.refetch(); productsState.refetch(); insightsState.refetch(); }}>Refresh view</button>
        </div>
        <p className="merchant-contract-note">Store status is read-only here. Xano must confirm the OPEN / CLOSED / BUSY / TEMPORARILY_UNAVAILABLE enum and update endpoint before controls are enabled.</p>
      </PortalPanel>

      {!selectedStore ? (
        <PortalPanel className="is-full">
          <EmptyState title="No store available" description="Create and approve a real store before dashboard metrics can be scoped." actionLabel={previewMode ? "Open sign in" : "Open store setup"} onAction={openStore} />
        </PortalPanel>
      ) : (
        <>
          <section aria-label="Selected store summary" className="rapex-dashboard-grid">
            <PortalMetric label="Revenue" value={insightsState.loading ? "…" : insightsState.data ? formatPeso(insightsState.data.totalRevenue) : "—"} detail="Preview fallback until dashboard schema is mapped" />
            <PortalMetric label="Orders" value={insightsState.loading ? "…" : insightsState.data ? String(insightsState.data.totalOrders) : "—"} detail="Selected store only" tone="yellow" />
            <PortalMetric label="Products" value={productsState.loading ? "…" : productsState.data ? String(productsState.data.length) : "—"} detail="Preview fallback listing" tone="mint" />
            <PortalMetric label="Average order" value={insightsState.loading ? "…" : insightsState.data ? formatPeso(insightsState.data.avgOrderValue) : "—"} detail="Selected store only" />
            <PortalMetric label="Completion rate" value={insightsState.loading ? "…" : insightsState.data ? insightsState.data.completionRate.toFixed(1) + "%" : "—"} detail="Preview fallback" tone="mint" />
            <PortalMetric label="Pending / preparing / ready" value="—" detail="Merchant order-status response fields not supplied" tone="yellow" />
          </section>

          {insightsState.error || productsState.error ? (
            <PortalPanel className="is-full"><ErrorState description={insightsState.error ?? productsState.error ?? "Store data could not be loaded."} /></PortalPanel>
          ) : null}

          <div className="rapex-dashboard-grid">
            <PortalPanel className="is-wide" title="Seven-day revenue" subtitle="Interactive preview from the repository fallback; not labeled live.">
              <PortalInteractiveLineChart ariaLabel="Selected store seven-day revenue preview" points={revenuePoints} formatValue={formatPeso} />
            </PortalPanel>
            <PortalPanel title="Top product mix" subtitle="Units sold for the selected store preview.">
              {productMix.length ? (
                <PortalInteractiveDonutChart ariaLabel="Selected store top product mix preview" slices={productMix} totalLabel="Units" formatValue={(value) => String(value)} />
              ) : <div className="rapex-chart-empty">No product performance data available.</div>}
            </PortalPanel>
          </div>

          <div className="rapex-dashboard-grid">
            <PortalPanel className="is-wide" title="Store identity" subtitle="Current repository view">
              <dl className="merchant-store-details">
                <div><dt>Store</dt><dd>{selectedStore.name}</dd></div>
                <div><dt>Category</dt><dd>{selectedStore.category}</dd></div>
                <div><dt>Approval</dt><dd>{selectedStore.approvalStatus}</dd></div>
                <div><dt>Coverage</dt><dd>{selectedStore.coverageRadiusKm} km</dd></div>
                <div><dt>Business hours</dt><dd>{selectedStore.businessHours || "Not provided"}</dd></div>
                <div><dt>Rating</dt><dd>{selectedStore.rating ? selectedStore.rating.toFixed(1) : "No rating"}</dd></div>
              </dl>
            </PortalPanel>
            <PortalPanel title="Primary action" subtitle="Continue store setup and management">
              <p className="merchant-panel-copy">Open the selected store workspace for its profile, coverage, and currently available store tools.</p>
              <Button label={previewMode ? "Sign in to manage store" : "Manage selected store"} onClick={openStore} />
            </PortalPanel>
          </div>
        </>
      )}
    </PortalDashboardFrame>
  );
}
