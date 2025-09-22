import { Box, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      className="bg-darkbar"
      sx={{
        py: 3.5,
        textAlign: "center",
        borderTop: "1px solid rgba(198,161,91,0.35)",
        mt: 5,
        color: "var(--text-ivory)",
      }}
    >
      <Typography
        variant="overline"
        sx={{ letterSpacing: "0.12em", opacity: 1, fontWeight: 700 }}
      >
        BARBERBOOK — GENTLEMAN’S GROOMING
      </Typography>

      <div className="gold-divider" style={{ margin: "10px auto 10px", maxWidth: 360 }} />

      <Typography variant="body2" sx={{ opacity: 0.95 }}>
        2025. Todos os direitos reservados.
      </Typography>
    </Box>
  );
}