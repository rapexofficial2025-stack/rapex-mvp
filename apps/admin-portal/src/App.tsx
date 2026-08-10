import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { PortalLayout } from "./routes/PortalLayout";
import { CommandCenterPage } from "./routes/CommandCenterPage";
import { EngineCenterPage } from "./features/engine-center/EngineCenterPage";
import { OrderFinancialsPage } from "./features/order-financials/OrderFinancialsPage";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { VerificationQueuePage } from "./features/verification/VerificationQueuePage";
import { LoginPage } from "./features/auth/LoginPage";
import { RequireAdminAuth } from "./features/auth/RequireAdminAuth";
import { XanoLiveTestPage } from "./routes/XanoLiveTestPage";
import { IntegrationsPage } from "./features/integrations/IntegrationsPage";

// GitHub Pages staging serves this app from a repo-name subpath (e.g.
// /rapex-mvp/) via VITE_BASE_PATH -- see vite.config.ts. The app's own
// routes already assume an "/admin/..." prefix (that's the real production
// URL shape, admin living under the main domain's /admin path), so the
// router basename only needs to strip the repo-name segment Pages adds on
// top, not "/admin" itself. Defaults to "/" (no-op) for normal local/prod
// builds where BASE_URL is unset.
const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

function App() {
  return (
    <BrowserRouter basename={routerBasename}>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/xano-test" element={<XanoLiveTestPage />} />
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
