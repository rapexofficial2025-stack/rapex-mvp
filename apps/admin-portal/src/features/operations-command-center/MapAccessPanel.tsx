import { useState, type CSSProperties } from "react";
import { useTheme } from "@rapex/ui-web";

type MapAccessPanelProps = { onClose: () => void };

/** UI-only: map boundaries, colours and permissions require an audited Xano endpoint. */
export function MapAccessPanel({ onClose }: MapAccessPanelProps) {
  const theme = useTheme();
  const [adminEmail, setAdminEmail] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <aside style={{ ...styles.panel, background: theme.colors.surface, borderColor: theme.colors.border }} aria-label="Map command center settings">
      <div style={styles.header}>
        <div><p style={{ ...styles.eyebrow, color: theme.colors.brandPrimary }}>SUPER ADMIN ONLY</p><h2 style={{ ...styles.title, color: theme.colors.textPrimary }}>Map access & geo-fencing</h2></div>
        <button type="button" style={{ ...styles.close, color: theme.colors.textPrimary, borderColor: theme.colors.border }} onClick={onClose}>Close settings</button>
      </div>
      <p style={{ ...styles.copy, color: theme.colors.textSecondary }}>Prototype controls only. No map area, colour, or administrator permission is saved until the Xano audited access API is connected.</p>
      <label style={{ ...styles.label, color: theme.colors.textPrimary }} htmlFor="admin-map-email">Administrator email</label>
      <input id="admin-map-email" style={{ ...styles.input, color: theme.colors.textPrimary, borderColor: theme.colors.border, background: theme.colors.surfaceAlt }} value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} placeholder="admin@rapex.ph" type="email" />
      <fieldset style={{ ...styles.fieldset, borderColor: theme.colors.border }}>
        <legend style={{ color: theme.colors.textPrimary }}>Allowed view area</legend>
        <label style={{ ...styles.option, color: theme.colors.textPrimary }}><input type="radio" name="map-area" defaultChecked /> Assigned municipality only</label>
        <label style={{ ...styles.option, color: theme.colors.textPrimary }}><input type="radio" name="map-area" /> Assigned city cluster</label>
        <label style={{ ...styles.option, color: theme.colors.textPrimary }}><input type="radio" name="map-area" /> National view</label>
      </fieldset>
      <fieldset style={{ ...styles.fieldset, borderColor: theme.colors.border }}>
        <legend style={{ color: theme.colors.textPrimary }}>Geo-fence colour legend</legend>
        <div style={{ ...styles.legendRow, color: theme.colors.textSecondary }}><span style={{ ...styles.dot, background: "#34d399" }} /> Available riders <span style={{ ...styles.dot, background: "#fb923c" }} /> Active deliveries <span style={{ ...styles.dot, background: "#f87171" }} /> Attention required</div>
      </fieldset>
      <button type="button" style={{ ...styles.primary, background: theme.colors.brandPrimary }} onClick={() => setNotice(adminEmail ? "Xano endpoint required: the access rule has not been saved." : "Enter an administrator email before preparing this rule.")}>Prepare access rule</button>
      {notice ? <p role="status" style={{ ...styles.notice, color: theme.colors.textSecondary }}>{notice}</p> : null}
    </aside>
  );
}

const styles: Record<string, CSSProperties> = {
  panel: { position: "absolute", zIndex: 4, top: 16, right: 16, width: "min(410px, calc(100% - 32px))", maxHeight: "calc(100% - 32px)", overflowY: "auto", border: "1px solid", borderRadius: 16, padding: 20, boxShadow: "0 18px 46px rgba(0,0,0,.28)", display: "flex", flexDirection: "column", gap: 14 },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  eyebrow: { margin: 0, fontSize: 10, fontWeight: 800, letterSpacing: 1 },
  title: { margin: "4px 0 0", fontSize: 20 },
  close: { border: "1px solid", borderRadius: 8, background: "transparent", padding: "7px 9px", font: "inherit", cursor: "pointer", whiteSpace: "nowrap" },
  copy: { margin: 0, lineHeight: 1.45, fontSize: 13 },
  label: { fontSize: 13, fontWeight: 700 },
  input: { border: "1px solid", borderRadius: 9, padding: 10, font: "inherit", outline: "none" },
  fieldset: { margin: 0, border: "1px solid", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 8 },
  option: { fontSize: 13, display: "flex", alignItems: "center", gap: 8 },
  legend: { padding: "0 5px", fontSize: 13, fontWeight: 700 },
  legendRow: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, fontSize: 12 },
  dot: { width: 8, height: 8, borderRadius: "50%", display: "inline-block" },
  primary: { border: 0, borderRadius: 9, padding: "11px 12px", color: "#fff", font: "inherit", fontWeight: 800, cursor: "pointer" },
  notice: { margin: 0, fontSize: 12, lineHeight: 1.45 },
};
