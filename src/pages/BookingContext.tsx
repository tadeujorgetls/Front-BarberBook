import React, { createContext, useContext, useMemo, useState } from "react";

export type ServiceFromList = {
  id: string;
  name: string;
  price: string;
  duration: string;
};

export type BarberFromList = {
  id: string;
  name: string;
  photo: string;
};

type BookingContextState = {
  service?: ServiceFromList;
  barber?: BarberFromList;
  setService: (s?: ServiceFromList) => void;
  setBarber: (b?: BarberFromList) => void;
  reset: () => void;
};

const BookingContext = createContext<BookingContextState | null>(null);

export const BookingProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [service, setServiceState] = useState<ServiceFromList | undefined>(undefined);
  const [barber, setBarberState] = useState<BarberFromList | undefined>(undefined);

  const value = useMemo<BookingContextState>(() => ({
    service,
    barber,
    setService: (s) => setServiceState(s),
    setBarber: (b) => setBarberState(b),
    reset: () => { setServiceState(undefined); setBarberState(undefined); }
  }), [service, barber]);

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

export function useBookingCtx() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBookingCtx deve ser usado dentro de <BookingProvider>");
  return ctx;
}