import { useSyncExternalStore } from "react";
import type { PilotArea } from "@rapex/constants";

/**
 * Session-only registration wizard draft -- same in-memory +
 * useSyncExternalStore pattern as cartStore.ts/addressStore.ts. Holds every
 * field the registration flow collects across its steps.
 *
 * IMPORTANT: most of these fields have NO confirmed Xano field to submit
 * to. The confirmed `/auth/signup` contract (see XanoAuthRepository) only
 * accepts { name, email, password } -- not phone, DOB, gender, KYC images,
 * GPS, or address. This store exists so the frontend can collect and
 * present that data (per instruction: "the frontend controls UI,
 * navigation, camera access, GPS permission, forms, and presentation") --
 * it does NOT mean any of it is actually persisted server-side yet. Each
 * screen that reads from here for a step Xano doesn't support shows that
 * honestly rather than pretending the data went anywhere; see
 * ProfileScreen's Registration Progress section and
 * docs/business/Registration.md for the full list of gaps.
 */

export type IdDocumentType = "National ID" | "Driver's License" | "Passport" | "UMID" | "PhilHealth ID" | "Voter's ID";

export type RapexLanguage = "tagalog" | "english" | "bisaya" | "taglish";

export const LANGUAGE_OPTIONS: { id: RapexLanguage; name: string; flag: string }[] = [
  { id: "tagalog", name: "Tagalog", flag: "\u{1F1F5}\u{1F1ED}" },
  { id: "english", name: "English", flag: "\u{1F1EC}\u{1F1E7}" },
  { id: "bisaya", name: "Bisaya", flag: "\u{1F1F5}\u{1F1ED}" },
  { id: "taglish", name: "Taglish", flag: "\u{1F1F5}\u{1F1ED}" },
];

export type RegistrationDraft = {
  privacyAccepted: boolean;
  language: RapexLanguage | null;
  dateOfBirth: string | null; // ISO date (YYYY-MM-DD)
  age: number | null; // derived from dateOfBirth, never entered directly

  firstName: string;
  surname: string;
  email: string;
  password: string;
  mobile: string;
  gender: "Male" | "Female" | "Prefer not to say" | null;

  idType: IdDocumentType | null;
  idFrontUri: string | null;
  idBackUri: string | null;
  selfieUri: string | null;

  mobileVerified: boolean;
  emailVerified: boolean;
  authProvider: "password" | "google" | "facebook" | null;

  gpsLatitude: number | null;
  gpsLongitude: number | null;
  useGpsAsHomeAddress: boolean | null;

  region: string | null;
  province: string | null;
  municipality: PilotArea | null;
  barangay: string | null;
  postalCode: string | null;

  // Real Xano location IDs (super_app/locations/*, 2026-08-14 handover) --
  // separate from the string fields above, which predate this contract and
  // stay in place for the free-text/pilot-area address path. These back
  // the real cascading picker and are what actually gets submitted as
  // region_id/province_id/municipality_id/barangay_id on signup.
  regionId: string | null;
  regionName: string | null;
  provinceId: string | null;
  provinceName: string | null;
  municipalityId: string | null;
  municipalityName: string | null;
  barangayId: string | null;
  barangayName: string | null;

  // Culture/Community (Xano `rapex-core/community-master`, 2026-08-14
  // handover) -- GET-only confirmed contract, no confirmed endpoint yet to
  // save a user's chosen community against their profile, so this is kept
  // locally only, same as every other unconfirmed-write field here.
  communityId: string | null;
  communityName: string | null;

  subdivision: string;
  street: string;
  block: string;
  lot: string;
  phase: string;
  building: string;
  floor: string;
  roomUnit: string;
};

function emptyDraft(): RegistrationDraft {
  return {
    privacyAccepted: false,
    language: null,
    dateOfBirth: null,
    age: null,
    firstName: "",
    surname: "",
    email: "",
    password: "",
    mobile: "",
    gender: null,
    idType: null,
    idFrontUri: null,
    idBackUri: null,
    selfieUri: null,
    mobileVerified: false,
    emailVerified: false,
    authProvider: null,
    gpsLatitude: null,
    gpsLongitude: null,
    useGpsAsHomeAddress: null,
    region: null,
    province: null,
    municipality: null,
    barangay: null,
    postalCode: null,
    regionId: null,
    regionName: null,
    provinceId: null,
    provinceName: null,
    municipalityId: null,
    municipalityName: null,
    barangayId: null,
    barangayName: null,
    communityId: null,
    communityName: null,
    subdivision: "",
    street: "",
    block: "",
    lot: "",
    phase: "",
    building: "",
    floor: "",
    roomUnit: "",
  };
}

let draft: RegistrationDraft = emptyDraft();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function updateRegistrationDraft(patch: Partial<RegistrationDraft>): void {
  draft = { ...draft, ...patch };
  notify();
}

export function getRegistrationDraft(): RegistrationDraft {
  return draft;
}

export function resetRegistrationDraft(): void {
  draft = emptyDraft();
  notify();
}

export function useRegistrationDraft(): RegistrationDraft {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => draft,
  );
}

/** Single-line address string for the real `/auth/signup` call's `address_line_1` field, built from whatever manual-address fields are filled in. */
export function buildAddressLine1(draft: RegistrationDraft): string {
  return [
    draft.roomUnit && `Rm/Unit ${draft.roomUnit}`,
    draft.floor && `Floor ${draft.floor}`,
    draft.building,
    draft.block || draft.lot ? `Blk ${draft.block || "-"} Lot ${draft.lot || "-"}` : null,
    draft.phase && `Phase ${draft.phase}`,
    draft.subdivision,
    draft.street,
  ]
    .filter(Boolean)
    .join(", ");
}

/** DOB -> age, computed once and re-derived whenever DOB changes -- never accepted as direct user input. */
export function calculateAge(isoDateOfBirth: string): number {
  const dob = new Date(isoDateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}
