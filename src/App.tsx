import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/Services";
import BarbersPage from "./pages/Barbers";
import BookingPage from "./pages/Booking";
import ClientAreaPage from "./pages/ClientArea";

import { BookingProvider } from "./context/BookingProvider";

export default function App() {
  return (
    <BrowserRouter>
      {/* Provider do estado global de agendamento */}
      <BookingProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/servicos" element={<ServicesPage />} />
          <Route path="/barbeiros" element={<BarbersPage />} />
          <Route path="/agendamento" element={<BookingPage />} />
          <Route path="/cliente" element={<ClientAreaPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BookingProvider>
    </BrowserRouter>
  );
}