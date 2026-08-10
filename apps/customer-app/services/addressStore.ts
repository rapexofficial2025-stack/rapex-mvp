import { useSyncExternalStore } from "react";

/**
 * Session-only delivery address -- same in-memory + useSyncExternalStore
 * pattern as cartStore.ts/wishlistStore.ts. No confirmed Xano endpoint for
 * saved addresses exists yet, so this is local-only and resets on app
 * restart; swapping in a real repository later is a change inside this
 * file only, no screen changes.
 *
 * latitude/longitude default to Imus, Cavite (RAPEX's pilot area) until a
 * real map picker (packages/ui-native's RapexMapView, prepared but
 * unwired -- needs a Google Maps API key) or device GPS is wired in.
 */
export type DeliveryAddress = {
  label: string;
  line: string;
  municipality: string;
  latitude: number;
  longitude: number;
};

const DEFAULT_ADDRESS: DeliveryAddress | null = null;

let currentAddress: DeliveryAddress | null = DEFAULT_ADDRESS;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function setDeliveryAddress(address: DeliveryAddress): void {
  currentAddress = address;
  notify();
}

export function getDeliveryAddress(): DeliveryAddress | null {
  return currentAddress;
}

export function useDeliveryAddress(): DeliveryAddress | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => currentAddress,
  );
}
