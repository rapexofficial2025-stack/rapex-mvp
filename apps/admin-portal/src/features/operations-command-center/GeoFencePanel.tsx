import { useState, type CSSProperties } from "react";
import { useTheme, type MapGeoFence } from "@rapex/ui-web";

type GeoFencePanelProps = {
  geoFence: MapGeoFence;
  onChange: (next: MapGeoFence) => void;
  onClose: () => void;
};

const MIN_RADIUS_KM = 1;
const MAX_RADIUS_KM = 40;

/**
 * Draws and edits a delivery-coverage radius circle live on the map above.
 * Separate from MapAccessPanel's "Map access & geo-fencing" (that one is
 * admin view *permissions*; this is the actual service-area boundary).
 *
 * Fully real and interactive right now -- the circle updates on the map as
 * the slider moves -- but nothing here is persisted. No confirmed Xano
 * geo-fence/service-area table exists yet (riders have a per-rider
 * `service_radius_km` in the reported schema, but no coverage-polygon or
 * per-region radius endpoint), so "Save" stays an honest no-op.
 */
export function GeoFencePanel({ geoFence, onChange, onClose }: GeoFencePanelProps) {
  const theme = useTheme();
  const [notice, setNotice] = useState<string | null>(null);
  const radiusKm = geoFence.radiusMeters / 1000;

  return (
    <aside style={{ ...styles.panel, background: theme.colors.surface, borderColor: theme.colors.border }} aria-label="Delivery coverage geo-fence">
      <div style={styles.header}>
        <div>
          <p style={{ ...styles.eyebrow, color: theme.colors.brandPrimary }}>DELIVERY COVERAGE</p>
          <h2 style={{ ...styles.title, color: theme.colors.textPrimary }}>Geo-fence radius</h2>
        </div>
        <button type="button" style={{ ...styles.close, color: theme.colors.textPrimary, borderColor: theme.colors.border }} onClick={onClose}>
          Close
        </button>
      </div>
      <p style={{ ...styles.copy, color: theme.colors.textSecondary }}>
        Drag to preview a delivery-coverage boundary on the live map. This is a real, working preview — nothing is saved
        until a confirmed Xano service-area endpoint exists.
      </p>
      <label style={{ ...styles.label, color: theme.colors.textPrimary }} htmlFor="geo-fence-radius">
        Radius: {radiusKm.toFixed(1)} km
      </label>
      <input
        id="geo-fence-radius"
        type="range"
        min={MIN_RADIUS_KM}
        max={MAX_RADIUS_KM}
        step={0.5}
        value={radiusKm}
        onChange={(event) => onChange({ ...geoFence, radiusMeters: Number(event.target.value) * 1000 })}
      />
      <label style={{ ...styles.label, color: theme.colors.textPrimary }} htmlFor="geo-fence-label">
        Label
      </label>
      <input
        id="geo-fence-label"
        style={{ ...styles.input, color: theme.colors.textPrimary, borderColor: theme.colors.border, background: theme.colors.surfaceAlt }}
        value={geoFence.label ?? ""}
        onChange={(event) => onChange({ ...geoFence, label: event.target.value })}
        placeholder="e.g. Imus core coverage"
      />
      <button
        type="button"
        style={{ ...styles.primary, background: theme.colors.brandPrimary }}
        onClick={() => setNotice("Xano endpoint required: this boundary has not been saved as a service area.")}
      >
        Save geo-fence
      </button>
      {notice ? (
        <p role="status" style={{ ...styles.notice, color: theme.colors.textSecondary }}>
          {notice}
        </p>
      ) : null}
    </aside>
  );
}

const styles: Record<string, CSSProperties> = {
  panel: { position: "absolute", zIndex: 4, top: 16, left: 16, width: "min(340px, calc(100% - 32px))", border: "1px solid", borderRadius: 16, padding: 20, boxShadow: "0 18px 46px rgba(0,0,0,.28)", display: "flex", flexDirection: "column", gap: 12 },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  eyebrow: { margin: 0, fontSize: 10, fontWeight: 800, letterSpacing: 1 },
  title: { margin: "4px 0 0", fontSize: 18 },
  close: { border: "1px solid", borderRadius: 8, background: "transparent", padding: "7px 9px", font: "inherit", cursor: "pointer", whiteSpace: "nowrap" },
  copy: { margin: 0, lineHeight: 1.45, fontSize: 13 },
  label: { fontSize: 13, fontWeight: 700 },
  input: { border: "1px solid", borderRadius: 9, padding: 10, font: "inherit", outline: "none" },
  primary: { border: 0, borderRadius: 9, padding: "11px 12px", color: "#fff", font: "inherit", fontWeight: 800, cursor: "pointer" },
  notice: { margin: 0, fontSize: 12, lineHeight: 1.45 },
};
