import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LandingPage } from "./routes/LandingPage";
import { RoleScreen } from "./routes/RoleScreen";
import { RegisterPage } from "./routes/RegisterPage";
import { FindServicePage } from "./routes/FindServicePage";

// GitHub Pages staging serves this app from a /<repo>/ or /<repo>/freelancer/
// subpath via VITE_BASE_PATH -- see vite.config.ts. This app's own routes
// don't use a "/freelancer/..." prefix, so no stripping is needed (same
// shape as merchant-portal's basename handling).
const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

function App() {
  return (
    <BrowserRouter basename={routerBasename}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/role/:role" element={<RoleScreen />} />
        <Route path="/role/:role/register" element={<RegisterPage />} />
        <Route path="/role/:role/find-service" element={<FindServicePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
