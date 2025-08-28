import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

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

export type BookingContextValue = {
  service?: ServiceFromList;
  barber?: BarberFromList;
  setService: (s?: ServiceFromList) => void;
  setBarber: (b?: BarberFromList) => void;
  reset: () => void;
};

const BookingContext = createContext<BookingContextValue | undefined>(undefined);

export function BookingProvider({ children }: PropsWithChildren) {
  const [service, setServiceState] = useState<ServiceFromList | undefined>(undefined);
  const [barber, setBarberState] = useState<BarberFromList | undefined>(undefined);

  const setService = useCallback((s?: ServiceFromList) => setServiceState(s), []);
  const setBarber = useCallback((b?: BarberFromList) => setBarberState(b), []);
  const reset = useCallback(() => {
    setServiceState(undefined);
    setBarberState(undefined);
  }, []);

  const value = useMemo<BookingContextValue>(
    () => ({ service, barber, setService, setBarber, reset }),
    [service, barber, setService, setBarber, reset],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBookingCtx(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) {
    throw new Error("useBookingCtx deve ser usado dentro de <BookingProvider>");
  }
  return ctx;
}
