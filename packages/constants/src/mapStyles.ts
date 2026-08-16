/**
 * Google Maps JSON styling arrays (the `customMapStyle` prop on
 * react-native-maps' MapView, or the `styles` option on the JS Maps API on
 * web) -- purely a client-side recolor of roads/water/labels/POIs, no
 * separate API/billing beyond the base Maps SDK you already have. Single
 * source of truth so every app's map looks consistent instead of each
 * screen picking its own style.
 */
export const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#1A1B2E" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8A8FB8" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1A1B2E" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#3C3F5C" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#D6D8F0" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6E7299" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#1F3A2E" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4C8368" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#2C2F4A" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1A1B2E" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#8A8FB8" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#F97316" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#7C2D12" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#FDBA74" }],
  },
  {
    featureType: "road.arterial",
    elementType: "labels.text.fill",
    stylers: [{ color: "#8A8FB8" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2C2F4A" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0E1424" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3E4373" }],
  },
];

/**
 * High-contrast night-driving style -- distinct from DARK_MAP_STYLE, which is
 * an aesthetic brand theme. This one prioritizes actual road visibility in
 * low light: near-black background, bright high-contrast road lines, POI
 * icons/labels stripped out entirely to cut visual clutter while riding.
 * Selectable independently of the app's light/dark theme -- see
 * useMapStyleMode -- since a rider's real-world lighting/vision needs don't
 * necessarily match whatever theme the rest of the UI is in.
 */
export const NIGHT_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#050608" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#E5E7EB" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#000000" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#374151" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#D1D5DB" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#050608" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#F3F4F6" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#FB923C" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#000000" }],
  },
  {
    featureType: "road.local",
    elementType: "geometry",
    stylers: [{ color: "#9CA3AF" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#000000" }],
  },
];
