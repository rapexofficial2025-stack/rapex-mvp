import { useMemo, useState } from "react";
import { GoogleMapView, type MapGeoFence, type MapMarker } from "@rapex/ui-web";
import { MapPlaceholder } from "./MapPlaceholder";
import { GeoFencePanel } from "./GeoFencePanel";
import { percentToLatLng, PILOT_AREA_CENTER } from "./coords";
import type { Merchant, Rider } from "./types";

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

type LiveMapViewProps = {
  riders: Rider[];
  merchants: Merchant[];
  onSelectRider: (rider: Rider) => void;
  onSelectMerchant: (merchant: Merchant) => void;
  showGeoFencePanel: boolean;
  onCloseGeoFencePanel: () => void;
};

/**
 * Real Google Maps rendering once VITE_GOOGLE_MAPS_API_KEY is set (falls
 * back to the existing CSS MapPlaceholder otherwise -- same "architecture
 * complete, never claimed to render without a real billing-enabled key"
 * discipline as GoogleMapView itself). Rider/merchant positions still come
 * from this screen's mock data (see coords.ts) -- only the map *rendering*
 * is real here, not the entity positions, which need a confirmed Xano
 * live-location endpoint.
 */
export function LiveMapView({ riders, merchants, onSelectRider, onSelectMerchant, showGeoFencePanel, onCloseGeoFencePanel }: LiveMapViewProps) {
  const [geoFence, setGeoFence] = useState<MapGeoFence>({
    id: "pilot-coverage",
    center: PILOT_AREA_CENTER,
    radiusMeters: 12000,
    label: "Pilot delivery coverage",
  });

  const markers = useMemo<MapMarker[]>(() => {
    const toMarker = (id: string, role: MapMarker["role"], label: string, x: number, y: number): MapMarker => {
      const { lat, lng } = percentToLatLng(x, y);
      return { id, role, label, latitude: lat, longitude: lng };
    };
    return [
      ...riders.map((rider) => toMarker(`rider-${rider.id}`, "rider", rider.name, rider.x, rider.y)),
      ...merchants.map((merchant) => toMarker(`merchant-${merchant.id}`, "merchant", merchant.storeName, merchant.x, merchant.y)),
    ];
  }, [riders, merchants]);

  if (!MAPS_API_KEY) {
    return <MapPlaceholder riders={riders} merchants={merchants} onSelectRider={onSelectRider} onSelectMerchant={onSelectMerchant} />;
  }

  return (
    <div style={{ flex: 1, position: "relative", display: "flex" }}>
      <GoogleMapView
        apiKey={MAPS_API_KEY}
        markers={markers}
        center={geoFence.center}
        zoom={12}
        height="100%"
        geoFences={[geoFence]}
        darkMode
        onMarkerClick={(marker) => {
          if (marker.id.startsWith("rider-")) {
            const rider = riders.find((r) => `rider-${r.id}` === marker.id);
            if (rider) onSelectRider(rider);
            return;
          }
          const merchant = merchants.find((m) => `merchant-${m.id}` === marker.id);
          if (merchant) onSelectMerchant(merchant);
        }}
      />
      {showGeoFencePanel ? <GeoFencePanel geoFence={geoFence} onChange={setGeoFence} onClose={onCloseGeoFencePanel} /> : null}
    </div>
  );
}
