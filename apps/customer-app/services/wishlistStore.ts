import { useSyncExternalStore } from "react";

/**
 * Session-only wishlist -- same in-memory + useSyncExternalStore pattern as
 * favoriteStoresStore.ts. Resets on app restart; upgrading to persistent
 * storage later is a swap inside this file only, no screen changes.
 */

let wishlistedProductIds = new Set<string>();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function toggleWishlistProduct(productId: string): void {
  const next = new Set(wishlistedProductIds);
  if (next.has(productId)) {
    next.delete(productId);
  } else {
    next.add(productId);
  }
  wishlistedProductIds = next;
  notify();
}

export function isWishlistedProduct(productId: string): boolean {
  return wishlistedProductIds.has(productId);
}

export function useWishlistedProductIds(): Set<string> {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => wishlistedProductIds,
  );
}
