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
        <Route path="/admin/register" element={<RegisterPage />} />
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
