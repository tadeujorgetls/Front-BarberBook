import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import ContentCutRoundedIcon from "@mui/icons-material/ContentCutRounded";
import Grid from "@mui/material/Grid";
import { useNavigate } from "react-router-dom";

import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

import { useBookingCtx } from "../context/BookingProvider";

type BackendServico = {
  id: number | string;
  nome: string;
  duracao: number;
  preco: number;
};

type Service = {
  id: string;
  name: string;
  price: string;
  duration: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

function formatBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function formatDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m}min`;
  if (!m) return `${h}h00min`;
  return `${h}h${String(m).padStart(2, "0")}min`;
}

export default function ServicesPage() {
  const navigate = useNavigate();
  const { setService } = useBookingCtx();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/servicos`, {
          signal: ac.signal,
          mode: "cors",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: BackendServico[] = await res.json();

        const mapped: Service[] = data
          .map((s) => ({
            id: String(s.id),
            name: s.nome,
            price: formatBRL(Number(s.preco)),
            duration: formatDuration(Number(s.duracao)),
          }))
          .sort((a, z) => a.name.localeCompare(z.name, "pt-BR"));

        setServices(mapped);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        console.error(e);
        setError("Falha ao carregar serviços.");
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  const handleSelect = useCallback(
    (svc: Service) => {
      setSelectedId(svc.id);
      setService(svc);
    },
    [setService],
  );

  const handleProceed = useCallback(() => {
    if (!selectedId) return;
    navigate("/agendamento");
  }, [navigate, selectedId]);

  const gridOrError = useMemo(() => {
    if (loading) {
      return (
        <Box sx={{ display: "grid", placeItems: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      );
    }
    if (error) {
      return (
        <Box sx={{ maxWidth: 640, mx: "auto", mb: 3 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      );
    }
    return (
      <Grid container spacing={{ xs: 2, sm: 3 }} component="section" aria-label="Lista de serviços">
        {services.map((svc) => {
          const isSelected = selectedId === svc.id;
          return (
            <Grid key={svc.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card
                elevation={0}
                sx={{
                  border: isSelected ? "2px solid #0284c7" : "1px solid #e5e7eb",
                  borderRadius: 3,
                  transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                    borderColor: "#cbd5e1",
                  },
                  "&:focus-within": {
                    outline: "2px solid #0ea5e9",
                    outlineOffset: "2px",
                  },
                }}
              >
                <CardActionArea component="div" onClick={() => handleSelect(svc)}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <ContentCutRoundedIcon aria-hidden sx={{ mr: 1, opacity: 0.7 }} />
                      <Typography variant="h6" component="h2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        {svc.name}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Typography variant="body1" sx={{ fontWeight: 700 }} aria-label={`Preço: ${svc.price}`}>
                        {svc.price}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" aria-label={`Duração: ${svc.duration}`}>
                        • {svc.duration}
                      </Typography>
                    </Box>

                    <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
                      <Button
                        variant={isSelected ? "contained" : "outlined"}
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(svc);
                        }}
                      >
                        {isSelected ? "Selecionado" : "Selecionar"}
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        disabled={!isSelected}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProceed();
                        }}
                      >
                        Prosseguir
                      </Button>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  }, [loading, error, services, selectedId, handleSelect, handleProceed]);

  return (
    <Box id="servicos" sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <Container component="main" sx={{ py: { xs: 4, md: 6 }, flexGrow: 1 }}>
        <Box sx={{ textAlign: "center", mb: { xs: 3, md: 4 } }}>
          <Typography component="h1" variant="h3" sx={{ fontWeight: 800 }}>
            Nossos Serviços
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, opacity: 0.8 }}>
            Escolha um serviço para iniciar seu agendamento.
          </Typography>
        </Box>

        {gridOrError}
      </Container>

      <Footer />
    </Box>
  );
}