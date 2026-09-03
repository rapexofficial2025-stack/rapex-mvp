import { useTheme } from "@rapex/ui-web";
import type { MapFilter, MerchantCategory } from "./types";

const CATEGORY_FILTERS: MerchantCategory[] = ["Food", "Marketplace", "Hardware", "Industrial", "Services", "Auction", "Provider"];

type FilterPanelProps = {
  activeFilters: Set<MapFilter>;
  onToggle: (filter: MapFilter) => void;
  municipalities: string[];
  selectedMunicipality: string | null;
  onMunicipalityChange: (municipality: string | null) => void;
  barangays: string[];
  selectedBarangay: string | null;
  onBarangayChange: (barangay: string | null) => void;
  sortByHighestTransaction: boolean;
  onToggleSort: () => void;
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

const selectStyle = (theme: ReturnType<typeof useTheme>) => ({
  width: "100%",
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radius.sm,
  padding: `${theme.spacing.xxs}px ${theme.spacing.sm}px`,
  backgroundColor: theme.colors.surfaceAlt,
  color: theme.colors.textPrimary,
  fontSize: theme.typography.fontSize.sm,
  fontFamily: "inherit",
});

export function FilterPanel({
  activeFilters,
  onToggle,
  municipalities,
  selectedMunicipality,
  onMunicipalityChange,
  barangays,
  selectedBarangay,
  onBarangayChange,
  sortByHighestTransaction,
  onToggleSort,
}: FilterPanelProps) {
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
        Location
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.xs, marginBottom: theme.spacing.lg }}>
        <select
          style={selectStyle(theme)}
          value={selectedMunicipality ?? ""}
          onChange={(event) => onMunicipalityChange(event.target.value || null)}
        >
          <option value="">All municipalities</option>
          {municipalities.map((municipality) => (
            <option key={municipality} value={municipality}>{municipality}</option>
          ))}
        </select>
        <select
          style={selectStyle(theme)}
          value={selectedBarangay ?? ""}
          onChange={(event) => onBarangayChange(event.target.value || null)}
        >
          <option value="">All barangays</option>
          {barangays.map((barangay) => (
            <option key={barangay} value={barangay}>{barangay}</option>
          ))}
        </select>
      </div>

      <div style={{ fontSize: theme.typography.fontSize.sm, fontWeight: 700, marginBottom: theme.spacing.sm, color: theme.colors.textSecondary }}>
        Sort
      </div>
      <div style={{ marginBottom: theme.spacing.lg }}>
        <FilterButton label="Highest Transaction First" active={sortByHighestTransaction} onClick={onToggleSort} />
      </div>

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
