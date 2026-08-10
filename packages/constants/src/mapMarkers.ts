/**
 * Single source of truth for map marker colors, per role, across every app
 * that renders a map (admin Operations Command Center, merchant Coverage
 * Map, and eventually customer/rider live tracking) -- avoids each app
 * picking its own colors once real Google Maps rendering is wired in.
 *
 * No map SDK is installed in any app yet (react-native-maps for
 * customer-app/rider-app, a web equivalent for the three portals) --
 * every current "map" is a CSS/placeholder visualization with mock marker
 * positions. This constant exists so that work, whenever it happens, starts
 * from one agreed palette instead of guessing per app.
 */
export const MAP_MARKER_COLORS = {
  customer: "#22C55E",
  merchant: "#8B5CF6",
  rider: "#F97316",
} as const;

export type MapMarkerRole = keyof typeof MAP_MARKER_COLORS;
