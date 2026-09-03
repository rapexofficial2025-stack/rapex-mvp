import { useSyncExternalStore } from "react";

/**
 * Session-only Child Account registration wizard draft -- same in-memory +
 * useSyncExternalStore pattern as registrationStore.ts/cartStore.ts. Exists
 * so the ChildBasicInfo -> ChildAddress -> ChildStudentStatus ->
 * ChildAuthorization steps can use the header back-arrow / Next buttons to
 * go back and forth without losing anything already entered.
 */
export type ChildRegistrationDraft = {
  fullName: string;
  email: string;
  password: string;
  dateOfBirth: string; // ISO date (YYYY-MM-DD)
  gender: "Male" | "Female" | "Prefer not to say" | null;

  municipalityId: string | null;
  municipalityName: string | null;
  barangayId: string | null;
  barangayName: string | null;
  street: string;

  isStudent: boolean | null;
  studentVerificationRef: string;
  nonStudentReason: string;
  intendedUsePurpose: string;

  parentAuthorizationConfirmed: boolean;
};

function emptyDraft(): ChildRegistrationDraft {
  return {
    fullName: "",
    email: "",
    password: "",
    dateOfBirth: "",
    gender: null,
    municipalityId: null,
    municipalityName: null,
    barangayId: null,
    barangayName: null,
    street: "",
    isStudent: null,
    studentVerificationRef: "",
    nonStudentReason: "",
    intendedUsePurpose: "",
    parentAuthorizationConfirmed: false,
  };
}

let draft: ChildRegistrationDraft = emptyDraft();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function updateChildRegistrationDraft(patch: Partial<ChildRegistrationDraft>): void {
  draft = { ...draft, ...patch };
  notify();
}

export function getChildRegistrationDraft(): ChildRegistrationDraft {
  return draft;
}

export function resetChildRegistrationDraft(): void {
  draft = emptyDraft();
  notify();
}

export function useChildRegistrationDraft(): ChildRegistrationDraft {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => draft,
  );
}
