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

function App() {
  return (
    <BrowserRouter>
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
