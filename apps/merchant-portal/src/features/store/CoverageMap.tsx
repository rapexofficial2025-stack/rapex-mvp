import { useEffect, useState } from "react";
import { APIProvider, Map, Marker, useMap } from "@vis.gl/react-google-maps";
import { GlassCard, Input, useTheme, Button, ErrorState } from "@rapex/ui-web";
import { useUpdateStoreAction, type MerchantStore } from "@rapex/api-client";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

type CoverageMapProps = {
  store: MerchantStore;
  onUpdated: () => void;
};

function CoverageCircle({ center, radiusMeters }: { center: { lat: number; lng: number }; radiusMeters: number }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const circle = new google.maps.Circle({
      map,
      center,
      radius: radiusMeters,
      strokeColor: "#7C3AED",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#7C3AED",
      fillOpacity: 0.15,
    });
    return () => circle.setMap(null);
  }, [map, center.lat, center.lng, radiusMeters]);

  return null;
}

export function CoverageMap({ store, onUpdated }: CoverageMapProps) {
  const theme = useTheme();
  const [radiusInput, setRadiusInput] = useState(String(store.coverageRadiusKm));
  const updateStore = useUpdateStoreAction();
  const center = { lat: store.latitude, lng: store.longitude };

  return (
    <GlassCard>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.md }}>
        <h3 style={{ margin: 0, fontSize: theme.typography.fontSize.lg, color: theme.colors.textPrimary }}>Coverage Map</h3>
        <div style={{ display: "flex", alignItems: "flex-end", gap: theme.spacing.sm }}>
          <Input
            label="Coverage Radius (km)"
            type="number"
            value={radiusInput}
            onChange={(e) => setRadiusInput(e.target.value)}
          />
          <Button
            label="Update"
            size="sm"
            loading={updateStore.loading}
            disabled={!radiusInput || Number(radiusInput) === store.coverageRadiusKm}
            onClick={async () => {
              await updateStore.execute(store.id, { coverageRadiusKm: Number(radiusInput) });
              onUpdated();
            }}
          />
        </div>
      </div>

      {updateStore.error ? <ErrorState description={updateStore.error} /> : null}

      {!GOOGLE_MAPS_API_KEY ? (
        <div
          style={{
            border: `1px dashed ${theme.colors.border}`,
            borderRadius: theme.radius.md,
            padding: theme.spacing.xl,
            textAlign: "center",
            color: theme.colors.textSecondary,
            fontSize: theme.typography.fontSize.sm,
          }}
        >
          Set VITE_GOOGLE_MAPS_API_KEY to enable the interactive map.
          <br />
          Store location: {store.address} · Coverage radius: {store.coverageRadiusKm} km
        </div>
      ) : (
        <div style={{ height: 360, borderRadius: theme.radius.md, overflow: "hidden" }}>
          <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <Map defaultCenter={center} defaultZoom={13} gestureHandling="greedy" disableDefaultUI={false}>
              <Marker position={center} title={store.name} />
              <CoverageCircle center={center} radiusMeters={store.coverageRadiusKm * 1000} />
            </Map>
          </APIProvider>
        </div>
      )}
    </GlassCard>
  );
}
