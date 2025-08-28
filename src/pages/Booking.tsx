import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Snackbar,
  Alert,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import ContentCutRoundedIcon from "@mui/icons-material/ContentCutRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";

import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

import { useBookingCtx } from "../context/BookingProvider";

/* Constantes */
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
const steps = ["Serviço", "Barbeiro", "Horário"] as const;

/* Tipagens API */
type Service = {
  id: string;
  nome: string;
  duracao: number;
  preco: number;
};

type Barber = {
  id: string;
  nome: string;
  fotoUrl?: string;
};

type AvailabilityResponse = { horarios?: string[] };

type BookingPayload = {
  userId: string | null;
  servicoId: string;
  barbeiroId: string;
  dataHorarioIso: string;
  formaPagamento: "LOJA" | "ONLINE" | "CARTAO" | "DINHEIRO";
};

/* Avatar ilustrativo (não-humano) por seed (id do barbeiro) */
const getIllustrationUrl = (seed: string) =>
  `https://api.dicebear.com/9.x/bottts-neutral/png?seed=${encodeURIComponent(
    seed
  )}&size=480&backgroundType=gradientLinear&radius=50`;

/* Helpers HTTP */
async function apiGet<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal, mode: "cors" });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return (await res.json()) as T;
}

async function apiPost<T>(url: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`POST ${url} -> ${res.status} ${text}`);
  }
  return (await res.json()) as T;
}

/* Página */
export default function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { service: svcCtx, barber: brbCtx } = useBookingCtx();

  // Data selecionada
  const selectedDateIso = searchParams.get("data") || dayjs().format("YYYY-MM-DD");
  const selectedDateLabel = dayjs(selectedDateIso).locale("pt-br").format("DD/MM/YYYY");
  const forceStepParam = searchParams.get("step");

  const [activeStep, setActiveStep] = useState<number>(0);

  // Estado — Serviço
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Estado — Barbeiro
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loadingBarbers, setLoadingBarbers] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);

  // Estado — Horários
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Estado — Pagamento & Snackbar
  const [payment, setPayment] = useState<BookingPayload["formaPagamento"]>("LOJA");
  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: "success" | "error" }>({
    open: false,
    msg: "",
    sev: "success",
  });

  /* Prefill a partir do Context */
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

    const s = svcCtx
      ? ({
          id: svcCtx.id,
          nome: svcCtx.name,
          duracao: parseDurationMinutes(svcCtx.duration),
          preco: parsePrice(svcCtx.price),
        } as Service)
      : null;

    // Normaliza para ilustração mesmo que o contexto tenha outra URL
    const b = brbCtx
      ? ({
          id: brbCtx.id,
          nome: brbCtx.name,
          fotoUrl: getIllustrationUrl(brbCtx.id),
        } as Barber)
      : null;

    return { s, b };
  }, [svcCtx, brbCtx]);

  /* Carregar Serviços */
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoadingServices(true);
        const data = await apiGet<Service[]>(`${API_BASE}/servicos`, ac.signal);
        setServices(data);
      } catch {
        setSnack({ open: true, msg: "Falha ao carregar serviços.", sev: "error" });
      } finally {
        setLoadingServices(false);
      }
    })();
    return () => ac.abort();
  }, []);

  /* Carregar Barbeiros */
  const loadBarbers = useCallback(async () => {
    const ac = new AbortController();
    try {
      setLoadingBarbers(true);
      const resp = await apiGet<Barber[]>(`${API_BASE}/barbeiros`, ac.signal);
      // Força uso de ilustração para todos
      const mapped = resp.map((b) => ({
        ...b,
        fotoUrl: getIllustrationUrl(b.id),
      }));
      setBarbers(mapped);
    } catch {
      setSnack({ open: true, msg: "Falha ao carregar barbeiros.", sev: "error" });
    } finally {
      setLoadingBarbers(false);
    }
    return () => ac.abort();
  }, []);

  useEffect(() => {
    void loadBarbers();
  }, [loadBarbers]);

  /* Carregar Horários */
  const loadSlots = useCallback(
    async (barbeiroId: string) => {
      const ac = new AbortController();
      try {
        setLoadingSlots(true);
        const resp = await apiGet<AvailabilityResponse>(
          `${API_BASE}/disponibilidade?barbeiroId=${barbeiroId}&data=${selectedDateIso}`,
          ac.signal,
        );
        setAvailableSlots(resp.horarios ?? []);
      } catch {
        setSnack({ open: true, msg: "Falha ao carregar horários.", sev: "error" });
      } finally {
        setLoadingSlots(false);
      }
      return () => ac.abort();
    },
    [selectedDateIso],
  );

  /* Seleções */
  const handleSelectService = useCallback((svc: Service) => {
    setSelectedService(svc);
    setActiveStep(1);
  }, []);

  const handleSelectBarber = useCallback(
    (b: Barber) => {
      // Garante consistência do avatar ilustrativo mesmo se vier diferente
      const normalized = { ...b, fotoUrl: getIllustrationUrl(b.id) };
      setSelectedBarber(normalized);
      setSelectedSlot(null);
      setAvailableSlots([]);
      setActiveStep(2);
      void loadSlots(normalized.id);
    },
    [loadSlots],
  );

  /* Prefill efetivo do Context */
  useEffect(() => {
    if (services.length && prefillFromCtx.s) {
      const match = services.find((x) => x.nome === prefillFromCtx.s!.nome) ?? prefillFromCtx.s!;
      setSelectedService(match);
    }
  }, [services, prefillFromCtx.s]);

  useEffect(() => {
    if (barbers.length && prefillFromCtx.b) {
      // Força o uso da ilustração também no prefill
      setSelectedBarber({
        ...prefillFromCtx.b,
        fotoUrl: getIllustrationUrl(prefillFromCtx.b.id),
      });
    }
  }, [barbers, prefillFromCtx.b]);

  /*  Controle de Passos  */
  useEffect(() => {
    if (forceStepParam === "2" && selectedBarber) {
      setActiveStep(2);
      void loadSlots(selectedBarber.id);
    } else if (selectedService && selectedBarber) {
      setActiveStep(2);
      void loadSlots(selectedBarber.id);
    } else if (selectedService) {
      setActiveStep(1);
    } else {
      setActiveStep(0);
    }
  }, [selectedService, selectedBarber, loadSlots, forceStepParam]);

  const canConfirm = Boolean(selectedService && selectedBarber && selectedSlot);

  /* Confirmar */
  const handleConfirm = useCallback(async () => {
    if (!canConfirm || !selectedService || !selectedBarber || !selectedSlot) return;

    const payload: BookingPayload = {
      userId: null,
      servicoId: selectedService.id,
      barbeiroId: selectedBarber.id,
      dataHorarioIso: `${selectedDateIso}T${selectedSlot}:00`,
      formaPagamento: payment,
    };

    const ac = new AbortController();
    try {
      await apiPost(`${API_BASE}/agendamentos`, payload, ac.signal);
      setSnack({ open: true, msg: "Agendamento confirmado! Enviamos um email pra você.", sev: "success" });
      navigate(`/`, { replace: true });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setSnack({
        open: true,
        msg: msg.includes("409")
          ? "Esse horário acabou de ficar indisponível. Tente outro."
          : "Erro ao confirmar agendamento.",
        sev: "error",
      });
    }
  }, [canConfirm, navigate, payment, selectedBarber, selectedDateIso, selectedService, selectedSlot]);

  /* Render */
  return (
    <Box id="agendamento" sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <Container component="main" sx={{ py: { xs: 4, md: 6 }, flexGrow: 1 }}>
        <Box sx={{ textAlign: "center", mb: { xs: 3, md: 4 } }}>
          <Typography component="h1" variant="h3" sx={{ fontWeight: 800 }}>
            Agende Seu Serviço
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ textAlign: "center", mt: -2, mb: 3, opacity: 0.9 }}>
          Para o dia <strong>{selectedDateLabel}</strong>
        </Typography>

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: { xs: 3, md: 4 } }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* PASSO 1: SERVIÇO */}
        {activeStep === 0 && (
          <Box>
            {loadingServices ? (
              <Box sx={{ display: "grid", placeItems: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={{ xs: 2, sm: 3 }} aria-label="Lista de serviços">
                {services.map((svc) => (
                  <Grid key={svc.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <Card
                      elevation={0}
                      sx={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 3,
                        transition: "all 180ms ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                          borderColor: "#cbd5e1",
                        },
                        "&:focus-within": { outline: "2px solid #0ea5e9", outlineOffset: "2px" },
                      }}
                    >
                      <CardActionArea onClick={() => handleSelectService(svc)}>
                        <CardContent sx={{ p: 2.5 }}>
                          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                            <ContentCutRoundedIcon aria-hidden sx={{ mr: 1, opacity: 0.7 }} />
                            <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
                              {svc.nome}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                            <Typography variant="body1" sx={{ fontWeight: 700 }}>
                              R$ {svc.preco.toFixed(2)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              • {svc.duracao} min
                            </Typography>
                          </Box>
                          {selectedService?.id === svc.id && (
                            <Chip sx={{ mt: 1 }} color="primary" label="Selecionado" size="small" />
                          )}
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* PASSO 2: BARBEIRO */}
        {activeStep === 1 && (
          <Box>
            <Button
              variant="text"
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => setActiveStep(0)}
              sx={{ mb: 2 }}
            >
              Voltar
            </Button>
            {loadingBarbers ? (
              <Box sx={{ display: "grid", placeItems: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={{ xs: 2, sm: 3 }} aria-label="Lista de barbeiros">
                {barbers.map((b) => (
                  <Grid key={b.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <Card
                      elevation={0}
                      sx={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 3,
                        overflow: "hidden",
                        transition: "all 180ms ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                          borderColor: "#cbd5e1",
                        },
                        "&:focus-within": { outline: "2px solid #0ea5e9", outlineOffset: "2px" },
                      }}
                    >
                      <CardActionArea onClick={() => handleSelectBarber(b)}>
                        <CardMedia
                          component="img"
                          height="220"
                          image={getIllustrationUrl(b.id)}
                          alt={`Imagem ilustrativa de ${b.nome}`}
                          loading="lazy"
                          sx={{ objectFit: "cover" }}
                        />
                        <CardContent sx={{ textAlign: "center" }}>
                          <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
                            {b.nome}
                          </Typography>
                          <Box sx={{ mt: 0.5, display: "flex", justifyContent: "center" }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <StarRoundedIcon key={i} fontSize="small" />
                            ))}
                          </Box>
                          {selectedBarber?.id === b.id && (
                            <Chip sx={{ mt: 1 }} color="primary" label="Selecionado" size="small" />
                          )}
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* PASSO 3: HORÁRIO + RESUMO */}
        {activeStep === 2 && (
          <Box>
            <Button
              variant="text"
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => setActiveStep(1)}
              sx={{ mb: 2 }}
            >
              Voltar
            </Button>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
              Selecione um horário
            </Typography>

            {loadingSlots ? (
              <Box sx={{ display: "grid", placeItems: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 3 }}>
                {availableSlots.length === 0 ? (
                  <Typography sx={{ px: 2, py: 1 }}>Escolha um barbeiro para ver os horários.</Typography>
                ) : (
                  availableSlots.map((slot) => {
                    const selected = selectedSlot === slot;
                    return (
                      <Grid key={slot} size={{ xs: 6, sm: 4, md: 2 }}>
                        <Button
                          fullWidth
                          variant={selected ? "contained" : "outlined"}
                          onClick={() => setSelectedSlot(slot)}
                          sx={{ fontWeight: 700 }}
                        >
                          {slot}
                        </Button>
                      </Grid>
                    );
                  })
                )}
              </Grid>
            )}

            <Card sx={{ border: "1px solid #e5e7eb" }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                  Resumo do Agendamento
                </Typography>

                <Typography variant="body1">
                  <strong>Serviço:</strong> {selectedService?.nome ?? "—"}{" "}
                  {selectedService && (
                    <>
                      • <strong>Duração:</strong> {selectedService.duracao}min •{" "}
                      <strong>Preço:</strong> R$ {selectedService.preco.toFixed(2)}
                    </>
                  )}
                </Typography>

                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  <strong>Barbeiro:</strong> {selectedBarber?.nome ?? "—"}
                </Typography>

                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  <strong>Data:</strong> {selectedDateLabel} • <strong>Horário:</strong>{" "}
                  {selectedSlot ?? "—"}
                </Typography>

                <FormControl sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 0.5, fontWeight: 700 }}>
                    Forma de pagamento
                  </Typography>
                  <RadioGroup
                    row
                    value={payment}
                    onChange={(e) => setPayment(e.target.value as BookingPayload["formaPagamento"])}
                  >
                    <FormControlLabel value="LOJA" control={<Radio />} label="Na loja" />
                    <FormControlLabel value="ONLINE" control={<Radio />} label="Online" />
                  </RadioGroup>
                </FormControl>
              </CardContent>
            </Card>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button size="large" variant="contained" disabled={!canConfirm} onClick={handleConfirm}>
                Confirmar Agendamento
              </Button>
            </Box>
          </Box>
        )}
      </Container>

      <Footer />

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.sev}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}