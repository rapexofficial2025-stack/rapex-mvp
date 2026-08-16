import { useSyncExternalStore } from "react";

/**
 * Session-only SignUp draft -- just enough to carry the entered name from
 * SignUpScreen (Basic Info) forward to WelcomeVideoScreen's "Hello,
 * {name}!" speech bubble, same useSyncExternalStore pattern as
 * apps/customer-app's registrationStore.ts. auth-preview has no backend,
 * so there's nothing to persist beyond this screen's own lifetime.
 */
let fullName = "";
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function setSignUpFullName(name: string): void {
  fullName = name;
  notify();
}

export function useSignUpFirstName(): string {
  const name = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => fullName,
  );
  const [first] = name.trim().split(" ");
  return first || "there";
}
