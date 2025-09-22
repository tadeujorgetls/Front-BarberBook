import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import OnePage from "./pages/OnePage";
import ClientAreaPage from "./pages/ClientArea";
import { BookingProvider } from "./context/BookingProvider";

export default function App() {
  return (
    <BrowserRouter>
      <BookingProvider>
        <Routes>
          <Route path="/" element={<OnePage />} />
          <Route path="/cliente" element={<ClientAreaPage />} />
          <Route path="/servicos" element={<Navigate to="/#servicos" replace />} />
          <Route path="/barbeiros" element={<Navigate to="/#profissionais" replace />} />
          <Route path="/agendamento" element={<Navigate to="/#agendamento" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BookingProvider>
    </BrowserRouter>
  );
}