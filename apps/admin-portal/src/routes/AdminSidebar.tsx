import { useTheme } from "@rapex/ui-web";

export type AdminNavItem = { key: string; label: string; path: string };
type AdminSidebarProps = { items: AdminNavItem[]; activeKey?: string; onNavigate: (path: string) => void; onLogout: () => void };

const GROUPS: { label?: string; keys: string[] }[] = [
  { keys: ["dashboard"] },
  { label: "USERS", keys: ["users", "registration", "age-engine", "locations", "communities"] },
  { label: "ORDERS", keys: ["orders", "order-financials"] },
  { label: "DELIVERY", keys: ["command-center", "delivery", "riders"] },
  { label: "PRODUCTS", keys: ["products", "product-categories", "product-variants", "product-options", "product-images", "inventory"] },
  { label: "MARKETPLACE OPERATIONS", keys: ["merchants", "verification"] },
  { label: "SYSTEM", keys: ["engine-center", "integrations", "errors", "settings"] },
];

export function AdminSidebar({ items, activeKey, onNavigate, onLogout }: AdminSidebarProps) {
  const theme = useTheme();
  const byKey = new Map(items.map((item) => [item.key, item]));
  return <nav className="rapex-admin-sidebar" style={{ width: 252, height: "100vh", position: "sticky", top: 0, flexShrink: 0, display: "flex", flexDirection: "column", padding: "18px 12px", background: theme.colors.surface, borderRight: `1px solid ${theme.colors.border}` }}>
    <div style={{ padding: "4px 12px 20px" }}>
      <img src={`${import.meta.env.BASE_URL}brand/wordmark-logo-v3.png`} alt="RAPEX Command Center" style={{ display: "block", width: 132, height: "auto" }} />
      <span style={{ display: "block", marginTop: 3, color: theme.colors.textSecondary, fontSize: 9, fontWeight: 800, letterSpacing: .6 }}>COMMAND CENTER</span>
    </div>
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18, overflowY: "auto", paddingRight: 4 }}>
      {GROUPS.map((group, index) => <section key={group.label ?? index}>
        {group.label ? <p style={{ margin: "0 12px 8px", color: theme.colors.textSecondary, fontSize: 10, fontWeight: 800, letterSpacing: .8 }}>{group.label}</p> : null}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>{group.keys.map((key) => {
          const item = byKey.get(key); if (!item) return null; const active = item.key === activeKey;
          return <button key={item.key} className={`rapex-admin-nav-item${active ? " is-active" : ""}`} type="button" aria-current={active ? "page" : undefined} onClick={() => onNavigate(item.path)} style={{ minHeight: 40, textAlign: "left", border: active ? `1px solid ${theme.colors.brandPrimary}` : "1px solid transparent", borderRadius: 8, padding: "10px 12px", backgroundColor: active ? `${theme.colors.brandPrimary}14` : "transparent", color: active ? theme.colors.textPrimary : theme.colors.textSecondary, font: "inherit", fontSize: 14, fontWeight: active ? 750 : 600, cursor: "pointer" }}>{item.label}</button>;
        })}</div>
      </section>)}
    </div>
    <button className="rapex-glass-button rapex-admin-logout" type="button" onClick={onLogout} style={{ textAlign: "left", border: `1px solid ${theme.colors.border}`, borderRadius: 7, padding: "9px 10px", backgroundColor: "transparent", color: theme.colors.textSecondary, font: "inherit", fontSize: 12, cursor: "pointer" }}>Log out</button>
  </nav>;
}
