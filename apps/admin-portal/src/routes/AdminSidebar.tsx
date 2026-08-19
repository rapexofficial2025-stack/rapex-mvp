import { useTheme } from "@rapex/ui-web";

export type AdminNavItem = { key: string; label: string; path: string };
type AdminSidebarProps = { items: AdminNavItem[]; activeKey?: string; onNavigate: (path: string) => void; onLogout: () => void };

const GROUPS: { label?: string; keys: string[] }[] = [
  { keys: ["dashboard"] },
  { label: "OPERATIONS", keys: ["command-center", "order-financials"] },
  { label: "MANAGEMENT", keys: ["users", "verification", "engine-center"] },
  { label: "SYSTEM", keys: ["integrations"] },
];

export function AdminSidebar({ items, activeKey, onNavigate, onLogout }: AdminSidebarProps) {
  const theme = useTheme();
  const byKey = new Map(items.map((item) => [item.key, item]));
  return <nav className="rapex-admin-sidebar" style={{ width: 184, minHeight: "100vh", flexShrink: 0, display: "flex", flexDirection: "column", padding: "16px 10px", background: theme.colors.surface, borderRight: `1px solid ${theme.colors.border}` }}>
    <div style={{ padding: "4px 10px 18px" }}>
      <img src={`${import.meta.env.BASE_URL}brand/wordmark-logo-v3.png`} alt="RAPEX Command Center" style={{ display: "block", width: 112, height: "auto" }} />
      <span style={{ display: "block", marginTop: 3, color: theme.colors.textSecondary, fontSize: 9, fontWeight: 800, letterSpacing: .6 }}>COMMAND CENTER</span>
    </div>
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
      {GROUPS.map((group, index) => <section key={group.label ?? index}>
        {group.label ? <p style={{ margin: "0 10px 7px", color: theme.colors.textSecondary, fontSize: 9, fontWeight: 800, letterSpacing: .7 }}>{group.label}</p> : null}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>{group.keys.map((key) => {
          const item = byKey.get(key); if (!item) return null; const active = item.key === activeKey;
          return <button key={item.key} type="button" onClick={() => onNavigate(item.path)} style={{ textAlign: "left", border: active ? `1px solid ${theme.colors.brandPrimary}` : "1px solid transparent", borderRadius: 7, padding: "9px 10px", background: active ? `${theme.colors.brandPrimary}1a` : "transparent", color: active ? theme.colors.textPrimary : theme.colors.textSecondary, font: "inherit", fontSize: 12, fontWeight: active ? 800 : 650, cursor: "pointer" }}>{item.label}</button>;
        })}</div>
      </section>)}
    </div>
    <button type="button" onClick={onLogout} style={{ textAlign: "left", border: `1px solid ${theme.colors.border}`, borderRadius: 7, padding: "9px 10px", background: "transparent", color: theme.colors.textSecondary, font: "inherit", fontSize: 12, cursor: "pointer" }}>Log out</button>
  </nav>;
}
