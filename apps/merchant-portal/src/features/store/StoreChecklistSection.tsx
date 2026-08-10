import { useTheme } from "@rapex/ui-web";
import type { MerchantAccount, MerchantStore } from "@rapex/api-client";
import { HqSectionCard } from "./HqSectionCard";

type StoreChecklistSectionProps = {
  account: MerchantAccount;
  store: MerchantStore;
};

export function StoreChecklistSection({ account, store }: StoreChecklistSectionProps) {
  const theme = useTheme();

  const items = [
    { label: "Logo", done: !!store.logoLabel },
    { label: "Banner", done: !!store.coverImageLabel },
    { label: "Business Hours", done: !!store.businessHours },
    { label: "Products", done: store.productCount > 0 },
    { label: "Delivery Radius", done: store.coverageRadiusKm > 0 },
    { label: "Store Description", done: !!store.description },
    { label: "Verification", done: account.verificationStatus === "verified" },
  ];

  const doneCount = items.filter((i) => i.done).length;
  const percent = Math.round((doneCount / items.length) * 100);

  return (
    <HqSectionCard
      emoji="📋"
      title="Store Checklist"
      color="green"
      right={<span style={{ fontSize: theme.typography.fontSize.sm, fontWeight: 700, color: theme.colors.textPrimary }}>{percent}%</span>}
    >
      <div style={{ height: 8, borderRadius: theme.radius.full, backgroundColor: theme.colors.surfaceAlt, overflow: "hidden", marginBottom: theme.spacing.md }}>
        <div style={{ width: `${percent}%`, height: "100%", backgroundColor: theme.colors.success }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: theme.spacing.sm }}>
        {items.map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: theme.spacing.xs }}>
            <span style={{ color: item.done ? theme.colors.success : theme.colors.textDisabled }}>{item.done ? "✓" : "○"}</span>
            <span style={{ fontSize: theme.typography.fontSize.sm, color: item.done ? theme.colors.textSecondary : theme.colors.textPrimary }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </HqSectionCard>
  );
}
