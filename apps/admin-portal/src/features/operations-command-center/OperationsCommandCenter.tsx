import { useMemo, useState } from "react";
import { useTheme } from "@rapex/ui-web";
import { KpiBar } from "./KpiBar";
import { FilterPanel } from "./FilterPanel";
import { MapPlaceholder } from "./MapPlaceholder";
import { ActivityFeed } from "./ActivityFeed";
import { MerchantInfoCard } from "./MerchantInfoCard";
import { RiderInfoCard } from "./RiderInfoCard";
import { MOCK_RIDERS, MOCK_MERCHANTS, MOCK_ACTIVITY } from "./mockData";
import type { MapFilter, Merchant, MerchantCategory, Rider } from "./types";

const CATEGORY_FILTER_VALUES: MerchantCategory[] = ["Food", "Marketplace", "Hardware", "Industrial", "Services", "Auction", "Provider"];

export function OperationsCommandCenter() {
  const theme = useTheme();
  const [activeFilters, setActiveFilters] = useState<Set<MapFilter>>(new Set());
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);

  const toggleFilter = (filter: MapFilter) => {
    setActiveFilters((current) => {
      const next = new Set(current);
      if (next.has(filter)) {
        next.delete(filter);
      } else {
        next.add(filter);
      }
      return next;
    });
  };

  const showRiders = !activeFilters.has("all-merchants") || activeFilters.has("all-riders") || activeFilters.size === 0;
  const showMerchants = !activeFilters.has("all-riders") || activeFilters.has("all-merchants") || activeFilters.size === 0;

  const visibleRiders = useMemo(() => {
    if (!showRiders) return [];
    if (activeFilters.has("offline-only")) return MOCK_RIDERS.filter((r) => r.status === "offline");
    if (activeFilters.has("busy-only")) return MOCK_RIDERS.filter((r) => r.status === "online-delivering");
    if (activeFilters.has("barangay-riders-only")) return MOCK_RIDERS.filter((r) => r.status === "barangay-dedicated");
    if (activeFilters.has("online-only")) {
      return MOCK_RIDERS.filter((r) => r.status === "online-available" || r.status === "online-delivering");
    }
    return MOCK_RIDERS;
  }, [activeFilters, showRiders]);

  const visibleMerchants = useMemo(() => {
    if (!showMerchants) return [];
    const selectedCategories = CATEGORY_FILTER_VALUES.filter((c) => activeFilters.has(c));
    let result = MOCK_MERCHANTS;
    if (selectedCategories.length > 0) {
      result = result.filter((m) => selectedCategories.includes(m.category));
    }
    if (activeFilters.has("offline-only")) result = result.filter((m) => m.status === "closed");
    if (activeFilters.has("busy-only")) result = result.filter((m) => m.status === "busy");
    if (activeFilters.has("online-only")) result = result.filter((m) => m.status === "open" || m.status === "busy");
    return result;
  }, [activeFilters, showMerchants]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: theme.colors.background }}>
      <KpiBar riders={MOCK_RIDERS} merchants={MOCK_MERCHANTS} />
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <FilterPanel activeFilters={activeFilters} onToggle={toggleFilter} />
        <div style={{ flex: 1, position: "relative", display: "flex" }}>
          <MapPlaceholder
            riders={visibleRiders}
            merchants={visibleMerchants}
            onSelectRider={(rider) => {
              setSelectedMerchant(null);
              setSelectedRider(rider);
            }}
            onSelectMerchant={(merchant) => {
              setSelectedRider(null);
              setSelectedMerchant(merchant);
            }}
          />
          {selectedMerchant ? (
            <MerchantInfoCard merchant={selectedMerchant} onClose={() => setSelectedMerchant(null)} />
          ) : null}
          {selectedRider ? <RiderInfoCard rider={selectedRider} onClose={() => setSelectedRider(null)} /> : null}
        </div>
        <ActivityFeed events={MOCK_ACTIVITY} />
      </div>
    </div>
  );
}
