import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, Card, CardActionArea, CardContent, Container, Typography, CircularProgress, Alert } from "@mui/material";
import Grid from "@mui/material/Grid";
import ContentCutRoundedIcon from "@mui/icons-material/ContentCutRounded";
import { useBookingCtx } from "../context/BookingProvider";

type BackendServico = { id: number | string; nome: string; duracao: number; preco: number; };
type Service = { id: string; name: string; price: string; duration: string; };

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

function formatBRL(v: number) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v); }
function formatDuration(min: number) {
  const h = Math.floor(min / 60), m = min % 60;
  if (!h) return `${m}min`;
  if (!m) return `${h}h00min`;
  return `${h}h${String(m).padStart(2, "0")}min`;
}

export default function ServicesSection() {
  const { setService } = useBookingCtx();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true); setError(null);
        const res = await fetch(`${API_BASE}/servicos`, { signal: ac.signal, mode: "cors" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: BackendServico[] = await res.json();
        setServices(
          data.map(s => ({ id: String(s.id), name: s.nome, price: formatBRL(Number(s.preco)), duration: formatDuration(Number(s.duracao)) }))
              .sort((a, z) => a.name.localeCompare(z.name, "pt-BR"))
        );
      } catch (e: any) { if (e?.name !== "AbortError") setError("Falha ao carregar serviços."); }
      finally { setLoading(false); }
    })();
    return () => ac.abort();
  }, []);

  const handleSelect = useCallback((svc: Service) => { setSelectedId(svc.id); setService(svc); }, [setService]);
  const handleProceed = useCallback(() => { document.querySelector("#profissionais")?.scrollIntoView({ behavior: "smooth" }); }, []);

  const grid = useMemo(() => {
    if (loading) return <Box sx={{ display: "grid", placeItems: "center", py: 5 }}><CircularProgress /></Box>;
    if (error) return <Box sx={{ maxWidth: 640, mx: "auto", mb: 2.5 }}><Alert severity="error">{error}</Alert></Box>;
    return (
      <Grid container spacing={{ xs: 2, sm: 2.5 }} aria-label="Lista de serviços">
        {services.map((svc) => {
          const isSelected = selectedId === svc.id;
          return (
            <Grid key={svc.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card
                elevation={0}
                className="paper-card card-raise"
                sx={{ borderColor: isSelected ? "var(--gold)" : "rgba(198,161,91,0.5)" }}
              >
                <CardActionArea component="div" onClick={() => handleSelect(svc)}>
                  <CardContent sx={{ p: 2.25 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 0.75 }}>
                      <ContentCutRoundedIcon aria-hidden sx={{ mr: 1, color: "var(--gold)" }} />
                      <Typography variant="h6" component="h2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                        {svc.name}
                      </Typography>
                    </Box>

                    <Typography variant="caption" sx={{ color: "var(--steel)" }}>
                      Serviço executado com toalha quente e finalização premium.
                    </Typography>

                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 800 }}>{svc.price}</Typography>
                      <Typography variant="body2" sx={{ color: "var(--steel)" }}>• {svc.duration}</Typography>
                    </Box>

                    <Box sx={{ mt: 1.5, display: "flex", justifyContent: "space-between" }}>
                      <Button
                        variant={isSelected ? "contained" : "outlined"}
                        size="small"
                        onClick={(e) => { e.stopPropagation(); handleSelect(svc); }}
                        sx={{
                          fontWeight: 700,
                          ...(isSelected
                            ? { bgcolor: "var(--primary)", "&:hover": { bgcolor: "#0a360d" } }
                            : { color: "var(--gold)", borderColor: "var(--gold)", "&:hover": { background: "rgba(198,161,91,0.12)", borderColor: "var(--gold)" } }),
                        }}
                      >
                        {isSelected ? "Selecionado" : "Selecionar"}
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={!isSelected}
                        onClick={(e) => { e.stopPropagation(); handleProceed(); }}
                        sx={{
                          fontWeight: 700,
                          color: "var(--gold)",
                          borderColor: "var(--gold)",
                          "&:hover": { background: "rgba(198,161,91,0.12)", borderColor: "var(--gold)" },
                          opacity: isSelected ? 1 : 0.6,
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
    <Box id="servicos" className="bg-textured" sx={{ py: { xs: 4, md: 5 } }}>
      <Container>
        <Box sx={{ textAlign: "center", mb: { xs: 2.5, md: 3 }, color: "var(--text-ivory)" }}>
          <Typography component="h2" variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
            Nossos Serviços
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.95 }}>
            Corte clássico, barba alinhada e rituais de barbearia.
          </Typography>
        </Box>
        {grid}
      </Container>
    </Box>
  );
}