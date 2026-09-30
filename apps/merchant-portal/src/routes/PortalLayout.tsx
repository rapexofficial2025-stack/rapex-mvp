import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Badge, Sidebar, Topbar, ThemeToggle } from "@rapex/ui-web";
import { DEMO_MODE, demoSession } from "../services/demoMode";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", path: "/portal/dashboard" },
  { key: "orders", label: "Orders", path: "/portal/orders" },
  { key: "store", label: "Store", path: "/portal/store" },
];

export function PortalLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const activeItem = NAV_ITEMS.find((item) => location.pathname.startsWith(item.path));

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar
        title="RAPEX Merchant"
        items={NAV_ITEMS.map((item) => ({
          key: item.key,
          label: item.label,
          active: item.key === activeItem?.key,
          onClick: () => navigate(item.path),
        }))}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Topbar
          title={activeItem?.label ?? "RAPEX Merchant"}
          actions={
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {DEMO_MODE ? <Badge label="DEMO — sample data, nothing is saved" tone="warning" /> : null}
              {DEMO_MODE ? (
                <button
                  type="button"
                  onClick={() => {
                    demoSession.signOut();
                    navigate("/login");
                  }}
                  style={{ cursor: "pointer", background: "transparent", border: "1px solid currentColor", borderRadius: 8, padding: "6px 12px", color: "inherit" }}
                >
                  Sign out
                </button>
              ) : null}
              <ThemeToggle />
            </div>
          }
        />
        <Outlet />
      </div>
    </div>
  );
}
