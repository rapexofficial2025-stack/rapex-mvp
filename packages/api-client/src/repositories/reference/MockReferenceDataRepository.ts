import type { Community, LocationOption, ReferenceDataRepository } from "./ReferenceDataRepository";

const MOCK_REGIONS: LocationOption[] = [{ id: "region-4a", name: "Region IV-A (CALABARZON)" }];
const MOCK_PROVINCES: LocationOption[] = [{ id: "province-cavite", name: "Cavite" }];
const MOCK_MUNICIPALITIES: LocationOption[] = [{ id: "municipality-imus", name: "Imus" }];
const MOCK_BARANGAYS: LocationOption[] = [{ id: "barangay-alapan-2", name: "Alapan II" }];

const MOCK_COMMUNITIES: Community[] = [
  { id: "tagalog", name: "Tagalog", description: "" },
  { id: "cebuano", name: "Cebuano / Bisaya", description: "" },
  { id: "ilocano", name: "Ilocano", description: "" },
];

/** Stands in for XanoReferenceDataRepository until an app's own real contract is confirmed -- same "mirrors the real shape" convention as every other Mock repository. */
export class MockReferenceDataRepository implements ReferenceDataRepository {
  async getRegions(): Promise<LocationOption[]> {
    return MOCK_REGIONS;
  }
  async getProvinces(_regionId: string): Promise<LocationOption[]> {
    return MOCK_PROVINCES;
  }
  async getMunicipalities(_provinceId: string): Promise<LocationOption[]> {
    return MOCK_MUNICIPALITIES;
  }
  async getBarangays(_municipalityId: string): Promise<LocationOption[]> {
    return MOCK_BARANGAYS;
  }
  async getCommunities(): Promise<Community[]> {
    return MOCK_COMMUNITIES;
  }
}
