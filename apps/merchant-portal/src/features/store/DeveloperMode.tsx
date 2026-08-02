import { Badge, GlassCard, useTheme } from "@rapex/ui-web";
import type { MerchantAccount, MerchantProduct, MerchantStore } from "@rapex/api-client";

type DeveloperModeProps = {
  account: MerchantAccount;
  store: MerchantStore | null;
  products: MerchantProduct[];
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

export function DeveloperMode({ account, store, products }: DeveloperModeProps) {
  const theme = useTheme();

  return (
    <GlassCard>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.md }}>
        <h3 style={{ margin: 0, fontSize: theme.typography.fontSize.lg, color: theme.colors.textPrimary }}>Developer Mode</h3>
        <Badge label={API_BASE_URL ? "Xano-ready" : "Mock Repository"} tone={API_BASE_URL ? "success" : "warning"} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
        <DevRow label="Repository Mode" value={API_BASE_URL ? "Configured (VITE_API_BASE_URL set)" : "Mock (in-memory, no backend calls)"} theme={theme} />
        <DevRow label="API Base URL" value={API_BASE_URL || "(not set)"} theme={theme} />
        <DevRow label="Merchant Account ID" value={account.id} theme={theme} />
        <DevRow label="Selected Store ID" value={store?.id ?? "(none)"} theme={theme} />
      </div>

      <div style={{ marginTop: theme.spacing.lg, display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
        <DevJsonBlock label="Merchant Account" value={account} theme={theme} />
        <DevJsonBlock label="Selected Store" value={store} theme={theme} />
        <DevJsonBlock label="Store Products" value={products} theme={theme} />
      </div>
    </GlassCard>
  );
}

function DevRow({ label, value, theme }: { label: string; value: string; theme: ReturnType<typeof useTheme> }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: theme.typography.fontSize.sm }}>
      <span style={{ color: theme.colors.textSecondary }}>{label}</span>
      <span style={{ color: theme.colors.textPrimary, fontFamily: "monospace" }}>{value}</span>
    </div>
  );
}

function DevJsonBlock({ label, value, theme }: { label: string; value: unknown; theme: ReturnType<typeof useTheme> }) {
  return (
    <details>
      <summary style={{ cursor: "pointer", fontSize: theme.typography.fontSize.sm, fontWeight: 600, color: theme.colors.textPrimary }}>
        {label}
      </summary>
      <pre
        style={{
          backgroundColor: theme.colors.surfaceAlt,
          borderRadius: theme.radius.md,
          padding: theme.spacing.md,
          fontSize: theme.typography.fontSize.xs,
          overflowX: "auto",
          color: theme.colors.textPrimary,
        }}
      >
        {JSON.stringify(value, null, 2)}
      </pre>
    </details>
  );
}
