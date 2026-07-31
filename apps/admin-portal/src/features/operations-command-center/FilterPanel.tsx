import { useTheme } from "@rapex/ui-web";
import type { MapFilter, MerchantCategory } from "./types";

const CATEGORY_FILTERS: MerchantCategory[] = ["Food", "Marketplace", "Hardware", "Industrial", "Services", "Auction", "Provider"];

type FilterPanelProps = {
  activeFilters: Set<MapFilter>;
  onToggle: (filter: MapFilter) => void;
};

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  const theme = useTheme();

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        textAlign: "left",
        border: "none",
        borderRadius: theme.radius.sm,
        padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
        backgroundColor: active ? theme.colors.brandPrimary : "transparent",
        color: active ? theme.colors.textInverse : theme.colors.textPrimary,
        fontSize: theme.typography.fontSize.sm,
        fontFamily: "inherit",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

export function FilterPanel({ activeFilters, onToggle }: FilterPanelProps) {
  const theme = useTheme();

  return (
    <div
      style={{
        width: 220,
        backgroundColor: theme.colors.surface,
        borderRight: `1px solid ${theme.colors.border}`,
        padding: theme.spacing.lg,
        overflowY: "auto",
      }}
    >
      <div style={{ fontSize: theme.typography.fontSize.sm, fontWeight: 700, marginBottom: theme.spacing.sm, color: theme.colors.textSecondary }}>
        Entities
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.xxs, marginBottom: theme.spacing.lg }}>
        <FilterButton label="All Riders" active={activeFilters.has("all-riders")} onClick={() => onToggle("all-riders")} />
        <FilterButton
          label="All Merchants"
          active={activeFilters.has("all-merchants")}
          onClick={() => onToggle("all-merchants")}
        />
      </div>

      <div style={{ fontSize: theme.typography.fontSize.sm, fontWeight: 700, marginBottom: theme.spacing.sm, color: theme.colors.textSecondary }}>
        Category
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.xxs, marginBottom: theme.spacing.lg }}>
        {CATEGORY_FILTERS.map((category) => (
          <FilterButton
            key={category}
            label={category}
            active={activeFilters.has(category)}
            onClick={() => onToggle(category)}
          />
        ))}
      </div>

      <div style={{ fontSize: theme.typography.fontSize.sm, fontWeight: 700, marginBottom: theme.spacing.sm, color: theme.colors.textSecondary }}>
        Status
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.xxs }}>
        <FilterButton label="Only Online" active={activeFilters.has("online-only")} onClick={() => onToggle("online-only")} />
        <FilterButton
          label="Only Offline"
          active={activeFilters.has("offline-only")}
          onClick={() => onToggle("offline-only")}
        />
        <FilterButton label="Only Busy" active={activeFilters.has("busy-only")} onClick={() => onToggle("busy-only")} />
        <FilterButton
          label="Only Barangay Riders"
          active={activeFilters.has("barangay-riders-only")}
          onClick={() => onToggle("barangay-riders-only")}
        />
      </div>
    </div>
  );
}
