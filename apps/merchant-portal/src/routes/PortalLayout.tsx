import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Sidebar, Topbar, ThemeToggle } from "@rapex/ui-web";

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
        <Topbar title={activeItem?.label ?? "RAPEX Merchant"} actions={<ThemeToggle />} />
        <main key={location.pathname} className="rapex-route-transition">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
