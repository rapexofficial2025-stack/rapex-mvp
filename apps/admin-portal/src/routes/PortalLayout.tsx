import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button, Sidebar, Topbar, ThemeToggle } from "@rapex/ui-web";
import { useRepositories } from "@rapex/api-client";

const NAV_ITEMS = [
  { key: "dashboard", label: "📊 Dashboard", path: "/admin/dashboard" },
  { key: "command-center", label: "Command Center", path: "/admin/command-center" },
  { key: "verification", label: "🛡️ Verification", path: "/admin/verification" },
  { key: "engine-center", label: "⚙️ Engine Center", path: "/admin/engine-center" },
  { key: "order-financials", label: "💰 Order Financials", path: "/admin/order-financials" },
  { key: "integrations", label: "🔑 API Keys", path: "/admin/integrations" },
];

export function PortalLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useRepositories();

  const activeItem = NAV_ITEMS.find((item) => location.pathname.startsWith(item.path));

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar
        title={<img src={`${import.meta.env.BASE_URL}brand/wordmark-logo-v3.png`} alt="RAPEX" style={{ width: "100%", maxWidth: 160, height: "auto", display: "block" }} />}
        items={NAV_ITEMS.map((item) => ({
          key: item.key,
          label: item.label,
          active: item.key === activeItem?.key,
          onClick: () => navigate(item.path),
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
      <div style={{ flex: 1, minWidth: 0 }}>
        <Topbar title={activeItem?.label ?? "RAPEX Admin"} actions={<ThemeToggle />} />
        <Outlet />
      </div>
    </div>
  );
}
