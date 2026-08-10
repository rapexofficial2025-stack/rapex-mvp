import type { PilotArea } from "./pilotAreas";

/**
 * Address cascading dataset (Region -> Province -> Municipality/City ->
 * Barangay -> Postal Code), centralized here per instruction: "Do not
 * hardcode postal code logic in individual screens."
 *
 * Region/Province/Municipality/postal-code below are real, publicly known
 * PSGC-level facts for RAPEX's actual pilot area (Cavite, CALABARZON) --
 * not invented. "Lancaster" (Lancaster New City) is kept as its own
 * Municipality/City-level entry for consistency with the existing
 * `PILOT_AREAS` constant used elsewhere in the app (store/coverage
 * discovery), even though it is technically a large subdivision spanning
 * Kawit and Imus rather than its own PSGC municipality -- flagged here
 * rather than silently reclassified. Its postal code is given as Kawit's
 * (4104), which is an approximation pending confirmation, not a verified
 * PSGC assignment.
 *
 * GAP (not filled in): barangay-level lists per municipality. Hand-typing a
 * full barangay list from memory risks shipping wrong/incomplete official
 * data in an address form real deliveries depend on. Until a real PSGC
 * barangay dataset is provided, `barangays` is an empty array and
 * `AddressScreen` falls back to free-text entry for Barangay -- see that
 * screen's comment.
 */
export const PH_REGION = "Region IV-A (CALABARZON)";
export const PH_PROVINCE = "Cavite";

export type MunicipalityGeography = {
  name: PilotArea;
  postalCode: string;
  /** Empty until a real PSGC barangay dataset is provided -- see module doc comment. */
  barangays: string[];
};

export const PILOT_MUNICIPALITY_GEOGRAPHY: Record<PilotArea, MunicipalityGeography> = {
  Imus: { name: "Imus", postalCode: "4103", barangays: [] },
  Kawit: { name: "Kawit", postalCode: "4104", barangays: [] },
  Lancaster: { name: "Lancaster", postalCode: "4104", barangays: [] },
  "General Trias": { name: "General Trias", postalCode: "4107", barangays: [] },
};

export function getPostalCodeForMunicipality(municipality: PilotArea): string {
  return PILOT_MUNICIPALITY_GEOGRAPHY[municipality].postalCode;
}
