import { useMemo, useState } from "react";
import { Badge, useTheme } from "@rapex/ui-web";
import { KpiBar } from "./KpiBar";
import { FilterPanel } from "./FilterPanel";
import { LiveMapView } from "./LiveMapView";
import { ActivityFeed } from "./ActivityFeed";
import { MerchantInfoCard } from "./MerchantInfoCard";
import { RiderInfoCard } from "./RiderInfoCard";
import { MapAccessPanel } from "./MapAccessPanel";
import { MOCK_RIDERS, MOCK_MERCHANTS, MOCK_ACTIVITY } from "./mockData";
import type { MapFilter, Merchant, MerchantCategory, Rider } from "./types";

const MAPS_CONFIGURED = Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);

const CATEGORY_FILTER_VALUES: MerchantCategory[] = ["Food", "Marketplace", "Hardware", "Industrial", "Services", "Auction", "Provider"];

export function OperationsCommandCenter() {
  const theme = useTheme();
  const [activeFilters, setActiveFilters] = useState<Set<MapFilter>>(new Set());
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [showMapSettings, setShowMapSettings] = useState(false);
  const [showGeoFencePanel, setShowGeoFencePanel] = useState(false);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null);
  const [selectedBarangay, setSelectedBarangay] = useState<string | null>(null);
  const [sortByHighestTransaction, setSortByHighestTransaction] = useState(false);

  const municipalities = useMemo(
    () => Array.from(new Set([...MOCK_RIDERS.map((r) => r.municipality), ...MOCK_MERCHANTS.map((m) => m.municipality)])).sort(),
    [],
  );
  const barangays = useMemo(() => {
    const scoped = selectedMunicipality
      ? [
          ...MOCK_RIDERS.filter((r) => r.municipality === selectedMunicipality),
          ...MOCK_MERCHANTS.filter((m) => m.municipality === selectedMunicipality),
        ]
      : [...MOCK_RIDERS, ...MOCK_MERCHANTS];
    return Array.from(new Set(scoped.map((entity) => entity.barangay))).sort();
  }, [selectedMunicipality]);

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
    let result = MOCK_RIDERS;
    if (activeFilters.has("offline-only")) result = result.filter((r) => r.status === "offline");
    else if (activeFilters.has("busy-only")) result = result.filter((r) => r.status === "online-delivering");
    else if (activeFilters.has("barangay-riders-only")) result = result.filter((r) => r.status === "barangay-dedicated");
    else if (activeFilters.has("online-only")) {
      result = result.filter((r) => r.status === "online-available" || r.status === "online-delivering");
    }
    if (selectedMunicipality) result = result.filter((r) => r.municipality === selectedMunicipality);
    if (selectedBarangay) result = result.filter((r) => r.barangay === selectedBarangay);
    if (sortByHighestTransaction) result = [...result].sort((a, b) => b.currentEarnings - a.currentEarnings);
    return result;
  }, [activeFilters, showRiders, selectedMunicipality, selectedBarangay, sortByHighestTransaction]);

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
    if (selectedMunicipality) result = result.filter((m) => m.municipality === selectedMunicipality);
    if (selectedBarangay) result = result.filter((m) => m.barangay === selectedBarangay);
    if (sortByHighestTransaction) result = [...result].sort((a, b) => b.revenueToday - a.revenueToday);
    return result;
  }, [activeFilters, showMerchants, selectedMunicipality, selectedBarangay, sortByHighestTransaction]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: theme.colors.background, position: "relative" }}>
      <div style={{ position: "absolute", top: theme.spacing.sm, right: theme.spacing.sm, zIndex: 3, display: "flex", gap: theme.spacing.sm, alignItems: "center" }}>
        <Badge
          label={MAPS_CONFIGURED ? "Live map tiles — rider/merchant positions are still placeholder data" : "Placeholder map data — Xano endpoint + Maps key required"}
          tone="warning"
        />
        {MAPS_CONFIGURED ? (
          <button type="button" onClick={() => setShowGeoFencePanel(true)} style={{ border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.sm, padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`, background: theme.colors.surface, color: theme.colors.textPrimary, font: "inherit", fontSize: theme.typography.fontSize.sm, fontWeight: 700, cursor: "pointer" }}>Geo-fencing</button>
        ) : null}
        <button type="button" onClick={() => setShowMapSettings(true)} style={{ border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.sm, padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`, background: theme.colors.surface, color: theme.colors.textPrimary, font: "inherit", fontSize: theme.typography.fontSize.sm, fontWeight: 700, cursor: "pointer" }}>Map access settings</button>
      </div>
      <KpiBar riders={MOCK_RIDERS} merchants={MOCK_MERCHANTS} />
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <FilterPanel
          activeFilters={activeFilters}
          onToggle={toggleFilter}
          municipalities={municipalities}
          selectedMunicipality={selectedMunicipality}
          onMunicipalityChange={(municipality) => {
            setSelectedMunicipality(municipality);
            setSelectedBarangay(null);
          }}
          barangays={barangays}
          selectedBarangay={selectedBarangay}
          onBarangayChange={setSelectedBarangay}
          sortByHighestTransaction={sortByHighestTransaction}
          onToggleSort={() => setSortByHighestTransaction((value) => !value)}
        />
        <div style={{ flex: 1, position: "relative", display: "flex" }}>
          <LiveMapView
            riders={visibleRiders}
            merchants={visibleMerchants}
            showGeoFencePanel={showGeoFencePanel}
            onCloseGeoFencePanel={() => setShowGeoFencePanel(false)}
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
          {showMapSettings ? <MapAccessPanel onClose={() => setShowMapSettings(false)} /> : null}
        </div>
        <ActivityFeed events={MOCK_ACTIVITY} />
      </div>
    </div>
  );
}
