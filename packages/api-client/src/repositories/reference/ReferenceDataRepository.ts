/**
 * Static/master reference data for pickers -- Region/Province/Municipality/
 * Barangay cascading selects, and the Culture/Community list. Confirmed
 * Xano contracts (2026-08-14 handover):
 *
 *   GET /super_app/locations/regions
 *   GET /super_app/locations/provinces?region_id={id}
 *   GET /super_app/locations/municipalities?province_id={id}
 *   GET /super_app/locations/barangays?municipality_id={id}
 *   GET /rapex-core/community-master
 *
 * All read-only, no auth required. Deliberately its own repository, not
 * folded into AuthRepository -- this is reference/master data, not
 * authentication, matching how OrdersRepository/WalletRepository/etc. are
 * already separate from AuthRepository despite also needing a Bearer token
 * on some calls.
 */
export type LocationOption = {
  id: string;
  name: string;
};

export type Community = {
  id: string;
  name: string;
  description: string;
};

export interface ReferenceDataRepository {
  getRegions(): Promise<LocationOption[]>;
  getProvinces(regionId: string): Promise<LocationOption[]>;
  getMunicipalities(provinceId: string): Promise<LocationOption[]>;
  getBarangays(municipalityId: string): Promise<LocationOption[]>;
  /** Only the active (`is_active`) records -- matches the explicit instruction to use active records only. */
  getCommunities(): Promise<Community[]>;
}
