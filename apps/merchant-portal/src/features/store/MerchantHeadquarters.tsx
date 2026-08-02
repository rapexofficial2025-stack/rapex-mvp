import { Badge, GlassCard, Loading, useTheme } from "@rapex/ui-web";
import { useStoreSlots, type MerchantAccount, type StoreSlot } from "@rapex/api-client";

type MerchantHeadquartersProps = {
  account: MerchantAccount;
  selectedStoreId: string | null;
  onSelectStore: (storeId: string) => void;
  onRegisterBusiness: () => void;
};

export function MerchantHeadquarters({ account, selectedStoreId, onSelectStore, onRegisterBusiness }: MerchantHeadquartersProps) {
  const theme = useTheme();
  const { data: slots, loading } = useStoreSlots();
  const xpPercent = Math.min(100, Math.round((account.xp / account.xpForNextLevel) * 100));

  return (
    <div
      style={{
        width: 280,
        borderRight: `1px solid ${theme.colors.border}`,
        padding: theme.spacing.md,
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing.md,
        overflowY: "auto",
      }}
    >
      <GlassCard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: theme.typography.fontSize.sm, fontWeight: 700, color: theme.colors.textSecondary }}>
            Merchant Headquarters
          </span>
          <Badge label={`★★★★★ Lvl ${account.level}`} tone="accent" />
        </div>
        <div style={{ marginTop: theme.spacing.sm }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
            <span>Merchant XP</span>
            <span>{account.xp} / {account.xpForNextLevel}</span>
          </div>
          <div style={{ marginTop: 4, height: 8, borderRadius: theme.radius.full, backgroundColor: theme.colors.surfaceAlt, overflow: "hidden" }}>
            <div style={{ width: `${xpPercent}%`, height: "100%", backgroundColor: theme.colors.accent }} />
          </div>
        </div>
      </GlassCard>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.xs }}>
          <span style={{ fontSize: theme.typography.fontSize.sm, fontWeight: 700, color: theme.colors.textSecondary }}>My Stores</span>
        </div>

        {loading || !slots ? (
          <Loading label="Loading store slots…" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
            {slots.map((slot) => (
              <StoreSlotCard
                key={slot.index}
                slot={slot}
                selected={slot.store?.id === selectedStoreId}
                onSelect={onSelectStore}
                onRegisterBusiness={onRegisterBusiness}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StoreSlotCard({
  slot,
  selected,
  onSelect,
  onRegisterBusiness,
}: {
  slot: StoreSlot;
  selected: boolean;
  onSelect: (storeId: string) => void;
  onRegisterBusiness: () => void;
}) {
  const theme = useTheme();

  if (slot.store) {
    return (
      <button
        type="button"
        onClick={() => onSelect(slot.store!.id)}
        style={{
          textAlign: "left",
          border: `1px solid ${selected ? theme.colors.brandPrimary : theme.colors.border}`,
          borderRadius: theme.radius.md,
          padding: theme.spacing.sm,
          backgroundColor: selected ? theme.colors.surfaceAlt : theme.colors.surface,
          cursor: "pointer",
          fontFamily: "inherit",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <span style={{ fontSize: theme.typography.fontSize.sm, fontWeight: 600, color: theme.colors.textPrimary }}>
          🏪 {slot.store.name}
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          <Badge label={slot.store.status === "online" ? "Online" : "Offline"} tone={slot.store.status === "online" ? "success" : "neutral"} />
          <Badge label={slot.index === 0 ? "Main" : slot.label} tone="neutral" />
        </div>
      </button>
    );
  }

  if (slot.status === "available") {
    return (
      <button
        type="button"
        onClick={onRegisterBusiness}
        style={{
          textAlign: "left",
          border: `1px dashed ${theme.colors.brandPrimary}`,
          borderRadius: theme.radius.md,
          padding: theme.spacing.sm,
          backgroundColor: "transparent",
          cursor: "pointer",
          fontFamily: "inherit",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <span style={{ fontSize: theme.typography.fontSize.sm, fontWeight: 600, color: theme.colors.brandPrimary }}>
          🏪 {slot.label}
        </span>
        <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>+ Register this business</span>
      </button>
    );
  }

  return (
    <div
      style={{
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.md,
        padding: theme.spacing.sm,
        opacity: 0.5,
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <span style={{ fontSize: theme.typography.fontSize.sm, fontWeight: 600, color: theme.colors.textPrimary }}>
        🔒 {slot.label}
      </span>
      <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
        Unlock at Merchant Level {slot.unlockLevel}
      </span>
    </div>
  );
}
