import { Box, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{ py: 3, textAlign: "center", borderTop: "1px solid #e5e7eb" }}
    >
      <Typography variant="body2">
        2025. Todos os direitos reservados à BarberBook
      </Typography>
    </Box>
  );
}