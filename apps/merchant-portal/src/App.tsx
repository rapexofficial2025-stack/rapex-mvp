import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { PortalLayout } from "./routes/PortalLayout";
import { DashboardPage } from "./routes/DashboardPage";
import { OrdersPage } from "./routes/OrdersPage";
import { LoginPage } from "./routes/LoginPage";
import { RegisterPage } from "./routes/RegisterPage";
import { ForgotPasswordPage } from "./routes/ForgotPasswordPage";
import { RequireMerchantAuth } from "./routes/RequireMerchantAuth";
import { XanoLiveTestPage } from "./routes/XanoLiveTestPage";
import { StorePage } from "./features/store/StorePage";
import { CapabilityCenterPage } from "./features/capabilities/CapabilityCenterPage";
import { ListingTypeSelectorPage } from "./features/listings/ListingTypeSelectorPage";
import { ReceiptHistoryPage } from "./features/receipts/ReceiptHistoryPage";
import { MerchantWalletPage } from "./features/wallet/MerchantWalletPage";

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
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/xano-test" element={<XanoLiveTestPage />} />
        {import.meta.env.DEV ? (
          <Route path="/portal/preview" element={<PortalLayout previewMode />}>
            <Route index element={<Navigate to="/portal/preview/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage previewMode />} />
            <Route path="capabilities" element={<CapabilityCenterPage previewMode />} />
            <Route path="listings/new" element={<ListingTypeSelectorPage previewMode />} />
            <Route path="receipts" element={<ReceiptHistoryPage />} />
            <Route path="wallet" element={<MerchantWalletPage />} />
          </Route>
        ) : null}
        <Route
          path="/portal"
          element={
            <RequireMerchantAuth>
              <PortalLayout />
            </RequireMerchantAuth>
          }
        >
          <Route index element={<Navigate to="/portal/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="store" element={<StorePage />} />
          <Route path="capabilities" element={<CapabilityCenterPage />} />
          <Route path="listings/new" element={<ListingTypeSelectorPage />} />
          <Route path="receipts" element={<ReceiptHistoryPage />} />
          <Route path="wallet" element={<MerchantWalletPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
