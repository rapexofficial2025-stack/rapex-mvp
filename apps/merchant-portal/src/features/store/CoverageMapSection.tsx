import { useState } from "react";
import { Badge, Button, useTheme } from "@rapex/ui-web";
import { formatPeso } from "@rapex/utils";
import type { MerchantStore } from "@rapex/api-client";
import { HqSectionCard } from "./HqSectionCard";
import { getStoreStats } from "./headquartersMockStats";
import { StorePreviewModal } from "./StorePreviewModal";
import { NEARBY_RIDERS_MOCK } from "./ridersMockData";

type CoverageMapSectionProps = {
  stores: MerchantStore[];
};

const MARKER_POSITIONS = [
  { left: "22%", top: "62%" },
  { left: "58%", top: "32%" },
  { left: "78%", top: "68%" },
];

const MARKER_COLORS = ["#8B5CF6", "#F97316", "#06B6D4"];

export function CoverageMapSection({ stores }: CoverageMapSectionProps) {
  const theme = useTheme();
  const [activeStoreId, setActiveStoreId] = useState<string | null>(stores[0]?.id ?? null);
  const [previewStore, setPreviewStore] = useState<MerchantStore | null>(null);
  const activeStore = stores.find((s) => s.id === activeStoreId) ?? null;
  const activeStats = activeStore ? getStoreStats(activeStore.id) : null;

  return (
    <HqSectionCard emoji="📍" title="Store Coverage Map" color="cyan">
      <style>{`
        @keyframes hq-pulse {
          0% { transform: scale(0.6); opacity: 0.7; }
          100% { transform: scale(2.4); opacity: 0; }
        }
      `}</style>

      <div
        style={{
          position: "relative",
          height: 320,
          borderRadius: theme.radius.lg,
          background: `repeating-linear-gradient(45deg, ${theme.colors.surfaceAlt}, ${theme.colors.surfaceAlt} 10px, ${theme.colors.surface} 10px, ${theme.colors.surface} 20px)`,
          overflow: "hidden",
        }}
      >
        <span style={{ position: "absolute", top: 8, left: 12, fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
          Simple map placeholder — Google Maps ready
        </span>

        {stores.map((store, i) => {
          const pos = MARKER_POSITIONS[i % MARKER_POSITIONS.length]!;
          const color = MARKER_COLORS[i % MARKER_COLORS.length]!;
          return (
            <button
              key={store.id}
              type="button"
              onClick={() => setActiveStoreId(store.id)}
              style={{
                position: "absolute",
                left: pos.left,
                top: pos.top,
                transform: "translate(-50%, -50%)",
                border: "none",
                background: "none",
                cursor: "pointer",
                padding: 0,
              }}
              title={store.name}
            >
              <span style={{ position: "relative", display: "inline-flex", width: 24, height: 24, alignItems: "center", justifyContent: "center" }}>
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    backgroundColor: color,
                    animation: "hq-pulse 1.8s ease-out infinite",
                  }}
                />
                <span
                  style={{
                    position: "relative",
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    backgroundColor: color,
                    border: `2px solid ${theme.colors.surface}`,
                    boxShadow: activeStoreId === store.id ? `0 0 0 3px ${color}55` : "none",
                  }}
                />
              </span>
            </button>
          );
        })}
      </div>

      {activeStore && activeStats ? (
        <div
          style={{
            marginTop: theme.spacing.md,
            backgroundColor: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.radius.lg,
            padding: theme.spacing.md,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: theme.spacing.md,
          }}
        >
          <div style={{ display: "flex", gap: theme.spacing.sm }}>
            <span style={{ fontSize: 28 }}>{activeStore.logoLabel}</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: theme.typography.fontSize.base, fontWeight: 700, color: theme.colors.textPrimary }}>{activeStore.name}</span>
              <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>{activeStore.category} · {activeStore.address}</span>
              <div style={{ display: "flex", gap: theme.spacing.md, flexWrap: "wrap", marginTop: 4 }}>
                <MiniStat label="Today's Orders" value={String(activeStats.ordersToday)} />
                <MiniStat label="Today's Revenue" value={formatPeso(activeStats.revenueToday)} />
                <MiniStat label="Followers" value={activeStats.followers.toLocaleString()} />
                <MiniStat label="Store Views" value={activeStats.viewsToday.toLocaleString()} />
                <MiniStat label="Products" value={String(activeStore.productCount)} />
                <MiniStat label="Rating" value={`${activeStore.rating} ⭐`} />
              </div>
            </div>
          </div>
          <Button label="Open Store" size="sm" onClick={() => setPreviewStore(activeStore)} />
        </div>
      ) : null}

      <div style={{ marginTop: theme.spacing.md, display: "flex", flexWrap: "wrap", gap: theme.spacing.lg }}>
        <StoreViewsPanel />
        <NearbyRidersPanel />
      </div>

      {previewStore ? <StorePreviewModal store={previewStore} onClose={() => setPreviewStore(null)} /> : null}
    </HqSectionCard>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <div>
      <div style={{ fontSize: theme.typography.fontSize.sm, fontWeight: 700, color: theme.colors.textPrimary }}>{value}</div>
      <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>{label}</div>
    </div>
  );
}

function StoreViewsPanel() {
  const theme = useTheme();
  return (
    <div style={{ flex: 1, minWidth: 220 }}>
      <span style={{ fontSize: theme.typography.fontSize.sm, fontWeight: 700, color: theme.colors.textPrimary }}>Store Visibility</span>
      <div style={{ marginTop: theme.spacing.xs, display: "grid", gridTemplateColumns: "1fr 1fr", gap: theme.spacing.sm }}>
        <MiniStat label="Views Today" value="248" />
        <MiniStat label="Views This Week" value="1,640" />
        <MiniStat label="Views This Month" value="6,920" />
        <MiniStat label="Live Visitors" value="9" />
        <MiniStat label="Saved by Customers" value="312" />
        <MiniStat label="Followers" value="1,120" />
      </div>
    </div>
  );
}

function NearbyRidersPanel() {
  const theme = useTheme();
  return (
    <div style={{ flex: 1, minWidth: 260 }}>
      <span style={{ fontSize: theme.typography.fontSize.sm, fontWeight: 700, color: theme.colors.textPrimary }}>Nearby Riders Around Store</span>
      <div style={{ marginTop: theme.spacing.xs, display: "flex", flexDirection: "column", gap: theme.spacing.xs }}>
        {NEARBY_RIDERS_MOCK.slice(0, 3).map((rider) => (
          <div key={rider.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: theme.spacing.sm }}>
            <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.xs }}>
              <span style={{ fontSize: 18 }}>{rider.avatar}</span>
              <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textPrimary }}>{rider.name}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.xs }}>
              <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>{rider.distanceKm} km · {rider.pickupEtaMinutes} min</span>
              <Badge
                label={rider.status}
                tone={rider.status === "online" ? "success" : rider.status === "delivering" ? "warning" : "neutral"}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
