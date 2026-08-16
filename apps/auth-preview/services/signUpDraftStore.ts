import { useSyncExternalStore } from "react";

/**
 * Session-only SignUp draft -- just enough to carry the entered name and
 * selected Culture from SignUp/AgeGate forward to WelcomeVideoScreen's
 * speech bubble, same useSyncExternalStore pattern as
 * apps/customer-app's registrationStore.ts. auth-preview has no backend,
 * so there's nothing to persist beyond this screen's own lifetime.
 */
let fullName = "";
let culture = "";
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function setSignUpFullName(name: string): void {
  fullName = name;
  notify();
}

export function setSignUpCulture(value: string): void {
  culture = value;
  notify();
}

function useDraft() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => ({ fullName, culture }),
  );
}

export function useSignUpFirstName(): string {
  const { fullName: name } = useDraft();
  const [first] = name.trim().split(" ");
  return first || "there";
}

// Only these 3 were given explicit translations -- the rest of
// CULTURE_OPTIONS (Ilocano, Waray, Samal, Bicolano, Other) fall back to
// English until real translations are provided. This is the ONLY UI text
// that changes with Culture -- everything else stays English regardless
// (a real app-language setting is a separate, later concern).
const WELCOME_TRANSLATIONS: Record<string, (name: string) => string> = {
  bisaya: (name) => `Maayong pag-abot, ${name}!`,
  tagalog: (name) => `Maligayang pagdating, ${name}!`,
  chavacano: (name) => `Bienvenidos, ${name}!`,
};

export function useSignUpWelcomeGreeting(): string {
  const { fullName: name, culture: selectedCulture } = useDraft();
  const [first] = name.trim().split(" ");
  const firstName = first || "there";
  const translate = WELCOME_TRANSLATIONS[selectedCulture];
  return translate ? translate(firstName) : `Welcome, ${firstName}!`;
}
