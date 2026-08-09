import { StyleSheet, View, type ViewStyle } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
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
};

export type RapexMapViewProps = {
  markers: RapexMapMarker[];
  initialLatitude: number;
  initialLongitude: number;
  latitudeDelta?: number;
  longitudeDelta?: number;
  style?: ViewStyle;
  onMarkerPress?: (marker: RapexMapMarker) => void;
};

const DEFAULT_DELTA = 0.02;

export function RapexMapView({
  markers,
  initialLatitude,
  initialLongitude,
  latitudeDelta = DEFAULT_DELTA,
  longitudeDelta = DEFAULT_DELTA,
  style,
  onMarkerPress,
}: RapexMapViewProps) {
  return (
    <View style={[styles.container, style]}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: initialLatitude,
          longitude: initialLongitude,
          latitudeDelta,
          longitudeDelta,
        }}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            title={marker.label}
            pinColor={MAP_MARKER_COLORS[marker.role]}
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
