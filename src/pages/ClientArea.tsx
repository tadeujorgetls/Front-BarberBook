import { useCallback, useEffect, useMemo, useState, type JSX } from "react";
import {
  Avatar, Box, Button, Card, CardActions, CardContent, Container, Divider,
  List, ListItem, ListItemAvatar, ListItemText, Stack, Tooltip, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ContentCutRoundedIcon from "@mui/icons-material/ContentCutRounded";
import Face6RoundedIcon from "@mui/icons-material/Face6Rounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useNavigate } from "react-router-dom";

import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { useBookingCtx } from "../context/BookingProvider";

type CustomerPublic = { id: string; nome: string; };
type CustomerDetails = CustomerPublic & { email: string; telefone: string; cpf: string; };

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
const CLIENTE_ID = "00000000-0000-0000-0000-000000000002";

type QuickService = { id: string; name: string; price: string; duration: string };
type QuickBarber = { id: string; name: string; photo: string };

const BARBERS: Record<string, QuickBarber> = {
  carlos: { id: "10", name: "Carlos Silva", photo: "" },
  joao: { id: "11", name: "João Pereira", photo: "" },
  rafael:{ id: "12", name: "Rafael Souza", photo: "" },
};

const MOCK_RECENT_SERVICES: Array<{
  id: string; title: string; date: string; icon: JSX.Element;
  service: QuickService; barber: QuickBarber;
}> = [
  { id: "s1", title: "Corte de Cabelo", date: "10/08/2025", icon: <ContentCutRoundedIcon />,
    service: { id: "corte", name: "Corte", price: "R$ 30,00", duration: "30min" }, barber: BARBERS.carlos },
  { id: "s2", title: "Barba", date: "15/07/2025", icon: <Face6RoundedIcon />,
    service: { id: "barba", name: "Barba", price: "R$ 30,00", duration: "30min" }, barber: BARBERS.joao },
  { id: "s3", title: "Corte + Barba", date: "20/06/2025", icon: <BoltRoundedIcon />,
    service: { id: "corte-barba", name: "Corte + Barba", price: "R$ 60,00", duration: "1h30min" }, barber: BARBERS.rafael },
];

function Monogram({ name }: { name: string }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0,2).join("").toUpperCase();
  return (
    <Avatar
      variant="rounded"
      sx={{
        bgcolor: "transparent",
        color: "var(--gold)",
        border: "1px solid var(--gold)",
        fontWeight: 800,
        fontSize: 16,
      }}
    >
      {initials}
    </Avatar>
  );
}

export default function ClientAreaPage() {
  const navigate = useNavigate();
  const { setService, setBarber } = useBookingCtx();

  const [customer, setCustomer] = useState<CustomerPublic | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [form, setForm] = useState<CustomerDetails | null>(null);
  const [openEdit, setOpenEdit] = useState(false);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoadError(null);
        const res = await fetch(`${API_BASE}/clientes/${CLIENTE_ID}`, { signal: ac.signal, mode: "cors" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as CustomerPublic;
        setCustomer(data);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setLoadError("Falha ao carregar dados do cliente.");
      }
    })();
    return () => ac.abort();
  }, []);

  const handleQuickBook = useCallback((service: QuickService, barber: QuickBarber) => {
    setService(service);
    setBarber(barber);
    navigate(`/#agendamento`);
    setTimeout(() => document.querySelector("#agendamento")?.scrollIntoView({ behavior: "smooth" }), 50);
  }, [navigate, setBarber, setService]);

  const openEditDialog = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/clientes/${CLIENTE_ID}?view=details`, { mode: "cors" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const details = (await res.json()) as CustomerDetails;
      setForm(details);
      setOpenEdit(true);
    } catch (e) {}
  }, []);

  const saveEdit = useCallback(async () => {
    if (!form) return;
    try {
      const res = await fetch(`${API_BASE}/clientes/${CLIENTE_ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: form.nome, email: form.email, telefone: form.telefone }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = (await res.json()) as CustomerPublic;
      setCustomer(updated);
      setOpenEdit(false);
      setForm((prev) => (prev ? { ...prev, nome: updated.nome } : prev));
    } catch (e) {}
  }, [form]);

  const recentItems = useMemo(() => MOCK_RECENT_SERVICES, []);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <Container component="main" sx={{ py: { xs: 3, md: 5 }, flexGrow: 1 }}>
        <Stack spacing={3}>
          <Box sx={{ textAlign: { xs: "left", md: "center" } }}>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.01em" }}>
              Área do Cliente
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8, mt: 0.5 }}>
              Gerencie seus dados e refaça agendamentos em um clique.
            </Typography>
          </Box>

          {loadError && (
            <Alert severity="error" sx={{ maxWidth: 640, mx: "auto" }}>
              {loadError}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 5, lg: 4 }}>
              <Card
                elevation={0}
                className="paper-card card-raise"
                sx={{ borderColor: "var(--gold)", height: "100%" }}
              >
                <CardContent>
                  {customer ? (
                    <>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ width: 56, height: 56, bgcolor: "var(--primary)", color: "#fff", fontWeight: 800 }}>
                          {customer.nome.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ opacity: 0.7, color: "var(--steel)" }}>
                            Cliente
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            {customer.nome}
                          </Typography>

                          {form ? (
                            <>
                              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                {form.email}
                              </Typography>
                              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                {form.telefone}
                              </Typography>
                            </>
                          ) : (
                            <>
                              <Typography variant="body2" sx={{ opacity: 0.5 }}>
                                Email não carregado
                              </Typography>
                              <Typography variant="body2" sx={{ opacity: 0.5 }}>
                                Telefone não carregado
                              </Typography>
                            </>
                          )}
                        </Box>
                      </Stack>

                      <Divider sx={{ my: 2, borderColor: "rgba(198,161,91,0.4)" }} />

                      <Tooltip title="Editar dados do cliente">
                        <span>
                          <Button
                            variant="contained"
                            fullWidth
                            startIcon={<EditRoundedIcon />}
                            sx={{
                              bgcolor: "var(--primary)",
                              "&:hover": { bgcolor: "#0a360d" },
                              fontWeight: 700,
                            }}
                            onClick={openEditDialog}
                          >
                            Editar Dados
                          </Button>
                        </span>
                      </Tooltip>
                    </>
                  ) : (
                    <Typography>Carregando dados...</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 7, lg: 8 }}>
              <Card elevation={0} className="paper-card card-raise">
                <CardContent sx={{ pb: 0 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Serviços Recentes
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                    Refaça seu serviço preferido em segundos.
                  </Typography>

                  <List disablePadding dense sx={{ mt: 1 }}>
                    {recentItems.map((item) => (
                      <ListItem
                        key={item.id}
                        secondaryAction={
                          <Button
                            size="small"
                            variant="outlined"
                            endIcon={<ArrowForwardRoundedIcon />}
                            onClick={() => handleQuickBook(item.service, item.barber)}
                            sx={{
                              fontWeight: 700,
                              color: "var(--gold)",
                              borderColor: "var(--gold)",
                              "&:hover": { background: "rgba(198,161,91,0.12)", borderColor: "var(--gold)" },
                            }}
                          >
                            Agendar Rapidamente
                          </Button>
                        }
                        sx={{
                          border: "1px solid rgba(198,161,91,0.25)",
                          borderRadius: 2,
                          mb: 1.2,
                          px: 1.5,
                          py: 1,
                          "&:hover": { borderColor: "var(--gold)", background: "rgba(198,161,91,0.06)" },
                        }}
                      >
                        <ListItemAvatar>
                          <Monogram name={item.barber.name} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={<Typography sx={{ fontWeight: 700 }}>{item.title} — {item.barber.name}</Typography>}
                          secondary={<Typography variant="body2" sx={{ opacity: 0.8 }}>{item.date}</Typography>}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>

                <CardActions sx={{ px: 2, pb: 2, pt: 1 }}>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    Dica: clique em “Agendar Rapidamente” para pular etapas (vamos direto ao horário e pagamento).
                  </Typography>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Stack>
      </Container>

      <Footer />

      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>Editar Dados</DialogTitle>
        <DialogContent dividers>
          {form ? (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Nome" value={form.nome} onChange={(e) => setForm((f) => (f ? { ...f, nome: e.target.value } : f))} fullWidth />
              <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm((f) => (f ? { ...f, email: e.target.value } : f))} fullWidth />
              <TextField label="Telefone" value={form.telefone} onChange={(e) => setForm((f) => (f ? { ...f, telefone: e.target.value } : f))} fullWidth />
            </Stack>
          ) : (
            <Typography>Carregando detalhes…</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancelar</Button>
          <Button variant="contained" onClick={saveEdit} disabled={!form} sx={{ bgcolor: "var(--primary)", "&:hover": { bgcolor: "#0a360d" } }}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}