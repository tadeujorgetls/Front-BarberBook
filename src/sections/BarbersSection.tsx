import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, Card, CardActionArea, CardContent, Container, Typography, CircularProgress, Alert, Avatar } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useBookingCtx } from "../context/BookingProvider";

type BackendBarber = { id: string; nome: string; telefone?: string | null; fotoUrl?: string | null };
type Barber = { id: string; name: string; telefone?: string | null; photo?: string | null };

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

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

export default function BarbersSection() {
  const { setBarber } = useBookingCtx();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true); setError(null);
        const res = await fetch(`${API_BASE}/barbeiros`, { signal: ac.signal, mode: "cors" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: BackendBarber[] = await res.json();
        const mapped: Barber[] = data
          .map((b) => ({ id: b.id, name: b.nome, telefone: b.telefone ?? null, photo: b.fotoUrl ?? null }))
          .sort((a, z) => a.name.localeCompare(z.name, "pt-BR"));
        setBarbers(mapped);
      } catch (e: any) {
        if (e?.name !== "AbortError") setError("Falha ao carregar a lista de barbeiros.");
      } finally { setLoading(false); }
    })();
    return () => ac.abort();
  }, []);

  const handleSelect = useCallback((b: Barber) => {
    setSelectedId(b.id);
    setBarber({ id: b.id, name: b.name, photo: b.photo ?? "" });
  }, [setBarber]);

  const handleProceed = useCallback(() => {
    document.querySelector("#agendamento")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const content = useMemo(() => {
    if (loading) return <Box sx={{ display: "grid", placeItems: "center", py: 5 }}><CircularProgress /></Box>;
    if (error) return <Box sx={{ maxWidth: 640, mx: "auto", mb: 2.5 }}><Alert severity="error">{error}</Alert></Box>;
    return (
      <Grid container spacing={{ xs: 2, sm: 2.5 }} aria-label="Lista de barbeiros">
        {barbers.map((b) => {
          const isSelected = selectedId === b.id;
          return (
            <Grid key={b.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card
                elevation={0}
                className="paper-card card-raise"
                sx={{ borderColor: isSelected ? "var(--gold)" : "rgba(198,161,91,0.5)" }}
              >
                <CardActionArea component="div" onClick={() => handleSelect(b)}>
                  <CardContent sx={{ p: 2.25, textAlign: "center" }}>
                    {b.photo ? (
                      <img
                        src={b.photo}
                        alt={`Retrato de ${b.name}`}
                        height={220}
                        style={{ width: "100%", objectFit: "cover", borderRadius: 12, border: "1px solid var(--gold)" }}
                        loading="lazy"
                      />
                    ) : (
                      <Monogram name={b.name} />
                    )}

                    <Typography variant="h6" component="h2" sx={{ fontWeight: 800, mt: 1.1, color: "var(--text)" }}>
                      {b.name}
                    </Typography>

                    {b.telefone && (
                      <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9, color: "var(--steel)" }}>
                        {b.telefone}
                      </Typography>
                    )}

                    <Box sx={{ mt: 1.5, display: "flex", justifyContent: "space-between" }}>
                      <Button
                        variant={isSelected ? "contained" : "outlined"}
                        size="small"
                        onClick={(e) => { e.stopPropagation(); handleSelect(b); }}
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
  }, [barbers, loading, error, selectedId, handleSelect, handleProceed]);

  return (
    <Box id="profissionais" className="bg-textured" sx={{ py: { xs: 4, md: 5 } }}>
      <Container>
        <Box sx={{ textAlign: "center", mb: { xs: 2.5, md: 3 }, color: "var(--text-ivory)" }}>
          <Typography component="h2" variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
            Nosso Time
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Barbeiros experientes, atendimento de clube.
          </Typography>
        </Box>
        {content}
      </Container>
    </Box>
  );
}