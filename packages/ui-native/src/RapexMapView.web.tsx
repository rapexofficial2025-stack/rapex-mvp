import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { MAP_MARKER_COLORS, type MapMarkerRole } from "@rapex/constants";

/**
 * Web build of RapexMapView. `react-native-maps` has no web target at all
 * (confirmed: the installed version ships no `.web.js`, and importing it on
 * web throws `codegenNativeComponent is not a function` at module-load time
 * -- not a rendering bug, an import-time crash that takes down the whole
 * app on web since @rapex/ui-native's barrel export pulls RapexMapView.tsx
 * in unconditionally and AppProviders.tsx imports from @rapex/ui-native at
 * the app root).
 *
 * Metro resolves `<name>.web.tsx` over `<name>.tsx` automatically for web
 * bundles (same mechanism as `.ios.tsx`/`.android.tsx`), so this file keeps
 * `react-native-maps` out of the web bundle's module graph entirely --
 * every other platform still gets the real interactive map from
 * RapexMapView.tsx unchanged. Same exported shape (component name, prop
 * types) as that file, so nothing importing `RapexMapView` needs to know
 * which one it got.
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

export function RapexMapView({ markers, initialLatitude, initialLongitude, onMarkerPress }: RapexMapViewProps) {
  return (
    <View style={[styles.container, styles.fallback]}>
      <Text style={styles.title}>Map view isn't available on web</Text>
      <Text style={styles.subtitle}>
        react-native-maps only supports iOS/Android. Coordinates: {initialLatitude.toFixed(5)}, {initialLongitude.toFixed(5)}
      </Text>
      {markers.map((marker) => (
        <Text
          key={marker.id}
          style={[styles.marker, { color: MAP_MARKER_COLORS[marker.role] }]}
          onPress={onMarkerPress ? () => onMarkerPress(marker) : undefined}
        >
          ● {marker.label ?? marker.role} ({marker.latitude.toFixed(5)}, {marker.longitude.toFixed(5)})
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  title: { fontSize: 13, fontWeight: "700", color: "#334155" },
  subtitle: { fontSize: 11, color: "#64748B", textAlign: "center" },
  marker: { fontSize: 11, fontWeight: "600", marginTop: 4 },
});
