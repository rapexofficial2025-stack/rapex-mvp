import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const STORAGE_KEY = "rapex-map-style-mode";

export type MapStyleMode = "light" | "dark" | "night";
const CYCLE_ORDER: MapStyleMode[] = ["light", "dark", "night"];

/**
 * A rider's map style preference, independent of the app's own light/dark
 * theme (ThemeProvider) -- a rider's real-world lighting/vision needs while
 * actually driving don't necessarily match whatever theme the rest of the
 * UI happens to be in. Persisted locally per device, same pattern as
 * ThemeProvider's own persisted override, just a separate storage key and
 * a 3-way value instead of 2-way.
 */
export function useMapStyleMode(defaultMode: MapStyleMode = "dark"): {
  mode: MapStyleMode;
  setMode: (mode: MapStyleMode) => void;
  cycleMode: () => void;
} {
  const [mode, setModeState] = useState<MapStyleMode>(defaultMode);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (!cancelled && (stored === "light" || stored === "dark" || stored === "night")) setModeState(stored);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setMode = (next: MapStyleMode) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  };

  const cycleMode = () => {
    const nextIndex = (CYCLE_ORDER.indexOf(mode) + 1) % CYCLE_ORDER.length;
    setMode(CYCLE_ORDER[nextIndex]);
  };

  return { mode, setMode, cycleMode };
}
