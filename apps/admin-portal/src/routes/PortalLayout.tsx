import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Sidebar, Topbar } from "@rapex/ui-web";

const NAV_ITEMS = [
  { key: "command-center", label: "Command Center", path: "/admin/command-center" },
  { key: "engine-center", label: "⚙️ Engine Center", path: "/admin/engine-center" },
];

export function PortalLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const activeItem = NAV_ITEMS.find((item) => location.pathname.startsWith(item.path));

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar
        title="RAPEX Admin"
        items={NAV_ITEMS.map((item) => ({
          key: item.key,
          label: item.label,
          active: item.key === activeItem?.key,
          onClick: () => navigate(item.path),
        }))}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Topbar title={activeItem?.label ?? "RAPEX Admin"} />
        <Outlet />
      </div>
    </div>
  );
}
