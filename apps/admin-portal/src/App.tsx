import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { PortalLayout } from "./routes/PortalLayout";
import { CommandCenterPage } from "./routes/CommandCenterPage";
import { EngineCenterPage } from "./features/engine-center/EngineCenterPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/command-center" replace />} />
        <Route path="/admin" element={<PortalLayout />}>
          <Route index element={<Navigate to="/admin/command-center" replace />} />
          <Route path="command-center" element={<CommandCenterPage />} />
          <Route path="engine-center" element={<EngineCenterPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
