import { Badge, Button, useTheme } from "@rapex/ui-web";
import type { MerchantStore } from "@rapex/api-client";

type StoreHeroProps = {
  store: MerchantStore;
  onToggleStatus: () => void;
  toggling: boolean;
};

export function StoreHero({ store, onToggleStatus, toggling }: StoreHeroProps) {
  const theme = useTheme();

  return (
    <div
      style={{
        backgroundColor: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.sm }}>
          <h2 style={{ margin: 0, fontSize: theme.typography.fontSize.xl, color: theme.colors.textPrimary }}>{store.name}</h2>
          <Badge label={store.status === "online" ? "Online" : "Offline"} tone={store.status === "online" ? "success" : "neutral"} />
          <Badge
            label={`Approval: ${store.approvalStatus}`}
            tone={store.approvalStatus === "approved" ? "success" : store.approvalStatus === "pending" ? "warning" : "error"}
          />
        </div>
        <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>
          {store.category} · {store.address}
        </span>
        <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
          Coverage radius: {store.coverageRadiusKm} km · {store.productCount} products
          {store.rating > 0 ? ` · ${store.rating} ⭐` : " · No ratings yet"}
        </span>
      </div>
      <Button
        label={store.status === "online" ? "Set Offline" : "Set Online"}
        variant={store.status === "online" ? "secondary" : "primary"}
        loading={toggling}
        onClick={onToggleStatus}
      />
    </div>
  );
}
