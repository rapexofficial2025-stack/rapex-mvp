import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { PortalLayout } from "./routes/PortalLayout";
import { DashboardPage } from "./routes/DashboardPage";
import { OrdersPage } from "./routes/OrdersPage";
import { LoginPage } from "./routes/LoginPage";
import { XanoLiveTestPage } from "./routes/XanoLiveTestPage";
import { StorePage } from "./features/store/StorePage";

function App() {
  return (
    <BrowserRouter>
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
