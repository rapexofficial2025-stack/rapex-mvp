import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { PortalLayout } from "./routes/PortalLayout";
import { CommandCenterPage } from "./routes/CommandCenterPage";
import { EngineCenterPage } from "./features/engine-center/EngineCenterPage";
import { OrderFinancialsPage } from "./features/order-financials/OrderFinancialsPage";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { VerificationQueuePage } from "./features/verification/VerificationQueuePage";
import { LoginPage } from "./features/auth/LoginPage";
import { RegisterPage } from "./features/auth/RegisterPage";
import { ForgotPasswordPage } from "./features/auth/ForgotPasswordPage";
import { RequireAdminAuth } from "./features/auth/RequireAdminAuth";
import { XanoLiveTestPage } from "./routes/XanoLiveTestPage";
import { IntegrationsPage } from "./features/integrations/IntegrationsPage";
import { UserManagementPage } from "./features/user-management/UserManagementPage";
import { ProductMonitoringPage } from "./features/product-monitoring/ProductMonitoringPage";
import { AdminDataModulePage } from "./features/master-data/AdminDataModulePage";
import { CategoryEnginePage } from "./features/ecosystem/CategoryEnginePage";
import { ServiceProvidersPage } from "./features/ecosystem/ServiceProvidersPage";
import { ReceiptDesignPage } from "./features/receipts/ReceiptDesignPage";
import { ExportCenterPage } from "./features/receipts/ExportCenterPage";
import { SuperAdminAccessPage } from "./features/super-admin/SuperAdminAccessPage";
import { SuperAdminModulePage } from "./features/super-admin/SuperAdminModulePage";
import { AdminProfilePage } from "./features/profile/AdminProfilePage";

// GitHub Pages staging can serve this app two ways: (a) owning the whole
// site root under a repo-name prefix (VITE_BASE_PATH=/rapex-mvp/, the
// admin-only deploy), or (b) as a subfolder alongside other portals
// (VITE_BASE_PATH=/rapex-mvp/admin/, the combined multi-app deploy). The
// app's own routes already assume an "/admin/..." prefix (the real
// production URL shape, admin living under the main domain's /admin path),
// so a trailing "/admin" segment in BASE_URL would double up with the
// routes' own prefix -- strip it if present so both deploy shapes resolve
// to the same effective basename. Defaults to "/" (no-op) for normal
// local/prod builds where BASE_URL is unset.
const strippedBaseUrl = import.meta.env.BASE_URL.replace(/\/$/, "");
const routerBasename = (strippedBaseUrl.endsWith("/admin") ? strippedBaseUrl.slice(0, -"/admin".length) : strippedBaseUrl) || "/";

function App() {
  return (
    <BrowserRouter basename={routerBasename}>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin/register" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/invite/:token" element={<RegisterPage />} />
        <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/xano-test" element={<XanoLiveTestPage />} />
        <Route path="/admin/preview" element={<PortalLayout />}>
          <Route index element={<Navigate to="/admin/preview/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="command-center" element={<CommandCenterPage />} />
          <Route path="verification" element={<VerificationQueuePage />} />
          <Route path="engine-center" element={<EngineCenterPage />} />
          <Route path="order-financials" element={<OrderFinancialsPage />} />
          <Route path="integrations" element={<IntegrationsPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="products" element={<ProductMonitoringPage />} />
          <Route path="registration" element={<AdminDataModulePage module="registration" />} />
          <Route path="age-engine" element={<AdminDataModulePage module="age-engine" />} />
          <Route path="locations" element={<AdminDataModulePage module="locations" />} />
          <Route path="communities" element={<AdminDataModulePage module="communities" />} />
          <Route path="merchants" element={<AdminDataModulePage module="merchants" />} />
          <Route path="product-categories" element={<CategoryEnginePage initialDomain="Product" />} />
          <Route path="service-categories" element={<CategoryEnginePage initialDomain="Service" />} />
          <Route path="service-providers" element={<ServiceProvidersPage />} />
          <Route path="product-images" element={<AdminDataModulePage module="product-images" />} />
          <Route path="product-variants" element={<AdminDataModulePage module="product-variants" />} />
          <Route path="product-options" element={<AdminDataModulePage module="product-options" />} />
          <Route path="inventory" element={<AdminDataModulePage module="inventory" />} />
          <Route path="orders" element={<AdminDataModulePage module="orders" />} />
          <Route path="delivery" element={<AdminDataModulePage module="delivery" />} />
          <Route path="riders" element={<AdminDataModulePage module="riders" />} />
          <Route path="errors" element={<AdminDataModulePage module="errors" />} />
          <Route path="settings" element={<AdminDataModulePage module="system-settings" />} />
          <Route path="profile" element={<AdminProfilePage />} />
          <Route path="receipt-design" element={<Navigate to="/admin/preview/super-admin/receipt-design" replace />} />
          <Route path="exports" element={<Navigate to="/admin/preview/super-admin/exports" replace />} />
          <Route path="super-admin" element={<SuperAdminAccessPage previewMode />} />
          <Route path="super-admin/admins" element={<SuperAdminModulePage module="admins" previewMode />} />
          <Route path="super-admin/users" element={<SuperAdminModulePage module="users" previewMode />} />
          <Route path="super-admin/stores" element={<SuperAdminModulePage module="stores" previewMode />} />
          <Route path="super-admin/catalog" element={<SuperAdminModulePage module="catalog" previewMode />} />
          <Route path="super-admin/engines" element={<SuperAdminModulePage module="engines" previewMode />} />
          <Route path="super-admin/audit" element={<SuperAdminModulePage module="audit" previewMode />} />
          <Route path="super-admin/receipt-design" element={<ReceiptDesignPage />} />
          <Route path="super-admin/exports" element={<ExportCenterPage />} />
        </Route>
        <Route
          path="/admin"
          element={
            <RequireAdminAuth>
              <PortalLayout />
            </RequireAdminAuth>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="command-center" element={<CommandCenterPage />} />
          <Route path="verification" element={<VerificationQueuePage />} />
          <Route path="engine-center" element={<EngineCenterPage />} />
          <Route path="order-financials" element={<OrderFinancialsPage />} />
          <Route path="integrations" element={<IntegrationsPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="products" element={<ProductMonitoringPage />} />
          <Route path="registration" element={<AdminDataModulePage module="registration" />} />
          <Route path="age-engine" element={<AdminDataModulePage module="age-engine" />} />
          <Route path="locations" element={<AdminDataModulePage module="locations" />} />
          <Route path="communities" element={<AdminDataModulePage module="communities" />} />
          <Route path="merchants" element={<AdminDataModulePage module="merchants" />} />
          <Route path="product-categories" element={<CategoryEnginePage initialDomain="Product" />} />
          <Route path="service-categories" element={<CategoryEnginePage initialDomain="Service" />} />
          <Route path="service-providers" element={<ServiceProvidersPage />} />
          <Route path="product-images" element={<AdminDataModulePage module="product-images" />} />
          <Route path="product-variants" element={<AdminDataModulePage module="product-variants" />} />
          <Route path="product-options" element={<AdminDataModulePage module="product-options" />} />
          <Route path="inventory" element={<AdminDataModulePage module="inventory" />} />
          <Route path="orders" element={<AdminDataModulePage module="orders" />} />
          <Route path="delivery" element={<AdminDataModulePage module="delivery" />} />
          <Route path="riders" element={<AdminDataModulePage module="riders" />} />
          <Route path="errors" element={<AdminDataModulePage module="errors" />} />
          <Route path="settings" element={<AdminDataModulePage module="system-settings" />} />
          <Route path="profile" element={<AdminProfilePage />} />
          <Route path="receipt-design" element={<Navigate to="/admin/super-admin/receipt-design" replace />} />
          <Route path="exports" element={<Navigate to="/admin/super-admin/exports" replace />} />
          <Route path="super-admin" element={<SuperAdminAccessPage />} />
          <Route path="super-admin/admins" element={<SuperAdminModulePage module="admins" />} />
          <Route path="super-admin/users" element={<SuperAdminModulePage module="users" />} />
          <Route path="super-admin/stores" element={<SuperAdminModulePage module="stores" />} />
          <Route path="super-admin/catalog" element={<SuperAdminModulePage module="catalog" />} />
          <Route path="super-admin/engines" element={<SuperAdminModulePage module="engines" />} />
          <Route path="super-admin/audit" element={<SuperAdminModulePage module="audit" />} />
          <Route path="super-admin/receipt-design" element={<ReceiptDesignPage />} />
          <Route path="super-admin/exports" element={<ExportCenterPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
