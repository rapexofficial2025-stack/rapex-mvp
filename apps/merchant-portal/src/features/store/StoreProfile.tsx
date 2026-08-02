import { useState } from "react";
import { Button, GlassCard, useTheme } from "@rapex/ui-web";
import type { MerchantStore } from "@rapex/api-client";
import { EditStoreProfileModal } from "./EditStoreProfileModal";

type StoreProfileProps = {
  store: MerchantStore;
  onUpdated: () => void;
};

export function StoreProfile({ store, onUpdated }: StoreProfileProps) {
  const theme = useTheme();
  const [editing, setEditing] = useState(false);

  return (
    <GlassCard>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: theme.spacing.md }}>
        <div style={{ display: "flex", gap: theme.spacing.md }}>
          <div style={{ fontSize: 40, lineHeight: 1 }}>{store.logoLabel}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <h3 style={{ margin: 0, fontSize: theme.typography.fontSize.lg, color: theme.colors.textPrimary }}>Store Profile</h3>
            <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>{store.description}</span>
          </div>
        </div>
        <Button label="Edit Profile" size="sm" variant="outline" onClick={() => setEditing(true)} />
      </div>

      <div
        style={{
          marginTop: theme.spacing.md,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: theme.spacing.md,
        }}
      >
        <ProfileField label="Phone" value={store.phone} theme={theme} />
        <ProfileField label="Business Hours" value={store.businessHours} theme={theme} />
        <ProfileField label="Address" value={store.address} theme={theme} />
        <ProfileField label="Cover Image" value={store.coverImageLabel} theme={theme} />
      </div>

      {editing ? (
        <EditStoreProfileModal
          store={store}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            onUpdated();
          }}
        />
      ) : null}
    </GlassCard>
  );
}

function ProfileField({ label, value, theme }: { label: string; value: string; theme: ReturnType<typeof useTheme> }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>{label}</span>
      <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textPrimary }}>{value}</span>
    </div>
  );
}
