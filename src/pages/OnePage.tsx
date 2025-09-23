import { useCallback, useState } from "react";
import dayjs, { Dayjs } from "dayjs";

import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import CalendarSection from "../sections/CalendarSection";
import ServicesSection from "../sections/ServicesSection";
import BarbersSection from "../sections/BarbersSection";

export default function OnePage() {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [bookingOpen, setBookingOpen] = useState<boolean>(false);

  const handleSelectDate = useCallback((d: Dayjs | null) => { setSelectedDate(d); }, []);
  const handleAgendar = useCallback(() => { setBookingOpen(true); }, []);
  const handleCloseBooking = useCallback(() => { setBookingOpen(false); }, []);

  return (
    <>
      <Header />
      <main id="inicio">
        <CalendarSection
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          onAgendar={handleAgendar}
          onCloseBooking={handleCloseBooking}
          isBookingOpen={bookingOpen}
          selectedDateIso={selectedDate?.format("YYYY-MM-DD") ?? dayjs().format("YYYY-MM-DD")}
        />

        <ServicesSection />
        <BarbersSection />
      </main>
      <Footer />
    </>
  );
}