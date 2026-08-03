import { useState } from "react";
import { Badge, Loading, useTheme } from "@rapex/ui-web";
import { useStoreSlots, type MerchantAccount, type StoreSlot } from "@rapex/api-client";
import { HqSectionCard } from "./HqSectionCard";
import { LevelDetailsModal } from "./LevelDetailsModal";

type StoreExpansionSectionProps = {
  account: MerchantAccount;
  selectedStoreId: string | null;
  onSelectStore: (storeId: string) => void;
  onAddStore: () => void;
};

export function StoreExpansionSection({ account, selectedStoreId, onSelectStore, onAddStore }: StoreExpansionSectionProps) {
  const theme = useTheme();
  const { data: slots, loading } = useStoreSlots();
  const [levelModal, setLevelModal] = useState<number | null>(null);

  const filledCount = slots?.filter((s) => s.store).length ?? 0;
  const firstEmptyIndex = slots?.findIndex((s) => !s.store) ?? -1;

  return (
    <HqSectionCard
      emoji="🏆"
      title="Store Expansion"
      color="gold"
      right={
        <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>
          Available Slots: {filledCount} / {slots?.length ?? 10}
        </span>
      }
    >
      <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>
        Unlock more store slots as you level up.
      </span>

      {loading || !slots ? (
        <Loading label="Loading store slots…" />
      ) : (
        <div style={{ display: "flex", gap: theme.spacing.md, overflowX: "auto", padding: `${theme.spacing.sm}px 0` }}>
          {slots.map((slot) =>
            slot.store ? (
              <FilledSlotCard key={slot.index} slot={slot} selected={slot.store.id === selectedStoreId} onSelect={onSelectStore} />
            ) : slot.index === firstEmptyIndex ? (
              <AddSlotCard key={slot.index} onClick={onAddStore} />
            ) : (
              <LockedSlotCard key={slot.index} slot={slot} onClick={() => setLevelModal(slot.unlockLevel)} />
            ),
          )}
        </div>
      )}

      {levelModal !== null ? (
        <LevelDetailsModal unlockLevel={levelModal} account={account} onClose={() => setLevelModal(null)} />
      ) : null}
    </HqSectionCard>
  );
}

function FilledSlotCard({ slot, selected, onSelect }: { slot: StoreSlot; selected: boolean; onSelect: (id: string) => void }) {
  const theme = useTheme();
  const store = slot.store!;
  return (
    <button
      type="button"
      onClick={() => onSelect(store.id)}
      style={{
        minWidth: 200,
        textAlign: "left",
        border: `2px solid ${selected ? theme.colors.brandPrimary : theme.colors.border}`,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        cursor: "pointer",
        fontFamily: "inherit",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 28 }}>{store.logoLabel}</span>
      <span style={{ fontSize: theme.typography.fontSize.sm, fontWeight: 700, color: theme.colors.textPrimary }}>{store.name}</span>
      <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>{store.address}</span>
      <Badge label={slot.index === 0 ? "Main Store" : "Sub Store"} tone={slot.index === 0 ? "brand" : "neutral"} />
    </button>
  );
}

function AddSlotCard({ onClick }: { onClick: () => void }) {
  const theme = useTheme();
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minWidth: 200,
        border: `2px dashed ${theme.colors.brandPrimary}`,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        backgroundColor: "transparent",
        cursor: "pointer",
        fontFamily: "inherit",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 32, color: theme.colors.brandPrimary }}>+</span>
      <span style={{ fontSize: theme.typography.fontSize.sm, fontWeight: 700, color: theme.colors.brandPrimary }}>Create New Branch</span>
      <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary, textAlign: "center" }}>
        You can create a new branch
      </span>
    </button>
  );
}

function LockedSlotCard({ slot, onClick }: { slot: StoreSlot; onClick: () => void }) {
  const theme = useTheme();
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minWidth: 200,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        backgroundColor: theme.colors.surfaceAlt,
        cursor: "pointer",
        fontFamily: "inherit",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        opacity: 0.7,
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 24 }}>🔒</span>
      <span style={{ fontSize: theme.typography.fontSize.sm, fontWeight: 700, color: theme.colors.textPrimary }}>Level {slot.unlockLevel}</span>
      <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary, textAlign: "center" }}>
        Reach Level {slot.unlockLevel} to unlock
      </span>
    </button>
  );
}
