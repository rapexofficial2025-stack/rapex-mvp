import { useTheme } from "@rapex/ui-web";
import type { MerchantAccount, MerchantProduct, MerchantStore } from "@rapex/api-client";

type StoreChecklistProps = {
  account: MerchantAccount;
  store: MerchantStore | null;
  products: MerchantProduct[];
};

export function StoreChecklist({ account, store, products }: StoreChecklistProps) {
  const theme = useTheme();

  const items = [
    { label: "Verify merchant account", done: account.verificationStatus === "verified" },
    { label: "Create your first store", done: !!store },
    { label: "Get store approved by Admin", done: store?.approvalStatus === "approved" },
    { label: "Add at least one product", done: products.length > 0 },
    { label: "Set a product in stock", done: products.some((p) => p.stock > 0) },
    { label: "Set store online", done: store?.status === "online" },
  ];

  const doneCount = items.filter((i) => i.done).length;

  return (
    <div
      style={{
        backgroundColor: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing.sm,
        minWidth: 240,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h4 style={{ margin: 0, fontSize: theme.typography.fontSize.base, color: theme.colors.textPrimary }}>Setup Checklist</h4>
        <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
          {doneCount}/{items.length}
        </span>
      </div>
      {items.map((item) => (
        <div key={item.label} style={{ display: "flex", alignItems: "center", gap: theme.spacing.xs }}>
          <span style={{ color: item.done ? theme.colors.success : theme.colors.textDisabled }}>{item.done ? "✓" : "○"}</span>
          <span
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: item.done ? theme.colors.textSecondary : theme.colors.textPrimary,
              textDecoration: item.done ? "line-through" : "none",
            }}
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
