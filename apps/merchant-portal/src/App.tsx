import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { PortalLayout } from "./routes/PortalLayout";
import { DashboardPage } from "./routes/DashboardPage";
import { OrdersPage } from "./routes/OrdersPage";
import { LoginPage } from "./routes/LoginPage";
import { XanoLiveTestPage } from "./routes/XanoLiveTestPage";
import { StorePage } from "./features/store/StorePage";

// GitHub Pages staging serves this app from a /<repo>/ or /<repo>/merchant/
// subpath via VITE_BASE_PATH -- see vite.config.ts. Unlike admin-portal,
// this app's own routes use a "/portal/..." prefix that doesn't collide
// with the "merchant" deploy-folder name, so no special stripping is
// needed here. Defaults to "/" (no-op) for normal local/prod builds.
const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

function App() {
  return (
    <BrowserRouter basename={routerBasename}>
      <Routes>
        <Route path="/" element={<Navigate to="/portal/store" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/xano-test" element={<XanoLiveTestPage />} />
        <Route path="/portal" element={<PortalLayout />}>
          <Route index element={<Navigate to="/portal/store" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="store" element={<StorePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
