import { ThemeToggle, useTheme } from "@rapex/ui-web";

export function AdminTopbar() {
  const theme = useTheme();
  return <header style={{ height: 48, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", background: theme.colors.surface, borderBottom: `1px solid ${theme.colors.border}` }}>
    <label style={{ width: "min(330px, 45vw)" }}><span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>Search command center</span><input style={{ width: "100%", padding: "8px 10px", background: theme.colors.surfaceAlt, border: `1px solid ${theme.colors.border}`, borderRadius: 7, color: theme.colors.textPrimary, font: "inherit", fontSize: 12, outline: "none" }} placeholder="Search orders, users, stores, riders…" /></label>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={{ color: theme.colors.textSecondary, fontSize: 11 }}>Admin workspace</span><ThemeToggle /></div>
  </header>;
}
