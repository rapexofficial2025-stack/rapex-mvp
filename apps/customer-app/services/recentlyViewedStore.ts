import { useSyncExternalStore } from "react";

/**
 * Minimal in-memory view-history tracker -- same pattern the Mock
 * repositories already use for module-level state. Deliberately not a
 * React Context: contexts/ is reserved for Sprint FE-06 (Auth/Theme/
 * Location/Notification/Wallet/Cart/Wishlist); this is a narrower, local
 * concern that doesn't need provider wiring.
 */

const MAX_RECENTLY_VIEWED = 10;
let recentlyViewedIds: string[] = [];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function recordProductView(productId: string): void {
  recentlyViewedIds = [productId, ...recentlyViewedIds.filter((id) => id !== productId)].slice(
    0,
    MAX_RECENTLY_VIEWED,
  );
  notify();
}

export function getRecentlyViewedIds(): string[] {
  return recentlyViewedIds;
}

export function useRecentlyViewedIds(): string[] {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getRecentlyViewedIds,
  );
}
