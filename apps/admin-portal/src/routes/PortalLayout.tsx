import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useRepositories } from "@rapex/api-client";
import { OperationsRail } from "./OperationsRail";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", path: "/admin/dashboard" },
  { key: "command-center", label: "Command Center", path: "/admin/command-center" },
  { key: "users", label: "User Management", path: "/admin/users" },
  { key: "registration", label: "Registration Monitor", path: "/admin/registration" },
  { key: "age-engine", label: "Age Engine", path: "/admin/age-engine" },
  { key: "locations", label: "Locations", path: "/admin/locations" },
  { key: "communities", label: "Communities", path: "/admin/communities" },
  { key: "verification", label: "Verification", path: "/admin/verification" },
  { key: "merchants", label: "Merchants", path: "/admin/merchants" },
  { key: "products", label: "Product Monitoring", path: "/admin/products" },
  { key: "product-categories", label: "Product Categories", path: "/admin/product-categories" },
  { key: "product-images", label: "Product Images", path: "/admin/product-images" },
  { key: "product-variants", label: "Product Variants", path: "/admin/product-variants" },
  { key: "product-options", label: "Product Options", path: "/admin/product-options" },
  { key: "inventory", label: "Inventory", path: "/admin/inventory" },
  { key: "orders", label: "Order Management", path: "/admin/orders" },
  { key: "delivery", label: "Delivery Monitoring", path: "/admin/delivery" },
  { key: "riders", label: "Rider Management", path: "/admin/riders" },
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
      <AdminSidebar items={NAV_ITEMS} activeKey={activeItem?.key} onNavigate={(path) => navigate(routeFor(path))} onLogout={async () => {
              await auth.logout();
              navigate("/admin/login", { replace: true });
            }} />
      <div style={{ flex: 1, minWidth: 0, display: "flex" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
        <AdminTopbar />
        <main key={location.pathname} className="rapex-route-transition">
          <Outlet />
        </main>
        </div>
        <OperationsRail />
      </div>
    </div>
  );
}
