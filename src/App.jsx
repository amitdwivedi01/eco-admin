import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Visitors from "./pages/Visitor";
import ConferenceRegistrations from "./pages/ConferenceRegistrations";

function NotFound() {
  return <h1 className="text-xl font-semibold">Page not found</h1>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route
              index
              element={<Navigate to="/conference-registrations" replace />}
            />
            <Route path="/visitors" element={<Visitors />} />
            <Route
              path="/conference-registrations"
              element={<ConferenceRegistrations />}
            />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
