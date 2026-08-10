import { useState } from "react";
import { Badge, useTheme } from "@rapex/ui-web";
import type { MerchantAccount } from "@rapex/api-client";

type HqTopHeaderProps = {
  account: MerchantAccount;
  storeMode: boolean;
  toggling: boolean;
  onToggleStoreMode: () => void;
};

export function HqTopHeader({ account, storeMode, toggling, onToggleStoreMode }: HqTopHeaderProps) {
  const theme = useTheme();
  const [customerPreview, setCustomerPreview] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: theme.spacing.lg,
        padding: `${theme.spacing.sm}px ${theme.spacing.lg}px`,
        flexWrap: "wrap",
      }}
    >
      <ToggleField label="Store Mode" value={storeMode} disabled={toggling} onChange={onToggleStoreMode} />
      <ToggleField label="Customer Preview" value={customerPreview} onChange={() => setCustomerPreview((v) => !v)} />

      <button
        type="button"
        style={{ position: "relative", border: "none", background: "none", cursor: "pointer", fontSize: 18 }}
        title="Notifications"
      >
        🔔
        <span
          style={{
            position: "absolute",
            top: -4,
            right: -4,
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: theme.colors.error,
          }}
        />
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.xs }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundColor: theme.colors.brandPrimary,
            color: theme.colors.textInverse,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: theme.typography.fontSize.sm,
            fontWeight: 700,
          }}
        >
          {account.ownerName.charAt(0)}
        </div>
        <div>
          <div style={{ fontSize: theme.typography.fontSize.sm, fontWeight: 600, color: theme.colors.textPrimary }}>{account.ownerName}</div>
          <Badge label="Merchant" tone="neutral" />
        </div>
      </div>
    </div>
  );
}

function ToggleField({ label, value, disabled, onChange }: { label: string; value: boolean; disabled?: boolean; onChange: () => void }) {
  const theme = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.xs }}>
      <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>{label}</span>
      <button
        type="button"
        disabled={disabled}
        onClick={onChange}
        style={{
          width: 40,
          height: 22,
          borderRadius: theme.radius.full,
          border: "none",
          backgroundColor: value ? theme.colors.success : theme.colors.surfaceAlt,
          cursor: disabled ? "default" : "pointer",
          position: "relative",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: value ? 20 : 2,
            width: 18,
            height: 18,
            borderRadius: "50%",
            backgroundColor: theme.colors.surface,
            transition: "left 0.15s ease",
          }}
        />
      </button>
      <span style={{ fontSize: theme.typography.fontSize.xs, fontWeight: 700, color: value ? theme.colors.success : theme.colors.textSecondary }}>
        {value ? "ON" : "OFF"}
      </span>
    </div>
  );
}
