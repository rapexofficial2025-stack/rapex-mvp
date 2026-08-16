import { Fragment } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, type MapStyleElement } from "react-native-maps";
import { MAP_MARKER_COLORS, type MapMarkerRole } from "@rapex/constants";

/**
 * Prepared, not yet wired into any screen -- architecture + dependency only.
 *
 * Neither customer-app nor rider-app currently captures real GPS locations
 * or reads lat/lng from a confirmed Xano endpoint, so there is no real data
 * to show yet. This exists so a real map can be dropped into a screen the
 * moment that data exists. Requires EXPO_PUBLIC_GOOGLE_MAPS_API_KEY (see
 * each app's .env.example) wired through app.config.js's react-native-maps
 * config plugin -- never hardcode the key. Do not claim this "works" until
 * it has actually rendered on a real device/simulator with a real,
 * billing-enabled Google Maps API key.
 */
export type RapexMapMarker = {
  id: string;
  role: MapMarkerRole;
  latitude: number;
  longitude: number;
  label?: string;
  /** Overrides the role's default color -- e.g. a live rider status color (RIDER_STATUS_COLORS). */
  color?: string;
};

export type RapexMapRoute = {
  id: string;
  coordinates: { latitude: number; longitude: number }[];
  color?: string;
};

export type RapexMapViewProps = {
  markers: RapexMapMarker[];
  initialLatitude: number;
  initialLongitude: number;
  latitudeDelta?: number;
  longitudeDelta?: number;
  style?: ViewStyle;
  onMarkerPress?: (marker: RapexMapMarker) => void;
  /** Google Maps JSON style array (e.g. DARK_MAP_STYLE from @rapex/constants) -- omit for the default look. */
  customMapStyle?: MapStyleElement[];
  /** Straight-line paths only (rider -> merchant/customer) until a real Directions/Routes API proxy exists server-side -- see deliveryFeeEngine.ts's estimateRoadDistanceKm for the same caveat applied to distance math. */
  routes?: RapexMapRoute[];
};

const DEFAULT_DELTA = 0.02;
const DEFAULT_ROUTE_COLOR = "#8B5CF6";

export function RapexMapView({
  markers,
  initialLatitude,
  initialLongitude,
  latitudeDelta = DEFAULT_DELTA,
  longitudeDelta = DEFAULT_DELTA,
  style,
  onMarkerPress,
  customMapStyle,
  routes = [],
}: RapexMapViewProps) {
  return (
    <View style={[styles.container, style]}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        customMapStyle={customMapStyle}
        initialRegion={{
          latitude: initialLatitude,
          longitude: initialLongitude,
          latitudeDelta,
          longitudeDelta,
        }}
      >
        {routes.map((route) => {
          const color = route.color ?? DEFAULT_ROUTE_COLOR;
          // Two stacked polylines fake a "glow": a wide, translucent line behind a thin solid one.
          // A Fragment (not a View) -- MapView's children must be direct map overlay components,
          // wrapping them in a real View breaks native rendering.
          return (
            <Fragment key={route.id}>
              <Polyline coordinates={route.coordinates} strokeColor={`${color}44`} strokeWidth={10} lineCap="round" lineJoin="round" />
              <Polyline coordinates={route.coordinates} strokeColor={color} strokeWidth={4} lineCap="round" lineJoin="round" />
            </Fragment>
          );
        })}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            title={marker.label}
            pinColor={marker.color ?? MAP_MARKER_COLORS[marker.role]}
            onPress={onMarkerPress ? () => onMarkerPress(marker) : undefined}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
