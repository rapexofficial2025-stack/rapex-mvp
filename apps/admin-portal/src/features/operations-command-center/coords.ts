/**
 * Converts this screen's mock x/y percentage positions into real lat/lng so
 * they can be plotted on an actual Google Map -- see LiveMapView.tsx. The
 * bounding box below approximates RAPEX's Cavite pilot area (Imus/Bacoor/
 * Dasmariñas/General Trias), matching GoogleMapView's own default center.
 * This is a display convenience for still-mock entities, not a real
 * geocoding -- once Xano returns real rider/merchant lat/lng, this file
 * goes away and LiveMapView reads coordinates directly from the API data.
 */
const PILOT_BOUNDS = { latMin: 14.28, latMax: 14.5, lngMin: 120.87, lngMax: 121.03 };

export function percentToLatLng(x: number, y: number): { lat: number; lng: number } {
  const lat = PILOT_BOUNDS.latMax - (y / 100) * (PILOT_BOUNDS.latMax - PILOT_BOUNDS.latMin);
  const lng = PILOT_BOUNDS.lngMin + (x / 100) * (PILOT_BOUNDS.lngMax - PILOT_BOUNDS.lngMin);
  return { lat, lng };
}

export const PILOT_AREA_CENTER = {
  lat: (PILOT_BOUNDS.latMin + PILOT_BOUNDS.latMax) / 2,
  lng: (PILOT_BOUNDS.lngMin + PILOT_BOUNDS.lngMax) / 2,
};
