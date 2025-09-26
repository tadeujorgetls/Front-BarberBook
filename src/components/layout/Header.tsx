import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../../assets/barberbook-img.jpg";
import SejaClienteModal from "./CustomerModal";

type NavItem = { id: "inicio" | "servicos" | "profissionais"; label: string; };

const NAV: NavItem[] = [
  { id: "inicio", label: "Início" },
  { id: "servicos", label: "Serviços" },
  { id: "profissionais", label: "Profissionais" },
];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSejaCliente, setOpenSejaCliente] = useState(false);

  const goToSection = (id: NavItem["id"]) => {
    const go = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.replaceState(null, "", `#${id}`);
      }
    };

    if (location.pathname !== "/") {
      navigate("/", { replace: false });
      setTimeout(go, 50);
    } else {
      go();
    }
  };

  const isActive = (id: NavItem["id"]) => (location.hash || "#inicio") === `#${id}`;

  const goCliente = () => {
    const token = localStorage.getItem("bb_token");
    navigate(token ? "/cliente" : "/login");
  };

  return (
    <>
      <AppBar position="sticky" elevation={0}
        sx={{ bgcolor: "#0b0f0b", borderBottom: "1px solid rgba(198,161,91,0.35)" }}>
        <Container>
          <Toolbar disableGutters sx={{ display: "flex", justifyContent: "space-between" }}>
            {/* LOGO */}
            <Button
              onClick={() => goToSection("inicio")}
              sx={{ p: 0, minWidth: 0, display: "flex", alignItems: "center", gap: 1.25 }}
            >
              <img src={logo} alt="BarberBook" width={28} height={28} style={{ borderRadius: "50%" }} />
              <Typography variant="h6" sx={{ fontWeight: 900, color: "var(--text-ivory)" }}>
                BARBERBOOK
              </Typography>
            </Button>

            {/* NAV */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {NAV.map((item) => (
                <Button
                  key={item.id}
                  onClick={() => goToSection(item.id)}
                  sx={{
                    position: "relative",
                    mx: 0.75,
                    px: 0.25,
                    color: "var(--text-ivory)",
                    fontWeight: 800,
                    textTransform: "none",
                    fontSize: "0.95rem",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      left: 0, right: 0, bottom: -2, height: "1px",
                      background: "var(--gold)",
                      opacity: isActive(item.id) ? 1 : 0.5,
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}

              {/* Área do Cliente */}
              <Button
                onClick={goCliente}
                variant="outlined"
                sx={{
                  ml: 1.5,
                  fontWeight: 800,
                  color: "var(--gold)",
                  borderColor: "var(--gold)",
                  textTransform: "none",
                  "&:hover": { background: "rgba(198,161,91,0.12)", borderColor: "var(--gold)" },
                }}
              >
                Área do Cliente
              </Button>

              {/* Seja Cliente */}
              <Button
                onClick={() => setOpenSejaCliente(true)}
                sx={{
                  ml: 1,
                  fontWeight: 800,
                  color: "var(--text-ivory)",
                  textTransform: "none",
                  "&:hover": { color: "var(--gold)" },
                }}
              >
                Seja Cliente
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <SejaClienteModal open={openSejaCliente} onClose={() => setOpenSejaCliente(false)} />
    </>
  );
}