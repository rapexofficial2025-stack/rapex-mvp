import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useRepositories } from "@rapex/api-client";
import { OperationsRail } from "./OperationsRail";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import { IdleSessionGuard } from "../shared/IdleSessionGuard";
import { recordAdminLogout } from "../services/sessionAudit";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", path: "/admin/dashboard" },
  { key: "users", label: "User Management", path: "/admin/users" },
  { key: "registration", label: "Registration Monitor", path: "/admin/registration" },
  { key: "age-engine", label: "Age Engine", path: "/admin/age-engine" },
  { key: "locations", label: "Locations", path: "/admin/locations" },
  { key: "communities", label: "Communities", path: "/admin/communities" },
  { key: "orders", label: "All Orders", path: "/admin/orders" },
  { key: "order-financials", label: "Order Financials", path: "/admin/order-financials" },
  { key: "command-center", label: "Live Map", path: "/admin/command-center" },
  { key: "delivery", label: "Active Deliveries", path: "/admin/delivery" },
  { key: "riders", label: "Riders", path: "/admin/riders" },
  { key: "products", label: "Product Monitoring", path: "/admin/products" },
  { key: "product-categories", label: "Product Categories", path: "/admin/product-categories" },
  { key: "service-categories", label: "Service Categories", path: "/admin/service-categories" },
  { key: "product-variants", label: "Product Variants", path: "/admin/product-variants" },
  { key: "product-options", label: "Product Options", path: "/admin/product-options" },
  { key: "product-images", label: "Product Images", path: "/admin/product-images" },
  { key: "inventory", label: "Inventory", path: "/admin/inventory" },
  { key: "merchants", label: "Merchants", path: "/admin/merchants" },
  { key: "service-providers", label: "Service Providers", path: "/admin/service-providers" },
  { key: "verification", label: "Verification", path: "/admin/verification" },
  { key: "engine-center", label: "Engine Center", path: "/admin/engine-center" },
  { key: "integrations", label: "Integrations", path: "/admin/integrations" },
  { key: "errors", label: "Error Center", path: "/admin/errors" },
  { key: "settings", label: "Operational Settings", path: "/admin/settings" },
  { key: "profile", label: "My Profile", path: "/admin/profile" },
  { key: "super-admin", label: "Security Access", path: "/admin/super-admin" },
  { key: "super-admin-admins", label: "Admin Accounts", path: "/admin/super-admin/admins" },
  { key: "super-admin-users", label: "Users & Roles", path: "/admin/super-admin/users" },
  { key: "super-admin-stores", label: "Stores & Merchants", path: "/admin/super-admin/stores" },
  { key: "super-admin-catalog", label: "Products & Listings", path: "/admin/super-admin/catalog" },
  { key: "super-admin-engines", label: "Formula Engines", path: "/admin/super-admin/engines" },
  { key: "super-admin-audit", label: "Audit & Recovery", path: "/admin/super-admin/audit" },
  { key: "receipt-design", label: "Receipt Design", path: "/admin/super-admin/receipt-design" },
  { key: "exports", label: "Secure Exports", path: "/admin/super-admin/exports" },
];

export function PortalLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useRepositories();
  const isPreview = location.pathname.startsWith("/admin/preview");

  const routeFor = (path: string) => (isPreview ? path.replace("/admin/", "/admin/preview/") : path);
  const activeItem = NAV_ITEMS.find((item) => location.pathname.startsWith(routeFor(item.path)));

  return (
    <div className="rapex-admin-shell" style={{ display: "flex", minHeight: "100vh" }}>
      <AdminSidebar items={NAV_ITEMS} activeKey={activeItem?.key} onNavigate={(path) => navigate(routeFor(path))} onLogout={async () => {
              if (!isPreview) recordAdminLogout("user_manual");
              await auth.logout();
              navigate("/admin/login", { replace: true });
            }} />
      <div style={{ flex: 1, minWidth: 0, display: "flex" }}>
        <div className="rapex-admin-workspace" style={{ flex: 1, minWidth: 0 }}>
        <AdminTopbar />
        <main key={location.pathname} className="rapex-route-transition">
          {isPreview ? <Outlet /> : <IdleSessionGuard><Outlet /></IdleSessionGuard>}
        </main>
        </div>
        <OperationsRail />
      </div>
    </div>
  );
}
