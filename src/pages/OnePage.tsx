import { useCallback, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { Collapse } from "@mui/material";

import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import CalendarSection from "../sections/CalendarSection";
import ServicesSection from "../sections/ServicesSection";
import BarbersSection from "../sections/BarbersSection";
import BookingSection from "../sections/BookingSection";

export default function OnePage() {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [showBooking, setShowBooking] = useState<boolean>(false);

  const handleSelectDate = useCallback((d: Dayjs | null) => { setSelectedDate(d); }, []);
  const handleAgendar = useCallback(() => {
    setShowBooking(true);
    requestAnimationFrame(() => {
      document.querySelector("#agendamento")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  return (
    <>
      <Header />
      <main>
        <CalendarSection selectedDate={selectedDate} onSelectDate={handleSelectDate} onAgendar={handleAgendar} />
        <ServicesSection />
        <BarbersSection />
        <Collapse in={showBooking} timeout={250} unmountOnExit>
          <BookingSection selectedDateIso={selectedDate?.format("YYYY-MM-DD") ?? dayjs().format("YYYY-MM-DD")} />
        </Collapse>
      </main>
      <Footer />
    </>
  );
}