import { useSyncExternalStore } from "react";
import type { CartLine } from "@rapex/api-client";

/**
 * Session-only cart -- same in-memory + useSyncExternalStore pattern as
 * favoriteStoresStore.ts/wishlistStore.ts. Resets on app restart; upgrading
 * to persistent/synced storage later is a swap inside this file only, no
 * screen changes. Lines are keyed by productId -- adding an already-present
 * product increments its quantity instead of duplicating a row.
 */

let cartLines: CartLine[] = [];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function addToCart(line: CartLine): void {
  const existing = cartLines.find((l) => l.productId === line.productId);
  cartLines = existing
    ? cartLines.map((l) => (l.productId === line.productId ? { ...l, quantity: l.quantity + line.quantity } : l))
    : [...cartLines, line];
  notify();
}

export function updateCartQuantity(productId: string, quantity: number): void {
  cartLines = quantity <= 0 ? cartLines.filter((l) => l.productId !== productId) : cartLines.map((l) => (l.productId === productId ? { ...l, quantity } : l));
  notify();
}

export function removeFromCart(productId: string): void {
  cartLines = cartLines.filter((l) => l.productId !== productId);
  notify();
}

export function clearCart(): void {
  cartLines = [];
  notify();
}

export function useCartLines(): CartLine[] {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => cartLines,
  );
}

export function useCartCount(): number {
  const lines = useCartLines();
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}
