import { useEffect, useState } from "react";
import { useRepositories, type LocationOption } from "@rapex/api-client";
import { PickerField } from "./PickerField";

export type CascadingAddressValue = {
  regionId: string | null;
  regionName: string | null;
  provinceId: string | null;
  provinceName: string | null;
  municipalityId: string | null;
  municipalityName: string | null;
  barangayId: string | null;
  barangayName: string | null;
};

export const EMPTY_CASCADING_ADDRESS: CascadingAddressValue = {
  regionId: null,
  regionName: null,
  provinceId: null,
  provinceName: null,
  municipalityId: null,
  municipalityName: null,
  barangayId: null,
  barangayName: null,
};

/**
 * Real Region -> Province -> Municipality/City -> Barangay cascading
 * picker, backed by the confirmed Xano `super_app/locations/*` endpoints
 * (2026-08-14 handover). Picking a level resets everything below it, same
 * as any standard cascading-address UX. Each level's options only load
 * once its parent is picked -- no fabricated "all provinces" list ever
 * shown before a region is chosen.
 */
export function CascadingAddressPicker({
  value,
  onChange,
}: {
  value: CascadingAddressValue;
  onChange: (value: CascadingAddressValue) => void;
}) {
  const { referenceData } = useRepositories();
  const [regions, setRegions] = useState<LocationOption[]>([]);
  const [provinces, setProvinces] = useState<LocationOption[]>([]);
  const [municipalities, setMunicipalities] = useState<LocationOption[]>([]);
  const [barangays, setBarangays] = useState<LocationOption[]>([]);

  useEffect(() => {
    referenceData?.getRegions().then(setRegions).catch(() => setRegions([]));
  }, [referenceData]);

  useEffect(() => {
    if (!value.regionId) {
      setProvinces([]);
      return;
    }
    referenceData?.getProvinces(value.regionId).then(setProvinces).catch(() => setProvinces([]));
  }, [referenceData, value.regionId]);

  useEffect(() => {
    if (!value.provinceId) {
      setMunicipalities([]);
      return;
    }
    referenceData?.getMunicipalities(value.provinceId).then(setMunicipalities).catch(() => setMunicipalities([]));
  }, [referenceData, value.provinceId]);

  useEffect(() => {
    if (!value.municipalityId) {
      setBarangays([]);
      return;
    }
    referenceData?.getBarangays(value.municipalityId).then(setBarangays).catch(() => setBarangays([]));
  }, [referenceData, value.municipalityId]);

  return (
    <>
      <PickerField
        label="Region"
        value={value.regionName}
        options={regions.map((r) => r.name)}
        onSelect={(name) => {
          const picked = regions.find((r) => r.name === name);
          onChange({ ...EMPTY_CASCADING_ADDRESS, regionId: picked?.id ?? null, regionName: name });
        }}
      />
      <PickerField
        label="Province"
        value={value.provinceName}
        options={provinces.map((p) => p.name)}
        disabled={!value.regionId}
        onSelect={(name) => {
          const picked = provinces.find((p) => p.name === name);
          onChange({
            ...value,
            provinceId: picked?.id ?? null,
            provinceName: name,
            municipalityId: null,
            municipalityName: null,
            barangayId: null,
            barangayName: null,
          });
        }}
      />
      <PickerField
        label="Municipality / City"
        value={value.municipalityName}
        options={municipalities.map((m) => m.name)}
        disabled={!value.provinceId}
        onSelect={(name) => {
          const picked = municipalities.find((m) => m.name === name);
          onChange({ ...value, municipalityId: picked?.id ?? null, municipalityName: name, barangayId: null, barangayName: null });
        }}
      />
      <PickerField
        label="Barangay"
        value={value.barangayName}
        options={barangays.map((b) => b.name)}
        disabled={!value.municipalityId}
        onSelect={(name) => {
          const picked = barangays.find((b) => b.name === name);
          onChange({ ...value, barangayId: picked?.id ?? null, barangayName: name });
        }}
      />
    </>
  );
}
