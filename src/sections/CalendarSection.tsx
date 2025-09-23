import { Box, Button, Card, CardContent, Chip, Container, Typography, Stack } from "@mui/material";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import WatchLaterRoundedIcon from "@mui/icons-material/WatchLaterRounded";
import LocalCafeRoundedIcon from "@mui/icons-material/LocalCafeRounded";
import ContentCutRoundedIcon from "@mui/icons-material/ContentCutRounded";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/pt-br";
import Grid from "@mui/material/Grid";
import BookingSection from "../sections/BookingSection";

type Props = {
  selectedDate: Dayjs | null;
  onSelectDate: (d: Dayjs | null) => void;
  onAgendar: () => void;

  isBookingOpen?: boolean;
  selectedDateIso?: string;
  onCloseBooking?: () => void;
};

export default function CalendarSection({
  selectedDate,
  onSelectDate,
  onAgendar,
  isBookingOpen = false,
  selectedDateIso,
  onCloseBooking,
}: Props) {
  const today = dayjs();
  const minDate = today.year() < 2025 ? dayjs("2025-01-01") : today.startOf("day");

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <Box
        id="calendario"
        className="bg-darkbar"
        sx={{ py: { xs: 4, md: 5 }, borderBottom: "1px solid rgba(198,161,91,0.35)" }}
      >
        <Container>
          {!isBookingOpen ? (
            <Grid container spacing={{ xs: 3, md: 4 }} alignItems="stretch">
              {/* Texto / benefícios */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ pr: { md: 3 } }}>
                  <Typography component="h1" variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
                    Clube de Cavalheiros.
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1, opacity: 0.95 }}>
                    Tradição em corte e barba com atendimento pontual — escolha a data e reserve seu horário.
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap", rowGap: 1 }}>
                    <Chip icon={<ContentCutRoundedIcon sx={{ color: "var(--gold)" }} />} label="Navalha aquecida" variant="outlined" sx={{ color: "var(--gold)", borderColor: "var(--gold)" }} />
                    <Chip icon={<LocalCafeRoundedIcon sx={{ color: "var(--gold)" }} />} label="Espresso cortesia" variant="outlined" sx={{ color: "var(--gold)", borderColor: "var(--gold)" }} />
                    <Chip icon={<WatchLaterRoundedIcon sx={{ color: "var(--gold)" }} />} label="Pontualidade" variant="outlined" sx={{ color: "var(--gold)", borderColor: "var(--gold)" }} />
                  </Stack>

                  <Stack spacing={1.2} sx={{ mt: 2.5 }}>
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <PlaceRoundedIcon fontSize="small" />
                      <Typography variant="body2" sx={{ opacity: 0.95 }}>Rua dos Cavalheiros, 123 — Centro</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <WatchLaterRoundedIcon fontSize="small" />
                      <Typography variant="body2" sx={{ opacity: 0.95 }}>Seg–Sáb • 09h–20h</Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Grid>

              {/* Calendário (sem classe card-raise) */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card className="paper-card" sx={{ height: "100%" }} aria-label="Seletor de data para agendamento">
                  <CardContent sx={{ p: { xs: 1.25, sm: 1.75 } }}>
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      <DateCalendar
                        views={["day"]}
                        disablePast
                        minDate={minDate}
                        value={selectedDate}
                        onChange={onSelectDate}
                        sx={{
                          "& .MuiPickersDay-root": { fontWeight: 600 },
                          "& .MuiDayCalendar-header": { fontWeight: 700 },
                        }}
                      />
                    </Box>

                    <Box sx={{ mt: 1.5, display: "flex", gap: 1, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<CalendarMonthRoundedIcon />}
                        disabled={!selectedDate}
                        onClick={onAgendar}
                        sx={{
                          bgcolor: "var(--primary)",
                          border: "1px solid var(--gold)",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                          fontWeight: 800,
                          "&:hover": { bgcolor: "#0a360d" },
                        }}
                      >
                        AGENDAR
                      </Button>
                      {selectedDate && (
                        <Typography variant="body2" sx={{ color: "var(--text)" }}>
                          Selecionado: <strong>{selectedDate.format("DD/MM/YYYY")}</strong>
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            // Herói inteiro vira agendamento
            <Card className="paper-card" aria-label="Fluxo de agendamento">
              <CardContent sx={{ p: { xs: 1.25, sm: 1.75 } }}>
                <BookingSection
                  selectedDateIso={selectedDateIso ?? dayjs().format("YYYY-MM-DD")}
                  embedded
                  onClose={onCloseBooking}
                />
              </CardContent>
            </Card>
          )}
        </Container>
      </Box>
    </LocalizationProvider>
  );
}