import { useEffect, useState, type CSSProperties } from "react";
import { useTheme } from "@rapex/ui-web";

export type AdminNavItem = { key: string; label: string; path: string };
type AdminSidebarProps = {
  items: AdminNavItem[];
  activeKey?: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  isMobile?: boolean;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
};

const GROUPS: { label?: string; keys: string[] }[] = [
  { keys: ["dashboard"] },
  { label: "USERS", keys: ["users", "registration", "age-engine", "locations", "communities"] },
  { label: "ORDERS", keys: ["orders", "order-financials"] },
  { label: "DELIVERY", keys: ["command-center", "delivery", "riders"] },
  { label: "CATALOG", keys: ["products", "product-categories", "service-categories", "product-variants", "product-options", "product-images", "inventory"] },
  { label: "MARKETPLACE OPERATIONS", keys: ["merchants", "service-providers", "verification"] },
  { label: "SYSTEM", keys: ["engine-center", "integrations", "errors", "settings"] },
  { label: "SUPER ADMIN", keys: ["super-admin", "super-admin-admins", "super-admin-users", "super-admin-stores", "super-admin-catalog", "super-admin-engines", "super-admin-audit", "receipt-design", "exports"] },
];

export function AdminSidebar({ items, activeKey, onNavigate, onLogout, isMobile, mobileOpen, onCloseMobile }: AdminSidebarProps) {
  const theme = useTheme();
  const byKey = new Map(items.map((item) => [item.key, item]));
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(GROUPS.flatMap((group) => group.label ? [group.label] : [])),
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const activeGroup = GROUPS.find((group) => group.label && group.keys.includes(activeKey ?? ""));
    if (!activeGroup?.label) return;
    setExpandedGroups((current) => {
      if (current.has(activeGroup.label!)) return current;
      const next = new Set(current);
      next.add(activeGroup.label!);
      return next;
    });
  }, [activeKey]);

  const toggleGroup = (label: string) => {
    setExpandedGroups((current) => {
      const next = new Set(current);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const navigateAndMaybeClose = (path: string) => {
    onNavigate(path);
    if (isMobile) onCloseMobile?.();
  };

  const mobileStyle: CSSProperties = isMobile
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: 260,
        zIndex: 200,
        marginLeft: 0,
        borderRadius: 0,
        transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.25s ease",
      }
    : {};

  return <>
    {isMobile && mobileOpen ? (
      <div
        onClick={onCloseMobile}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 190 }}
        aria-hidden="true"
      />
    ) : null}
    <nav className="rapex-admin-sidebar" data-collapsed={sidebarCollapsed} style={{ width: sidebarCollapsed ? 76 : 252, height: "calc(100vh - 24px)", position: "sticky", top: 12, flexShrink: 0, display: "flex", flexDirection: "column", padding: sidebarCollapsed ? "14px 9px" : "18px 12px", marginLeft: 12, ...mobileStyle }}>
    <div className="rapex-admin-sidebar-header">
      <div className="rapex-admin-sidebar-brand">
        <img src={`${import.meta.env.BASE_URL}brand/wordmark-logo-v3.png`} alt="RAPEX Command Center" style={{ display: "block", width: sidebarCollapsed && !isMobile ? 42 : 132, height: "auto" }} />
        <span className="rapex-admin-sidebar-caption" style={{ color: theme.colors.textSecondary }}>COMMAND CENTER</span>
      </div>
      <button
        className="rapex-admin-sidebar-toggle"
        type="button"
        aria-expanded={isMobile ? mobileOpen : !sidebarCollapsed}
        aria-controls="rapex-admin-sidebar-content"
        aria-label={isMobile ? "Close menu" : sidebarCollapsed ? "Expand Admin sidebar" : "Collapse Admin sidebar"}
        onClick={() => (isMobile ? onCloseMobile?.() : setSidebarCollapsed((current) => !current))}
      >
        {isMobile ? "Close" : sidebarCollapsed ? "Open" : "Collapse"}
      </button>
    </div>
    <div id="rapex-admin-sidebar-content" className="rapex-admin-sidebar-content" aria-hidden={sidebarCollapsed}>
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: 18, overflowY: "auto", paddingRight: 4 }}>
      {GROUPS.map((group, index) => {
        const expanded = group.label ? expandedGroups.has(group.label) : true;
        const groupId = `rapex-admin-nav-group-${group.label?.toLowerCase().replace(/\s+/g, "-") ?? index}`;
        return <section key={group.label ?? index}>
        {group.label ? <button className="rapex-admin-group-title" type="button" tabIndex={sidebarCollapsed ? -1 : undefined} aria-expanded={expanded} aria-controls={groupId} data-expanded={expanded} onClick={() => toggleGroup(group.label!)} style={{ color: theme.colors.textSecondary }}><span>{group.label}</span><span className="rapex-admin-group-chevron" aria-hidden="true">⌄</span></button> : null}
        <div id={groupId} className="rapex-admin-nav-collapse" data-expanded={expanded} aria-hidden={group.label ? !expanded : undefined}>
          <div className="rapex-admin-nav-items">{group.keys.map((key) => {
          const item = byKey.get(key); if (!item) return null; const active = item.key === activeKey;
          return <button key={item.key} className={`rapex-admin-nav-item${active ? " is-active" : ""}`} type="button" tabIndex={!sidebarCollapsed && expanded ? undefined : -1} aria-current={active ? "page" : undefined} onClick={() => navigateAndMaybeClose(item.path)} style={{ minHeight: 40, textAlign: "left", border: active ? `1px solid ${theme.colors.brandPrimary}` : "1px solid transparent", borderRadius: 8, padding: "10px 12px", backgroundColor: active ? `${theme.colors.brandPrimary}14` : "transparent", color: active ? theme.colors.textPrimary : theme.colors.textSecondary, font: "inherit", fontSize: 14, fontWeight: active ? 750 : 600, cursor: "pointer" }}>{item.label}</button>;
        })}</div>
        </div>
      </section>;
      })}
    </div>
    <button className="rapex-glass-button rapex-admin-logout" type="button" tabIndex={sidebarCollapsed ? -1 : undefined} onClick={onLogout} style={{ textAlign: "left", border: "1px solid rgba(255,255,255,.16)", borderRadius: 7, padding: "9px 10px", backgroundColor: "transparent", color: theme.colors.textSecondary, font: "inherit", fontSize: 12, cursor: "pointer" }}>Log out</button>
    </div>
  </nav>
  </>;
}
