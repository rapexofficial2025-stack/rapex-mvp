import { useSyncExternalStore } from "react";

/**
 * Session-only favorites -- same in-memory + useSyncExternalStore pattern as
 * recentlyViewedStore.ts. Resets on app restart; upgrading to persistent
 * storage later is a swap inside this file only, no screen changes.
 */

let favoriteStoreIds = new Set<string>();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function toggleFavoriteStore(storeId: string): void {
  const next = new Set(favoriteStoreIds);
  if (next.has(storeId)) {
    next.delete(storeId);
  } else {
    next.add(storeId);
  }
  favoriteStoreIds = next;
  notify();
}

export function isFavoriteStore(storeId: string): boolean {
  return favoriteStoreIds.has(storeId);
}

export function useFavoriteStoreIds(): Set<string> {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => favoriteStoreIds,
  );
}
