import { useSyncExternalStore } from "react";

/**
 * Session-only profile photo URI -- same pattern as cartStore.ts. No
 * confirmed Xano field/endpoint to upload a profile photo to yet, so this
 * is local-only and resets on app restart.
 */
let photoUri: string | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function setProfilePhotoUri(uri: string): void {
  photoUri = uri;
  notify();
}

export function useProfilePhotoUri(): string | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => photoUri,
  );
}
