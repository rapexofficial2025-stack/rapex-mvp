import { useMemo } from "react";
import { CircleF, GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import { MAP_MARKER_COLORS, type MapMarkerRole } from "@rapex/constants";

/**
 * Prepared, not yet wired into any screen -- architecture + dependency only.
 *
 * The existing map screens (admin Operations Command Center, merchant
 * Coverage Map) render mock x/y percentage positions on a CSS placeholder,
 * not real latitude/longitude -- wiring this component into them would mean
 * redesigning those screens' data model, which is out of scope here. This
 * exists so a real map can be dropped in once a screen actually has
 * lat/lng data (from a real Xano endpoint or real GPS capture) to show.
 *
 * Requires VITE_GOOGLE_MAPS_API_KEY to be set (see each portal's
 * .env.example) -- never hardcode the key. Do not claim this "works" until
 * it has actually rendered a map in a browser with a real, billing-enabled
 * Google Maps API key; useJsApiLoader's `isLoaded`/`loadError` below make
 * that state explicit instead of assuming success.
 */
export type MapMarker = {
  id: string;
  role: MapMarkerRole;
  latitude: number;
  longitude: number;
  label?: string;
};

/** A service-coverage / geo-fence boundary drawn as a circle on the map. */
export type MapGeoFence = {
  id: string;
  center: { lat: number; lng: number };
  radiusMeters: number;
  label?: string;
  color?: string;
};

export type GoogleMapViewProps = {
  apiKey: string;
  markers: MapMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: number | string;
  onMarkerClick?: (marker: MapMarker) => void;
  geoFences?: MapGeoFence[];
  /** Applies Google's dark map style -- for ops/monitoring screens designed for a permanent night theme, independent of the app's own light/dark mode toggle. */
  darkMode?: boolean;
};

/** Standard Google Maps "night mode" style array -- same one used across most dark-themed ops dashboards. */
const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8d88a8" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#c9c6dc" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#6b6690" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#16213e" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a2a4a" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8d88a8" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3a3a5e" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#2f2f52" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2a2a4a" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f1226" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#4f4b78" }] },
];

const DEFAULT_ZOOM = 13;
const CONTAINER_STYLE_BASE = { width: "100%" };

export function GoogleMapView({ apiKey, markers, center, zoom = DEFAULT_ZOOM, height = 400, onMarkerClick, geoFences = [], darkMode = false }: GoogleMapViewProps) {
  const { isLoaded, loadError } = useJsApiLoader({ googleMapsApiKey: apiKey });

  const containerStyle = useMemo(() => ({ ...CONTAINER_STYLE_BASE, height }), [height]);

  const resolvedCenter = useMemo(() => {
    if (center) return center;
    if (markers.length > 0) return { lat: markers[0]!.latitude, lng: markers[0]!.longitude };
    return { lat: 14.4297, lng: 120.936 }; // Imus, Cavite -- RAPEX's pilot area
  }, [center, markers]);

  if (loadError) {
    return <div style={{ padding: 16, color: "#B91C1C" }}>Google Maps failed to load: {loadError.message}</div>;
  }

  if (!isLoaded) {
    return <div style={{ ...containerStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>Loading map…</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={resolvedCenter}
      zoom={zoom}
      options={darkMode ? { styles: DARK_MAP_STYLES } : undefined}
    >
      {geoFences.map((fence) => (
        <CircleF
          key={fence.id}
          center={fence.center}
          radius={fence.radiusMeters}
          options={{
            fillColor: fence.color ?? "#8B5CF6",
            fillOpacity: 0.12,
            strokeColor: fence.color ?? "#8B5CF6",
            strokeOpacity: 0.7,
            strokeWeight: 2,
            clickable: false,
          }}
        />
      ))}
      {markers.map((marker) => (
        <MarkerF
          key={marker.id}
          position={{ lat: marker.latitude, lng: marker.longitude }}
          title={marker.label}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: MAP_MARKER_COLORS[marker.role],
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 2,
            scale: 8,
          }}
          onClick={onMarkerClick ? () => onMarkerClick(marker) : undefined}
        />
      ))}
    </GoogleMap>
  );
}
