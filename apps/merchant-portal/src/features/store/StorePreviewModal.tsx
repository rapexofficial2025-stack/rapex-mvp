import { Badge, Modal, useTheme } from "@rapex/ui-web";
import { formatPeso } from "@rapex/utils";
import type { MerchantStore } from "@rapex/api-client";
import { getStoreStats } from "./headquartersMockStats";

type StorePreviewModalProps = {
  store: MerchantStore;
  onClose: () => void;
};

export function StorePreviewModal({ store, onClose }: StorePreviewModalProps) {
  const theme = useTheme();
  const stats = getStoreStats(store.id);

  return (
    <Modal title="Store Preview" onClose={onClose}>
      <div
        style={{
          height: 100,
          borderRadius: theme.radius.lg,
          background: `linear-gradient(135deg, ${theme.colors.brandPrimary}, ${theme.colors.accent})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 40,
        }}
      >
        {store.coverImageLabel}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.sm }}>
        <span style={{ fontSize: 28 }}>{store.logoLabel}</span>
        <div>
          <div style={{ fontSize: theme.typography.fontSize.lg, fontWeight: 700, color: theme.colors.textPrimary }}>{store.name}</div>
          <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>{store.category} · {store.address}</div>
        </div>
        <Badge label={store.status === "online" ? "Open" : "Closed"} tone={store.status === "online" ? "success" : "neutral"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: theme.spacing.sm }}>
        <PreviewStat label="Products" value={String(store.productCount)} theme={theme} />
        <PreviewStat label="Inventory Status" value="Healthy" theme={theme} />
        <PreviewStat label="Followers" value={stats.followers.toLocaleString()} theme={theme} />
        <PreviewStat label="Rating" value={`${store.rating} ⭐`} theme={theme} />
        <PreviewStat label="Revenue (Today)" value={formatPeso(stats.revenueToday)} theme={theme} />
        <PreviewStat label="Orders (Today)" value={String(stats.ordersToday)} theme={theme} />
      </div>
      <Badge label="Ready for Xano Integration" tone="info" />
    </Modal>
  );
}

function PreviewStat({ label, value, theme }: { label: string; value: string; theme: ReturnType<typeof useTheme> }) {
  return (
    <div style={{ backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.md, padding: theme.spacing.sm }}>
      <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>{label}</div>
      <div style={{ fontSize: theme.typography.fontSize.sm, fontWeight: 700, color: theme.colors.textPrimary }}>{value}</div>
    </div>
  );
}
