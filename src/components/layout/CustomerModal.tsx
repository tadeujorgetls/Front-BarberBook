import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Visibility,
  VisibilityOff,
  Person,
  AssignmentInd,
  Phone,
  Email,
  Lock,
} from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function SejaClienteModal({ open, onClose }: Props) {
  const nav = useNavigate();
  const { signUp, loading, error, setError } = useAuth();
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  function maskCpf(v: string) {
    return v
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      .slice(0, 14);
  }

  function maskPhone(v: string) {
    return v
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d{1,4})$/, "$1-$2")
      .slice(0, 16);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError?.(null);
    await signUp({
      nome: nome.trim(),
      cpf: cpf.trim(),
      email: email.trim(),
      telefone: telefone.trim(),
      senha,
    });
    onClose();
    nav("/cliente");
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 0 }}>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          Seja Cliente
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Crie sua conta e agende em segundos
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={onSubmit}>
          <Grid
            container
            spacing={{ xs: 2, sm: 2.5 }}
            aria-label="Formulário de cadastro"
          >
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="CPF"
                value={cpf}
                onChange={(e) => setCpf(maskCpf(e.target.value))}
                required
                fullWidth
                placeholder="000.000.000-00"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AssignmentInd fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Telefone"
                value={telefone}
                onChange={(e) => setTelefone(maskPhone(e.target.value))}
                required
                fullWidth
                placeholder="(00) 00000-0000"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Senha"
                type={showPwd ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPwd((s) => !s)}
                        edge="end"
                        size="small"
                        aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showPwd ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  background: "#000",
                  color: "#fff",
                  fontWeight: 800,
                  textTransform: "none",
                  borderRadius: "14px",
                }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Criar conta e entrar"
                )}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  );
}