import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Container,
  Rating,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import Grid from "@mui/material/Grid";
import { useNavigate } from "react-router-dom";

import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

import { useBookingCtx } from "../context/BookingProvider";

type BackendBarber = {
  id: string;
  nome: string;
  telefone?: string | null;
};

type Barber = {
  id: string;
  name: string;
  photo: string;
  telefone?: string | null;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

// 👇 Gera ilustração não-humana estável por seed (id do barbeiro)
const getIllustrationUrl = (seed: string) =>
  `https://api.dicebear.com/9.x/bottts-neutral/png?seed=${encodeURIComponent(
    seed
  )}&size=480&backgroundType=gradientLinear&radius=50`;

export default function BarbersPage() {
  const navigate = useNavigate();
  const { setBarber } = useBookingCtx();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/barbeiros`, {
          signal: ac.signal,
          mode: "cors",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: BackendBarber[] = await res.json();

        const mapped: Barber[] = data
          .map((b) => ({
            id: b.id,
            name: b.nome,
            // antes: pravatar (humano) -> agora: ilustração não-humana
            photo: getIllustrationUrl(b.id),
            telefone: b.telefone ?? null,
          }))
          .sort((a, z) => a.name.localeCompare(z.name, "pt-BR"));

        setBarbers(mapped);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        console.error(e);
        setError("Falha ao carregar a lista de barbeiros.");
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  const handleSelect = useCallback(
    (b: Barber) => {
      setSelectedId(b.id);
      setBarber({ id: b.id, name: b.name, photo: b.photo });
    },
    [setBarber],
  );

  const handleProceed = useCallback(() => {
    if (!selectedId) return;
    navigate("/agendamento");
  }, [navigate, selectedId]);

  const content = useMemo(() => {
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
      <Grid container spacing={{ xs: 2, sm: 3 }} component="section" aria-label="Lista de barbeiros">
        {barbers.map((b) => {
          const isSelected = selectedId === b.id;
          return (
            <Grid key={b.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card
                elevation={0}
                sx={{
                  border: isSelected ? "2px solid #0284c7" : "1px solid #e5e7eb",
                  borderRadius: 3,
                  overflow: "hidden",
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
                <CardActionArea component="div" onClick={() => handleSelect(b)}>
                  <CardMedia
                    component="img"
                    height="220"
                    image={b.photo}
                    alt={`Imagem ilustrativa de ${b.name}`}
                    loading="lazy"
                    sx={{ objectFit: "cover" }}
                  />

                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                      {b.name}
                    </Typography>

                    <Box sx={{ mt: 0.5, display: "flex", justifyContent: "center" }}>
                      <Rating
                        name={`rating-${b.id}`}
                        value={5}
                        max={5}
                        readOnly
                        icon={<StarRoundedIcon fontSize="inherit" />}
                        emptyIcon={<StarRoundedIcon fontSize="inherit" />}
                        aria-label="Avaliação 5 de 5 estrelas"
                      />
                    </Box>

                    {b.telefone && (
                      <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.8 }}>
                        {b.telefone}
                      </Typography>
                    )}

                    <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
                      <Button
                        variant={isSelected ? "contained" : "outlined"}
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(b);
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
  }, [barbers, error, handleProceed, handleSelect, loading, selectedId]);

  return (
    <Box id="barbeiros" sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <Container component="main" sx={{ py: { xs: 4, md: 6 }, flexGrow: 1 }}>
        <Box sx={{ textAlign: "center", mb: { xs: 3, md: 4 } }}>
          <Typography component="h1" variant="h3" sx={{ fontWeight: 800 }}>
            Nosso Time
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, opacity: 0.8 }}>
            Conheça os profissionais que vão cuidar do seu visual.
          </Typography>
        </Box>

        {content}
      </Container>

      <Footer />
    </Box>
  );
}