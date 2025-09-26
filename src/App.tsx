import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import OnePage from "./pages/OnePage";
import ClientAreaPage from "./pages/ClientArea";
import LoginPage from "./pages/LoginPage";
import { BookingProvider } from "./context/BookingProvider";
import type { JSX } from "react";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("bb_token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <BookingProvider>
        <Routes>
          <Route path="/" element={<OnePage />} />

          <Route
            path="/cliente"
            element={
              <ProtectedRoute>
                <ClientAreaPage />
              </ProtectedRoute>
            }
          />

          <Route path="/login" element={<LoginPage />} />

          <Route path="/servicos" element={<Navigate to="/#servicos" replace />} />
          <Route path="/barbeiros" element={<Navigate to="/#profissionais" replace />} />
          <Route path="/agendamento" element={<Navigate to="/#agendamento" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BookingProvider>
    </BrowserRouter>
  );
}