import { Badge, Button, useTheme } from "@rapex/ui-web";
import type { MerchantStore } from "@rapex/api-client";

type StoreDirectoryProps = {
  stores: MerchantStore[];
  selectedStoreId: string | null;
  onSelect: (storeId: string) => void;
  onAddStore: () => void;
};

export function StoreDirectory({ stores, selectedStoreId, onSelect, onAddStore }: StoreDirectoryProps) {
  const theme = useTheme();

  return (
    <div
      style={{
        width: 260,
        borderRight: `1px solid ${theme.colors.border}`,
        padding: theme.spacing.md,
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing.sm,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: theme.typography.fontSize.sm, fontWeight: 700, color: theme.colors.textSecondary }}>
          My Stores
        </span>
        <Button label="+ Add" size="sm" variant="outline" onClick={onAddStore} />
      </div>
      {stores.map((store) => (
        <button
          key={store.id}
          type="button"
          onClick={() => onSelect(store.id)}
          style={{
            textAlign: "left",
            border: `1px solid ${store.id === selectedStoreId ? theme.colors.brandPrimary : theme.colors.border}`,
            borderRadius: theme.radius.md,
            padding: theme.spacing.sm,
            backgroundColor: store.id === selectedStoreId ? theme.colors.surfaceAlt : theme.colors.surface,
            cursor: "pointer",
            fontFamily: "inherit",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <span style={{ fontSize: theme.typography.fontSize.sm, fontWeight: 600, color: theme.colors.textPrimary }}>
            {store.name}
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            <Badge label={store.status === "online" ? "Online" : "Offline"} tone={store.status === "online" ? "success" : "neutral"} />
            <Badge
              label={store.approvalStatus}
              tone={store.approvalStatus === "approved" ? "success" : store.approvalStatus === "pending" ? "warning" : "error"}
            />
          </div>
        </button>
      ))}
    </div>
  );
}
