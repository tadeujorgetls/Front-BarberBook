import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import { Link as RouterLink, useLocation } from "react-router-dom";
import logoImg from "../../assets/barberbook-img.jpg";

export default function Header() {
  const { hash, pathname } = useLocation();
  const navActive = (id: string) => hash === id || (id === "#calendario" && (hash === "" || pathname === "/"));

  const NavBtn = ({ href, label }: { href: string; label: string }) => (
    <Button
      component="a"
      href={href}
      color="inherit"
      sx={{
        fontWeight: 700,
        color: "var(--text-ivory)",
        position: "relative",
        "&::after": {
          content: '""',
          position: "absolute",
          left: 12,
          right: 12,
          bottom: 6,
          height: 2,
          background: navActive(href) ? "var(--gold)" : "transparent",
          transition: "all .2s ease",
        },
        "&:hover::after": { background: "var(--gold)" },
      }}
    >
      {label}
    </Button>
  );

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: "rgba(15,17,16,0.95)",
        borderBottom: "1px solid rgba(198,161,91,0.35)",
        color: "var(--text-ivory)",
      }}
    >
      <Toolbar sx={{ minHeight: 64, px: { xs: 2, sm: 3 } }}>
        <Box
          component={RouterLink}
          to="/"
          sx={{ display: "flex", alignItems: "center", gap: 1, textDecoration: "none", color: "inherit" }}
          aria-label="Voltar para a página inicial"
        >
          <img
            src={logoImg}
            alt="Logo BarberBook"
            style={{
              width: 36,
              height: 36,
              objectFit: "cover",
              borderRadius: "50%",
              border: "1px solid var(--gold)",
              boxShadow: "0 0 0 2px rgba(198,161,91,0.15)",
            }}
          />
          <Typography variant="subtitle1" sx={{ display: { xs: "none", sm: "block" }, fontWeight: 800, letterSpacing: "0.04em" }}>
            BarberBook
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
          <NavBtn href="#calendario" label="Início" />
          <NavBtn href="#servicos" label="Serviços" />
          <NavBtn href="#profissionais" label="Profissionais" />
          <NavBtn href="#agendamento" label="Agendar" />
        </Box>

        <Box sx={{ flexGrow: { xs: 0, md: 0 } }} />

        <Button
          component={RouterLink}
          to="/cliente"
          variant="outlined"
          startIcon={<PersonOutlineRoundedIcon />}
          aria-label="Ir para a Área do Cliente"
          sx={{
            ml: { md: 2 },
            color: "var(--gold)",
            borderColor: "var(--gold)",
            fontWeight: 800,
            "&:hover": {
              borderColor: "var(--gold)",
              background: "rgba(198,161,91,0.12)",
            },
          }}
        >
          Área do Cliente
        </Button>
      </Toolbar>
    </AppBar>
  );
}