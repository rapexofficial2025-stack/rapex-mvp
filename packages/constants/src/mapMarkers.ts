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

/**
 * A rider's live map status, collapsed from their real availabilityStatus +
 * active delivery status (see DeliveryOrderStatus in @rapex/api-client) into
 * 5 map-relevant buckets. Deliberately NOT importing DeliveryOrderStatus
 * here -- constants stays a dependency-free leaf package; callers that
 * already depend on @rapex/api-client do that mapping themselves (e.g.
 * "picked-up" -> "to-merchant", "on-the-way" -> "delivering").
 */
export type RiderMapStatus = "offline" | "idle" | "to-merchant" | "delivering" | "problem";

export const RIDER_STATUS_COLORS: Record<RiderMapStatus, string> = {
  offline: "#9CA3AF", // gray -- rider is offline
  idle: "#EAB308", // yellow -- online, no active delivery
  "to-merchant": "#F97316", // orange -- heading to / at the merchant
  delivering: "#22C55E", // green -- picked up, heading to / at the customer
  problem: "#EF4444", // red -- failed delivery / cancelled
};
