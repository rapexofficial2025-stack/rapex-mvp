import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import type { MapMarkerRole } from "@rapex/constants";
// Type-only import -- erased at compile time, does NOT pull react-native-maps into the web bundle.
import type { MapStyleElement } from "react-native-maps";

/**
 * Web counterpart to RapexMapView.tsx -- Metro/Expo's bundler picks this file
 * automatically for web builds (the `.web.tsx` suffix), so `react-native-maps`
 * (which requireNativeComponent/codegenNativeComponent, not web-safe) never
 * gets imported into the web bundle at all. Same exported names/prop shape as
 * the native version so nothing consuming `@rapex/ui-native` needs a
 * platform-specific import.
 *
 * Real web map support (e.g. @react-google-maps/api, already used by
 * GoogleMapView.tsx in @rapex/ui-web) is a separate piece of work -- neither
 * customer-app nor rider-app currently renders RapexMapView on any screen
 * (see its native file's doc comment), so this is an honest "not available
 * on web yet" placeholder rather than a fake map, kept ready for whichever
 * screen wires it in first.
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
  /** Accepted for prop-shape parity with the native version -- unused here, this placeholder has no map to style. */
  customMapStyle?: MapStyleElement[];
};

export function RapexMapView({ style }: RapexMapViewProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>Map view isn't available on web yet -- open this in the app.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 160,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: 16,
  },
  text: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    textAlign: "center",
  },
});
