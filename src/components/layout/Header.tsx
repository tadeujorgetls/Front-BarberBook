import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import { Link as RouterLink } from "react-router-dom";

// Logo local (ajuste o caminho se seu arquivo tiver outro nome)
import logoImg from "../../assets/barberbook-img.jpg";

export default function Header() {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="transparent"
      sx={{ borderBottom: "1px solid #e5e7eb", backdropFilter: "blur(6px)" }}
    >
      <Toolbar sx={{ minHeight: 72, px: { xs: 2, sm: 3 } }}>
        {/* Logo + Nome */}
        <Box
          component={RouterLink}
          to="/"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            textDecoration: "none",
            color: "inherit",
          }}
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
            }}
          />
          <Typography
            variant="subtitle1"
            sx={{ display: { xs: "none", sm: "block" }, fontWeight: 700 }}
          >
            BarberBook
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Área do Cliente */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            component={RouterLink}
            to="/cliente"
            variant="outlined"
            startIcon={<PersonOutlineRoundedIcon />}
            aria-label="Ir para a Área do Cliente"
          >
            Área do Cliente
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}