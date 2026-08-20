import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useThemeMode } from "@rapex/ui-web";
import { useRepositories, type AuthUser } from "@rapex/api-client";
import { MerchantStoreProvider } from "../features/workspace/MerchantStoreProvider";
import { useMerchantStoreWorkspace } from "../features/workspace/useMerchantStoreWorkspace";

type NavItem = { key: string; label: string; path?: string; stage?: string };
type NavGroup = { key: string; label: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  { key: "overview", label: "Overview", items: [{ key: "dashboard", label: "Dashboard", path: "/portal/dashboard" }] },
  { key: "stores", label: "Store Management", items: [{ key: "stores", label: "My Stores", path: "/portal/store" }, { key: "branches", label: "Branches", stage: "Next module" }] },
  { key: "catalog", label: "Listings", items: [{ key: "create-listing", label: "Create Listing", path: "/portal/listings/new" }, { key: "products", label: "Add Product", path: "/portal/products/add" }, { key: "services", label: "Services", stage: "Capability required" }, { key: "auction", label: "Auction", stage: "Capability required" }, { key: "pre-loved", label: "Pre-Loved", stage: "Contract required" }, { key: "inventory", label: "Inventory", stage: "Inventory module" }] },
  { key: "operations", label: "Operations", items: [{ key: "orders", label: "Orders", path: "/portal/orders" }, { key: "receipts", label: "Receipt History", path: "/portal/receipts" }, { key: "delivery", label: "Delivery", stage: "Planned" }] },
  { key: "finance", label: "Finance & Growth", items: [{ key: "wallet", label: "Wallet", path: "/portal/wallet" }, { key: "vouchers", label: "Vouchers", path: "/portal/vouchers" }, { key: "financials", label: "Financials", stage: "Planned" }, { key: "marketing", label: "Marketing", stage: "Planned" }, { key: "analytics", label: "Analytics", stage: "Planned" }] },
  { key: "settings", label: "Account", items: [{ key: "capabilities", label: "My Capabilities", path: "/portal/capabilities" }, { key: "notifications", label: "Notifications", stage: "Contract required" }, { key: "profile", label: "Profile", stage: "Planned" }, { key: "support", label: "Support", stage: "Planned" }] },
];

function NavMark({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="M8 12h8M12 8v8" className={active ? "is-active" : undefined} />
    </svg>
  );
}

export function PortalLayout({ previewMode = false }: { previewMode?: boolean }) {
  return <MerchantStoreProvider><PortalShell previewMode={previewMode} /></MerchantStoreProvider>;
}

function PortalShell({ previewMode }: { previewMode: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleMode } = useThemeMode();
  const { auth } = useRepositories();
  const { stores, currentStoreId, currentStore, loading: storesLoading, error: storesError, setCurrentStoreId } = useMerchantStoreWorkspace();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState(() => new Set(["overview", "stores"]));
  const [query, setQuery] = useState("");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const previewBase = previewMode ? "/portal/preview" : "/portal";

  useEffect(() => {
    if (previewMode) return;
    let active = true;
    auth.getCurrentUser().then((current) => {
      if (active) setUser(current);
    });
    return () => {
      active = false;
    };
  }, [auth, previewMode]);

  const groups = useMemo(
    () =>
      NAV_GROUPS.map((group) => ({
        ...group,
        items: group.items.map((item) => ({
          ...item,
          path: item.path ? item.path.replace("/portal", previewBase) : undefined,
        })),
      })),
    [previewBase],
  );

  const activeItem = groups.flatMap((group) => group.items).find((item) => item.path && location.pathname.startsWith(item.path));
  const searchableItems = groups.flatMap((group) => group.items).filter((item) => item.path && item.label.toLowerCase().includes(query.trim().toLowerCase()));

  function toggleGroup(key: string) {
    setExpandedGroups((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function logout() {
    await auth.logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className={collapsed ? "merchant-shell is-collapsed" : "merchant-shell"}>
      <aside className="merchant-sidebar">
        <div className="merchant-sidebar__brand">
          <span className="merchant-sidebar__monogram">R</span>
          <span className="merchant-sidebar__brand-copy"><strong>RAPEX</strong><small>Merchant OS</small></span>
        </div>
        <button className="merchant-sidebar__collapse" type="button" onClick={() => setCollapsed((value) => !value)}>
          <span aria-hidden="true">{collapsed ? "→" : "←"}</span>
          <span>{collapsed ? "Expand" : "Collapse"}</span>
        </button>

        <nav className="merchant-sidebar__nav" aria-label="Merchant portal navigation">
          {groups.map((group) => {
            const expanded = expandedGroups.has(group.key);
            return (
              <section className="merchant-nav-group" key={group.key}>
                <button className="merchant-nav-group__title" type="button" aria-expanded={expanded} onClick={() => toggleGroup(group.key)}>
                  <span>{group.label}</span><span aria-hidden="true">{expanded ? "−" : "+"}</span>
                </button>
                {expanded ? (
                  <div className="merchant-nav-group__items">
                    {group.items.map((item) => {
                      const active = Boolean(item.path && location.pathname.startsWith(item.path));
                      if (!item.path || (previewMode && item.key === "stores")) {
                        return <span className="merchant-nav-item is-planned" key={item.key}><NavMark active={false} /><span>{item.label}</span><small>{previewMode && item.key === "stores" ? "Sign in" : item.stage}</small></span>;
                      }
                      return (
                        <button className={active ? "merchant-nav-item is-active" : "merchant-nav-item"} type="button" key={item.key} onClick={() => navigate(item.path!)}>
                          <NavMark active={active} /><span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </section>
            );
          })}
        </nav>
        <div className="merchant-sidebar__footer"><span>RAPEX Ecosystem</span><small>One account · capability-aware</small></div>
      </aside>

      <div className="merchant-workspace">
        <header className="merchant-topbar">
          <div className="merchant-topbar__title"><small>Merchant / {activeItem?.label ?? "Workspace"}</small><strong>{activeItem?.label ?? "RAPEX Merchant"}</strong></div>
          <label className="merchant-global-store">
            <span>Current store</span>
            <select value={currentStoreId ?? ""} disabled={storesLoading || stores.length === 0} onChange={(event) => setCurrentStoreId(event.target.value)}>
              {stores.length === 0 ? <option value="">{storesLoading ? "Loading stores…" : "No store available"}</option> : null}
              {stores.map((store) => <option key={store.id} value={store.id}>{store.name} · {store.status}</option>)}
            </select>
            <small>{storesError ?? currentStore?.address ?? "Store-specific requests follow this selection."}</small>
          </label>
          <div className="merchant-topbar__search">
            <label><span className="sr-only">Search merchant navigation</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search merchant tools…" /></label>
            {query.trim() ? (
              <div className="merchant-search-results">
                {searchableItems.length ? searchableItems.map((item) => <button key={item.key} type="button" onClick={() => { navigate(item.path!); setQuery(""); }}>{item.label}</button>) : <span>No available Module 1 route</span>}
              </div>
            ) : null}
          </div>
          <div className="merchant-topbar__actions">
            <button className="merchant-theme-control" type="button" onClick={toggleMode} aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}><span aria-hidden="true">{mode === "dark" ? "D" : "L"}</span><span>{mode === "dark" ? "Dark" : "Light"}</span></button>
            <button type="button" onClick={() => setNotice("Notification API contract is required before this panel can show live records.")}>Notifications</button>
            <button className="merchant-topbar__print" type="button" onClick={() => window.print()}>Print current view</button>
            <div className="merchant-profile">
              <button type="button" onClick={() => setProfileOpen((value) => !value)} aria-expanded={profileOpen}>
                <span>{(user?.name ?? "Merchant Preview").charAt(0)}</span>
                <span className="merchant-profile__copy"><strong>{user?.name ?? "Merchant Preview"}</strong><small>{previewMode ? "UI preview" : "Merchant"}</small></span>
              </button>
              {profileOpen ? (
                <div className="merchant-profile__menu">
                  <span>{user?.email ?? "No account used in preview"}</span>
                  <button type="button" onClick={() => { navigate(previewMode ? "/portal/preview/capabilities" : "/portal/capabilities"); setProfileOpen(false); }}>My capabilities</button>
                  {previewMode ? <button type="button" onClick={() => navigate("/login")}>Open real sign in</button> : <button type="button" onClick={logout}>Sign out</button>}
                </div>
              ) : null}
            </div>
          </div>
        </header>
        {notice ? <div className="merchant-shell-notice" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice(null)}>Dismiss</button></div> : null}
        {previewMode ? <div className="merchant-preview-banner">UI preview only — no account, order, payment, or Xano success is being simulated.</div> : null}
        <main key={location.pathname} className="rapex-route-transition merchant-route"><Outlet /></main>
      </div>
    </div>
  );
}
