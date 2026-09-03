import type { HttpClient } from "../../core/httpClient";
import type { Community, LocationOption, ReferenceDataRepository } from "./ReferenceDataRepository";

/** Raw row shape from Xano's location tables -- ASSUMED `id`/`name` (most common PSGC-dataset convention); not explicitly confirmed field-by-field in the 2026-08-14 handover, so mapping falls back defensively to common alternates rather than crashing if the real names differ slightly. */
type RawLocationRow = { id?: string | number; location_id?: string | number; name?: string; region_name?: string; province_name?: string; municipality_name?: string; barangay_name?: string };
type RawCommunityRow = { id?: string | number; name?: string; description?: string; is_active?: boolean };

function toLocationOption(raw: RawLocationRow): LocationOption {
  return {
    id: String(raw.id ?? raw.location_id ?? ""),
    name: String(raw.name ?? raw.region_name ?? raw.province_name ?? raw.municipality_name ?? raw.barangay_name ?? ""),
  };
}

/** Xano's "standard list return" isn't guaranteed to be a bare array -- unwrap the common `{items: [...]}` shape defensively rather than assuming one or the other. */
function unwrapList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object" && Array.isArray((payload as { items?: unknown }).items)) {
    return (payload as { items: T[] }).items;
  }
  return [];
}

/**
 * Real Xano-backed ReferenceDataRepository (2026-08-14 handover). Two
 * separate Xano API groups behind one repository, since from the
 * frontend's perspective both are just "static reference data for
 * pickers": `super_app` for the location hierarchy, `rapex-core` for the
 * Culture/Community list.
 */
export class XanoReferenceDataRepository implements ReferenceDataRepository {
  private readonly superAppClient: HttpClient;
  private readonly coreClient: HttpClient;

  constructor(superAppClient: HttpClient, coreClient: HttpClient) {
    this.superAppClient = superAppClient;
    this.coreClient = coreClient;
  }

  async getRegions(): Promise<LocationOption[]> {
    const result = await this.superAppClient.request<unknown>({ path: "/locations/regions", method: "GET" });
    return unwrapList<RawLocationRow>(result).map(toLocationOption);
  }

  async getProvinces(regionId: string): Promise<LocationOption[]> {
    const result = await this.superAppClient.request<unknown>({
      path: "/locations/provinces",
      method: "GET",
      query: { region_id: regionId },
    });
    return unwrapList<RawLocationRow>(result).map(toLocationOption);
  }

  async getMunicipalities(provinceId: string): Promise<LocationOption[]> {
    const result = await this.superAppClient.request<unknown>({
      path: "/locations/municipalities",
      method: "GET",
      query: { province_id: provinceId },
    });
    return unwrapList<RawLocationRow>(result).map(toLocationOption);
  }

  async getBarangays(municipalityId: string): Promise<LocationOption[]> {
    const result = await this.superAppClient.request<unknown>({
      path: "/locations/barangays",
      method: "GET",
      query: { municipality_id: municipalityId },
    });
    return unwrapList<RawLocationRow>(result).map(toLocationOption);
  }

  async getCommunities(): Promise<Community[]> {
    const result = await this.coreClient.request<unknown>({ path: "/community-master", method: "GET" });
    return unwrapList<RawCommunityRow>(result)
      .filter((row) => row.is_active !== false) // keep active + rows that don't say either way, per "use the active records" instruction
      .map((row) => ({ id: String(row.id ?? ""), name: String(row.name ?? ""), description: String(row.description ?? "") }));
  }
}
