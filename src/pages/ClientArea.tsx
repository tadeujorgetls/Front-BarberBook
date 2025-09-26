import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  Stack,
  Container,
  Divider,
} from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useNavigate } from "react-router-dom";
import { clearSession, getUser, type UserView } from "../services/auth";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

type RecentService = {
  id: string;
  titulo: string;
  data: string;
  iniciais: string;
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

function formatBRDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("pt-BR");
}

export default function ClientAreaPage() {
  const nav = useNavigate();
  const [user, setUser] = useState<UserView | null>(getUser());

  useEffect(() => {
    const update = () => setUser(getUser());
    window.addEventListener("bb-auth-changed", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("bb-auth-changed", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  useEffect(() => {
    if (!user) nav("/login", { replace: true });
  }, [user, nav]);

  const handleLogout = useCallback(() => {
    clearSession();
    nav("/login", { replace: true });
  }, [nav]);

  const avatarText = useMemo(() => initials(user?.nome || "C"), [user]);

  const recentes = useMemo<RecentService[]>(
    () => [
      { id: "1", titulo: "Corte de Cabelo — Carlos Silva", data: "2025-08-10", iniciais: "CS" },
      { id: "2", titulo: "Barba — João Pereira", data: "2025-07-15", iniciais: "JP" },
      { id: "3", titulo: "Corte + Barba — Rafael Souza", data: "2025-06-20", iniciais: "RS" },
    ],
    []
  );

  if (!user) {
    return (
      <Box sx={{ minHeight: "100svh", display: "flex", flexDirection: "column" }}>
        <Header />
        <Container sx={{ flex: 1, py: 6, textAlign: "center" }}>
          <Alert severity="info">Redirecionando…</Alert>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100svh", display: "flex", flexDirection: "column" }}>
      <Header />

      <Box component="main" sx={{ flex: 1, py: { xs: 3, md: 5 } }}>
        <Container>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { md: "420px 1fr" },
              gap: 3,
              maxWidth: 1100,
              mx: "auto",
            }}
          >
            <Card
              elevation={0}
              className="paper-card"
              sx={{
                borderRadius: "24px",
                borderColor: "var(--gold)",
                background: "var(--paper)",
                color: "var(--text)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      fontWeight: 900,
                      bgcolor: "var(--primary)",
                      color: "#fff",
                    }}
                  >
                    {avatarText}
                  </Avatar>

                  <Box>
                    <Typography variant="caption" sx={{ color: "rgba(20,22,19,0.65)" }}>
                      Cliente
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
                      {user.nome}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "rgba(20,22,19,0.75)" }}>
                      {user.email}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "rgba(20,22,19,0.75)" }}>
                      {user.telefone}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 1.5, borderColor: "var(--gold)", opacity: 0.6 }} />

                <Box sx={{ display: "grid", gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<EditRoundedIcon />}
                    sx={{
                      background: "var(--primary)",
                      textTransform: "none",
                      fontWeight: 800,
                      borderRadius: "999px",
                      "&:hover": {
                        background: "color-mix(in srgb, var(--primary) 90%, black)",
                      },
                    }}
                    onClick={() => {
                    }}
                  >
                    Editar Dados
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<LogoutRoundedIcon />}
                    onClick={handleLogout}
                    sx={{
                      textTransform: "none",
                      fontWeight: 800,
                      borderRadius: "999px",
                      borderColor: "var(--gold)",
                      color: "var(--text)",
                      "&:hover": { borderColor: "var(--gold)", background: "var(--hover-ivory)" },
                    }}
                  >
                    Sair
                  </Button>
                </Box>
              </CardContent>
            </Card>

            <Card
              elevation={0}
              className="paper-card"
              sx={{
                borderRadius: "24px",
                borderColor: "var(--gold)",
                background: "var(--paper)",
                color: "var(--text)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  Serviços Recentes
                </Typography>
                <Typography variant="body2" sx={{ color: "rgba(20,22,19,0.75)", mt: 0.5 }}>
                  Refaça seu serviço preferido em segundos.
                </Typography>

                <Stack spacing={1.25} sx={{ mt: 2 }}>
                  {recentes.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "auto 1fr auto",
                        alignItems: "center",
                        gap: 1.25,
                        px: 1.25,
                        py: 1,
                        borderRadius: "999px",
                        border: "1px solid rgba(198,161,91,0.6)",
                        background: "#fff",
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 34,
                          height: 34,
                          bgcolor: "var(--primary)",
                          color: "#fff",
                          fontWeight: 800,
                        }}
                      >
                        {item.iniciais}
                      </Avatar>

                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 800, lineHeight: 1.2 }}
                          noWrap
                          title={item.titulo}
                        >
                          {item.titulo}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "rgba(20,22,19,0.75)" }}>
                          {formatBRDate(item.data)}
                        </Typography>
                      </Box>

                      <Button
                        variant="outlined"
                        endIcon={<ArrowForwardRoundedIcon />}
                        sx={{
                          borderRadius: "999px",
                          textTransform: "none",
                          fontWeight: 800,
                          px: 2,
                          py: 0.5,
                          borderColor: "var(--gold)",
                          color: "var(--text)",
                          "&:hover": {
                            borderColor: "var(--gold)",
                            background: "var(--hover-ivory)",
                          },
                        }}
                        onClick={() => {
                        }}
                      >
                        Agendar rapidamente
                      </Button>
                    </Box>
                  ))}
                </Stack>

                <Typography
                  variant="caption"
                  sx={{ color: "rgba(20,22,19,0.75)", display: "block", mt: 1.5 }}
                >
                  Dica: clique em “Agendar rapidamente” para pular etapas (vamos direto ao horário e ao pagamento).
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}