import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Container, FormControl,
  FormControlLabel, Radio, RadioGroup, Snackbar, Step, StepLabel, Stepper, Typography, Avatar
} from "@mui/material";
import Grid from "@mui/material/Grid";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ContentCutRoundedIcon from "@mui/icons-material/ContentCutRounded";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { useBookingCtx } from "../context/BookingProvider";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
const steps = ["Serviço", "Barbeiro", "Horário"] as const;

type Service = { id: string; nome: string; duracao: number; preco: number; };
type Barber = { id: string; nome: string; fotoUrl?: string | null };
type AvailabilityResponse = { horarios?: string[] };
type BookingPayload = {
  userId: string | null; servicoId: string; barbeiroId: string; dataHorarioIso: string;
  formaPagamento: "LOJA" | "ONLINE" | "CARTAO" | "DINHEIRO";
};

function Monogram({ name }: { name: string }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0,2).join("").toUpperCase();
  return (
    <Avatar
      variant="rounded"
      sx={{
        width: "100%",
        height: 220,
        bgcolor: "transparent",
        color: "var(--gold)",
        border: "1px solid var(--gold)",
        fontWeight: 900,
        fontSize: 42,
        letterSpacing: "0.06em",
      }}
    >
      {initials}
    </Avatar>
  );
}

async function apiGet<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal, mode: "cors" });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return (await res.json()) as T;
}
async function apiPost<T>(url: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, {
    method: "POST", mode: "cors", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal,
  });
  if (!res.ok) { const text = await res.text().catch(() => ""); throw new Error(`POST ${url} -> ${res.status} ${text}`); }
  return (await res.json()) as T;
}

export default function BookingSection({
  selectedDateIso,
  embedded = false,
  onClose,
}: {
  selectedDateIso: string;
  embedded?: boolean;
  onClose?: () => void; // NOVO: permite fechar (voltar para o calendário) na etapa 0
}) {
  const { service: svcCtx, barber: brbCtx } = useBookingCtx();

  const [activeStep, setActiveStep] = useState<number>(0);

  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loadingBarbers, setLoadingBarbers] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);

  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [payment, setPayment] = useState<BookingPayload["formaPagamento"]>("LOJA");
  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: "success" | "error" }>({ open: false, msg: "", sev: "success" });

  const selectedDateLabel = dayjs(selectedDateIso).locale("pt-br").format("DD/MM/YYYY");

  const prefillFromCtx = useMemo(() => {
    const parsePrice = (s?: string): number => {
      if (!s) return 0;
      const n = Number(String(s).replace(/[^\d,.-]/g, "").replace(".", "").replace(",", "."));
      return Number.isFinite(n) ? n : 0;
    };
    const parseDurationMinutes = (s?: string): number => {
      if (!s) return 0;
      const onlyNums = String(s).replace(/\D/g, "");
      return Number.isFinite(Number(onlyNums)) ? Number(onlyNums) : 0;
    };
    const s = svcCtx ? ({ id: svcCtx.id, nome: svcCtx.name, duracao: parseDurationMinutes(svcCtx.duration), preco: parsePrice(svcCtx.price) } as Service) : null;
    const b = brbCtx ? ({ id: brbCtx.id, nome: brbCtx.name, fotoUrl: brbCtx.photo || null } as Barber) : null;
    return { s, b };
  }, [svcCtx, brbCtx]);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try { setLoadingServices(true); setServices(await apiGet<Service[]>(`${API_BASE}/servicos`, ac.signal)); }
      catch { setSnack({ open: true, msg: "Falha ao carregar serviços.", sev: "error" }); }
      finally { setLoadingServices(false); }
    })();
    return () => ac.abort();
  }, []);
  const loadBarbers = useCallback(async () => {
    const ac = new AbortController();
    try {
      setLoadingBarbers(true);
      const resp = await apiGet<Barber[]>(`${API_BASE}/barbeiros`, ac.signal);
      setBarbers(resp.map(b => ({ ...b, fotoUrl: b.fotoUrl ?? null })));
    } catch { setSnack({ open: true, msg: "Falha ao carregar barbeiros.", sev: "error" }); }
    finally { setLoadingBarbers(false); }
    return () => ac.abort();
  }, []);
  useEffect(() => { void loadBarbers(); }, [loadBarbers]);

  useEffect(() => {
    if (services.length && prefillFromCtx.s) {
      const match = services.find((x) => x.nome === prefillFromCtx.s!.nome) ?? prefillFromCtx.s!;
      setSelectedService(match);
    }
  }, [services, prefillFromCtx.s]);
  useEffect(() => {
    if (barbers.length && prefillFromCtx.b) {
      setSelectedBarber(prefillFromCtx.b);
    }
  }, [barbers, prefillFromCtx.b]);

  useEffect(() => {
    if (selectedService && selectedBarber) {
      setActiveStep(2);
      void loadSlots(selectedBarber.id);
    } else if (selectedService) {
      setActiveStep(1);
    } else {
      setActiveStep(0);
    }
  }, [selectedService, selectedBarber]);

  const loadSlots = useCallback(async (barbeiroId: string) => {
    const ac = new AbortController();
    try {
      setLoadingSlots(true);
      const resp = await apiGet<AvailabilityResponse>(`${API_BASE}/disponibilidade?barbeiroId=${barbeiroId}&data=${selectedDateIso}`, ac.signal);
      setAvailableSlots(resp.horarios ?? []);
    } catch { setSnack({ open: true, msg: "Falha ao carregar horários.", sev: "error" }); }
    finally { setLoadingSlots(false); }
    return () => ac.abort();
  }, [selectedDateIso]);

  const handleSelectService = useCallback((svc: Service) => { setSelectedService(svc); setActiveStep(1); }, []);
  const handleSelectBarber = useCallback((b: Barber) => {
    setSelectedBarber(b); setSelectedSlot(null); setAvailableSlots([]); setActiveStep(2); void loadSlots(b.id);
  }, [loadSlots]);

  const canConfirm = Boolean(selectedService && selectedBarber && selectedSlot);

  const handleConfirm = useCallback(async () => {
    if (!canConfirm || !selectedService || !selectedBarber || !selectedSlot) return;
    const payload: BookingPayload = {
      userId: null, servicoId: selectedService.id, barbeiroId: selectedBarber.id,
      dataHorarioIso: `${selectedDateIso}T${selectedSlot}:00`, formaPagamento: payment,
    };
    const ac = new AbortController();
    try {
      await apiPost(`${API_BASE}/agendamentos`, payload, ac.signal);
      setSnack({ open: true, msg: "Agendamento confirmado! Enviamos um email pra você.", sev: "success" });
      if (!embedded) {
        setTimeout(() => document.querySelector("#calendario")?.scrollIntoView({ behavior: "smooth" }), 500);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setSnack({
        open: true,
        msg: msg.includes("409") ? "Esse horário acabou de ficar indisponível. Tente outro." : "Erro ao confirmar agendamento.",
        sev: "error",
      });
    }
  }, [canConfirm, payment, selectedBarber, selectedDateIso, selectedService, selectedSlot, embedded]);

  // ---------- RENDER ----------
  const Wrapper: React.ElementType = embedded ? Box : Box;
  const wrapperProps = embedded
    ? { id: undefined, className: undefined, sx: { py: 0 } }
    : { id: "agendamento", className: "bg-textured", sx: { py: { xs: 4, md: 5 } } };

  // Botão VOLTAR genérico por etapa
  const BackBtn = ({ onClick }: { onClick: () => void }) => (
    <Button
      startIcon={<ArrowBackRoundedIcon />}
      onClick={onClick}
      sx={{
        fontWeight: 800,
        color: "var(--primary)",
        border: "1px solid var(--primary)",
        px: 2.25,
      }}
      variant="outlined"
    >
      Voltar
    </Button>
  );

  return (
    <Wrapper {...wrapperProps}>
      <Container disableGutters={embedded} sx={embedded ? { p: 0 } : undefined}>
        {!embedded && (
          <Box sx={{ textAlign: "center", mb: { xs: 2.5, md: 3 }, color: "var(--text-ivory)" }}>
            <Typography component="h2" variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
              Agende Seu Serviço
            </Typography>
            <Typography variant="body2">
              Para o dia <strong>{dayjs(selectedDateIso).locale("pt-br").format("DD/MM/YYYY")}</strong>
            </Typography>
          </Box>
        )}

        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{
            mb: { xs: 2.5, md: 3 },
            "& .MuiStepConnector-line": { borderColor: "var(--gold)" },
            "& .MuiStepIcon-root": { color: "rgba(198,161,91,0.3)" },
            "& .MuiStepIcon-root.Mui-active": { color: "var(--gold)" },
            "& .MuiStepIcon-root.Mui-completed": { color: "var(--gold)" },
          }}
        >
          {steps.map((label) => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>

        {/* ETAPA 0: SERVIÇO */}
        {activeStep === 0 && (
          <Box>
            {loadingServices ? (
              <Box sx={{ display: "grid", placeItems: "center", py: 4 }}><CircularProgress /></Box>
            ) : (
              <>
                <Grid container spacing={{ xs: 2, sm: 2.5 }} aria-label="Lista de serviços">
                  {services.map((svc) => (
                    <Grid key={svc.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                      <Card elevation={0} className="paper-card" sx={{ borderColor: "rgba(198,161,91,0.5)" }}>
                        <CardContent sx={{ p: 2.25 }}>
                          <Box sx={{ display: "flex", alignItems: "center", mb: 0.75 }}>
                            <ContentCutRoundedIcon aria-hidden sx={{ mr: 1, color: "var(--gold)" }} />
                            <Typography variant="h6" component="h3" sx={{ fontWeight: 800 }}>{svc.nome}</Typography>
                          </Box>
                          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                            <Typography variant="body1" sx={{ fontWeight: 800 }}>R$ {svc.preco.toFixed(2)}</Typography>
                            <Typography variant="body2" sx={{ color: "var(--steel)" }}>• {svc.duracao} min</Typography>
                          </Box>
                          <Box sx={{ mt: 1.5, display: "flex", justifyContent: "flex-end" }}>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => setSelectedService(svc)}
                              sx={{ bgcolor: "var(--primary)", "&:hover": { bgcolor: "#0a360d" }, fontWeight: 700 }}
                            >
                              Selecionar
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {/* Voltar fecha o Booking (retorna ao calendário) */}
                <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-start" }}>
                  <BackBtn onClick={() => onClose?.()} />
                </Box>
              </>
            )}
          </Box>
        )}

        {/* ETAPA 1: BARBEIRO */}
        {activeStep === 1 && (
          <Box>
            {loadingBarbers ? (
              <Box sx={{ display: "grid", placeItems: "center", py: 4 }}><CircularProgress /></Box>
            ) : (
              <>
                <Grid container spacing={{ xs: 2, sm: 2.5 }} aria-label="Lista de barbeiros">
                  {barbers.map((b) => (
                    <Grid key={b.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                      <Card elevation={0} className="paper-card" sx={{ borderColor: "rgba(198,161,91,0.5)" }}>
                        <CardContent sx={{ p: 2.25, textAlign: "center" }}>
                          {b.fotoUrl ? (
                            <img
                              src={b.fotoUrl}
                              alt={`Retrato de ${b.nome}`}
                              height={220}
                              style={{ width: "100%", objectFit: "cover", borderRadius: 12, border: "1px solid var(--gold)" }}
                              loading="lazy"
                            />
                          ) : (
                            <Monogram name={b.nome} />
                          )}
                          <Typography variant="h6" component="h2" sx={{ fontWeight: 800, mt: 1.1, color: "var(--text)" }}>
                            {b.nome}
                          </Typography>
                          <Box sx={{ mt: 1.5, display: "flex", justifyContent: "flex-end" }}>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleSelectBarber(b)}
                              sx={{ bgcolor: "var(--primary)", "&:hover": { bgcolor: "#0a360d" }, fontWeight: 700 }}
                            >
                              Selecionar
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-start" }}>
                  <BackBtn onClick={() => setActiveStep(0)} />
                </Box>
              </>
            )}
          </Box>
        )}

        {/* ETAPA 2: HORÁRIOS + PAGAMENTO */}
        {activeStep === 2 && (
          <Box>
            {loadingSlots ? (
              <Box sx={{ display: "grid", placeItems: "center", py: 4 }}><CircularProgress /></Box>
            ) : (
              <>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.25 }}>
                  Escolha um horário — {selectedDateLabel}
                </Typography>

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                  {availableSlots.length ? (
                    availableSlots.map((slot) => (
                      <Button
                        key={slot}
                        variant={selectedSlot === slot ? "contained" : "outlined"}
                        size="small"
                        onClick={() => setSelectedSlot(slot)}
                        sx={{
                          fontWeight: 700,
                          ...(selectedSlot === slot
                            ? { bgcolor: "var(--primary)", "&:hover": { bgcolor: "#0a360d" } }
                            : { color: "var(--gold)", borderColor: "var(--gold)", "&:hover": { background: "rgba(198,161,91,0.12)", borderColor: "var(--gold)" } }),
                        }}
                      >
                        {slot}
                      </Button>
                    ))
                  ) : (
                    <Alert severity="info">Sem horários disponíveis para esta data.</Alert>
                  )}
                </Box>

                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.75 }}>Pagamento</Typography>
                <FormControl>
                  <RadioGroup
                    row
                    value={payment}
                    onChange={(e) => setPayment(e.target.value as BookingPayload["formaPagamento"])}
                  >
                    <FormControlLabel value="LOJA" control={<Radio />} label="Na loja" />
                    <FormControlLabel value="CARTAO" control={<Radio />} label="Cartão" />
                    <FormControlLabel value="DINHEIRO" control={<Radio />} label="Dinheiro" />
                  </RadioGroup>
                </FormControl>

                <Box sx={{ mt: 2, display: "flex", gap: 1, justifyContent: "space-between" }}>
                  <BackBtn onClick={() => setActiveStep(1)} />
                  <Button
                    variant="contained"
                    onClick={handleConfirm}
                    disabled={!canConfirm}
                    sx={{ bgcolor: "var(--primary)", "&:hover": { bgcolor: "#0a360d" }, fontWeight: 800 }}
                  >
                    Confirmar Agendamento
                  </Button>
                </Box>
              </>
            )}
          </Box>
        )}

        <Snackbar
          open={snack.open}
          autoHideDuration={3500}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.sev} variant="filled" sx={{ width: "100%" }}>
            {snack.msg}
          </Alert>
        </Snackbar>
      </Container>
    </Wrapper>
  );
}