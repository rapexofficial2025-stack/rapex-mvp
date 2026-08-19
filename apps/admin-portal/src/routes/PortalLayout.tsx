import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button, Sidebar, Topbar, ThemeToggle } from "@rapex/ui-web";
import { useRepositories } from "@rapex/api-client";
import { OperationsRail } from "./OperationsRail";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", path: "/admin/dashboard" },
  { key: "command-center", label: "Command Center", path: "/admin/command-center" },
  { key: "users", label: "User Management", path: "/admin/users" },
  { key: "verification", label: "Verification", path: "/admin/verification" },
  { key: "engine-center", label: "Engine Center", path: "/admin/engine-center" },
  { key: "order-financials", label: "Order Financials", path: "/admin/order-financials" },
  { key: "integrations", label: "Integrations", path: "/admin/integrations" },
];

export function PortalLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useRepositories();
  const isPreview = location.pathname.startsWith("/admin/preview");

  const routeFor = (path: string) => (isPreview ? path.replace("/admin/", "/admin/preview/") : path);
  const activeItem = NAV_ITEMS.find((item) => location.pathname.startsWith(routeFor(item.path)));

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar
        title={<img src={`${import.meta.env.BASE_URL}brand/wordmark-logo-v3.png`} alt="RAPEX" style={{ width: "100%", maxWidth: 160, height: "auto", display: "block" }} />}
        items={NAV_ITEMS.map((item) => ({
          key: item.key,
          label: item.label,
          active: item.key === activeItem?.key,
          onClick: () => navigate(routeFor(item.path)),
        }))}
        footer={
          <Button
            label="Log Out"
            variant="secondary"
            onClick={async () => {
              await auth.logout();
              navigate("/admin/login", { replace: true });
            }}
          />
        }
      />
      <div style={{ flex: 1, minWidth: 0, display: "flex" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
        <Topbar title={activeItem?.label ?? "RAPEX Admin"} actions={<ThemeToggle />} />
        <main key={location.pathname} className="rapex-route-transition">
          <Outlet />
        </main>
        </div>
        <OperationsRail />
      </div>
    </div>
  );
}
