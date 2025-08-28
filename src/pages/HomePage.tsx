import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Link as MLink,
  Typography,
} from "@mui/material";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/pt-br";

import { Link as RouterLink, useNavigate } from "react-router-dom";

// Layout
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const navigate = useNavigate();

  // Garante 2025+ e bloqueia datas passadas
  const today = dayjs();
  const minDate = useMemo(() => {
    const isBefore2025 = today.year() < 2025;
    return isBefore2025 ? dayjs("2025-01-01") : today.startOf("day");
  }, [today]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      {/* Wrapper flex para empurrar o footer para o fim da página */}
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* HEADER extraído */}
        <Header />

        {/* CONTEÚDO */}
        <Container component="main" sx={{ py: { xs: 4, md: 6 }, flexGrow: 1 }}>
          {/* Título central */}
          <Box sx={{ textAlign: "center", mb: { xs: 3, md: 4 } }}>
            <Typography component="h1" variant="h3" sx={{ fontWeight: 800 }}>
              Agendar Serviço
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, opacity: 0.8 }}>
              Escolha uma data para ver horários disponíveis.
            </Typography>
          </Box>

          {/* Calendário centralizado */}
          <Box sx={{ display: "grid", placeItems: "center", px: { xs: 0, sm: 2 } }}>
            <Card
              sx={{
                width: "100%",
                maxWidth: 560,
                boxShadow: "0 10px 30px #0C4010",
                border: "1px solid #e5e7eb",
              }}
              aria-label="Seletor de data para agendamento"
            >
              <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <DateCalendar
                    views={["day"]}
                    disablePast
                    minDate={minDate}
                    value={selectedDate}
                    onChange={(newValue) => setSelectedDate(newValue)}
                    sx={{
                      "& .MuiPickersDay-root": { fontWeight: 600 },
                      "& .MuiDayCalendar-header": { fontWeight: 700 },
                    }}
                  />
                </Box>

                {/* CTA ao escolher a data */}
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    gap: 1,
                    flexWrap: "wrap",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<CalendarMonthRoundedIcon />}
                    disabled={!selectedDate}
                    onClick={() => {
                      const iso = selectedDate?.format("YYYY-MM-DD");
                      if (iso) {
                        navigate(`/agendamento?data=${iso}`);
                      }
                    }}
                  >
                    Continuar
                  </Button>
                  {selectedDate && (
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                      Selecionado: <strong>{selectedDate.format("DD/MM/YYYY")}</strong>
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Links auxiliares */}
          <Box sx={{ mt: { xs: 3, md: 4 }, textAlign: "center" }}>
            <MLink component={RouterLink} to="/servicos" underline="hover" sx={{ mx: 1 }}>
              Serviços
            </MLink>
            <MLink component={RouterLink} to="/barbeiros" underline="hover" sx={{ mx: 1 }}>
              Nossos barbeiros
            </MLink>
          </Box>
        </Container>

        {/* FOOTER extraído */}
        <Footer />
      </Box>
    </LocalizationProvider>
  );
}